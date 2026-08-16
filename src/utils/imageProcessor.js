/**
 * src/utils/imageProcessor.js
 * OpenCV.js logic for SketchLens
 *
 * Coherent line drawing with tiered step ownership.
 * Decomposed into small testable functions:
 *   preprocessImage        → bilateral-filtered grayscale
 *   extractBlockInPolygon  → Tier 1 (clean polygon outline)
 *   extractLineTiers       → Tiers 2 & 3 (secondary lines + fine detail)
 *   orderTierPixels        → connected-component pixel ordering (reused per tier)
 *   allocateStepsToTiers   → per-tier step ranges
 *   renderCumulativeSteps  → data-URL step images
 */

import {
  MAX_IMAGE_SIZE,
  BILATERAL_D,
  BILATERAL_SIGMA_COLOR,
  BILATERAL_SIGMA_SPACE,
  CONTOUR_CANNY_LOW,
  CONTOUR_CANNY_HIGH,
  POLYGON_EPSILON_FACTOR,
  POLYGON_LINE_THICKNESS,
  MIN_STRUCTURAL_AREA_FRACTION,
  DETAIL_CANNY_LOW,
  DETAIL_CANNY_HIGH,
  MORPH_CLOSE_KERNEL_SIZE,
  MIN_COMPONENT_AREA,
  SECONDARY_AREA_FRACTION,
  ADAPTIVE_BLOCK_SIZE,
  ADAPTIVE_C,
  TIER_WEIGHTS,
} from './imageProcessor.constants.js';


// ─── Public API (same signature as before) ───────────────────────────────────

export const processImageWithOpenCV = async (imageElement, stepCount) => {
  if (!window.cv || typeof window.cv.imread !== 'function') {
    throw new Error('OpenCV.js not loaded yet');
  }
  const cv = window.cv;

  // 1. Preprocess
  const pre = preprocessImage(cv, imageElement);

  // 2. Tier 1 — structural polygon outline
  const structuralMask = extractBlockInPolygon(cv, pre.denoised, pre.width, pre.height);

  // 3. Tiers 2 & 3 — secondary lines + fine detail
  const { secondaryMask, fineMask } = extractLineTiers(
    cv, pre.denoised, structuralMask, pre.width, pre.height
  );

  // 4. Order pixels within each tier by connected-component area
  const tierPixels = [
    orderTierPixels(cv, structuralMask, pre.width, pre.height),
    orderTierPixels(cv, secondaryMask, pre.width, pre.height),
    orderTierPixels(cv, fineMask, pre.width, pre.height),
  ];

  console.log(
    `[SketchLens] Tier pixel counts: structural=${tierPixels[0].length}, ` +
    `secondary=${tierPixels[1].length}, fine=${tierPixels[2].length}`
  );

  // For stepCount == 2: merge structural + secondary into one outline tier
  if (stepCount === 2 && tierPixels[0].length > 0 && tierPixels[1].length > 0) {
    tierPixels[0] = tierPixels[0].concat(tierPixels[1]);
    tierPixels[1] = [];
  }

  // 5. Allocate steps to tiers
  const tierSteps = allocateStepsToTiers(stepCount, tierPixels);
  console.log(
    `[SketchLens] Step allocation: structural=${tierSteps[0]}, ` +
    `secondary=${tierSteps[1]}, fine=${tierSteps[2]}`
  );

  // 6. Render cumulative step images
  const stepImages = renderCumulativeSteps(
    pre.src, tierPixels, tierSteps, pre.width, pre.height
  );

  // Cleanup
  pre.src.delete();
  pre.gray.delete();
  pre.denoised.delete();
  structuralMask.delete();
  secondaryMask.delete();
  fineMask.delete();

  return stepImages;
};


// ─── Step 1: Preprocessing ──────────────────────────────────────────────────

function preprocessImage(cv, imageElement) {
  let src = cv.imread(imageElement);

  // Downscale to max dimension
  let width = src.cols;
  let height = src.rows;

  if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
    const scale = MAX_IMAGE_SIZE / Math.max(width, height);
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);
    let resized = new cv.Mat();
    cv.resize(src, resized, new cv.Size(newWidth, newHeight), 0, 0, cv.INTER_AREA);
    src.delete();
    src = resized;
    width = newWidth;
    height = newHeight;
  }

  // Grayscale
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Bilateral filter — preserves edges while suppressing noise
  // (replaces CLAHE + GaussianBlur from previous version)
  let denoised = new cv.Mat();
  cv.bilateralFilter(gray, denoised, BILATERAL_D, BILATERAL_SIGMA_COLOR, BILATERAL_SIGMA_SPACE);

  return { src, gray, denoised, width, height };
}


// ─── Step 2: Tier 1 — Structural polygon outline ───────────────────────────

function extractBlockInPolygon(cv, denoised, width, height) {
  // Loose Canny to capture one continuous silhouette
  let edgesForContour = new cv.Mat();
  cv.Canny(denoised, edgesForContour, CONTOUR_CANNY_LOW, CONTOUR_CANNY_HIGH);

  // Find external contours only
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edgesForContour, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  edgesForContour.delete();

  // Pick largest-area external contour
  let bestIdx = -1;
  let bestArea = 0;
  const minArea = width * height * MIN_STRUCTURAL_AREA_FRACTION;

  for (let i = 0; i < contours.size(); i++) {
    const area = cv.contourArea(contours.get(i));
    if (area > bestArea) {
      bestArea = area;
      bestIdx = i;
    }
  }

  let mask = cv.Mat.zeros(height, width, cv.CV_8U);

  if (bestIdx >= 0 && bestArea >= minArea) {
    // Simplify the contour to a polygon
    let mainContour = contours.get(bestIdx);
    let simplified = new cv.Mat();
    const epsilon = POLYGON_EPSILON_FACTOR * cv.arcLength(mainContour, true);
    cv.approxPolyDP(mainContour, simplified, epsilon, true);

    // Rasterize the simplified polygon onto the mask
    let polyVec = new cv.MatVector();
    polyVec.push_back(simplified);
    cv.polylines(mask, polyVec, true, new cv.Scalar(255), POLYGON_LINE_THICKNESS, cv.LINE_8);
    polyVec.delete();
    simplified.delete();
  } else {
    console.warn('[SketchLens] No structural contour found above minimum area — Tier 1 will be empty, Tier 2 absorbs outline');
  }

  contours.delete();
  hierarchy.delete();

  return mask;
}


// ─── Step 3: Tiers 2 & 3 — Secondary lines + Fine detail ───────────────────

function extractLineTiers(cv, denoised, structuralMask, width, height) {
  // Single tuned Canny pass for all line detail
  let rawEdges = new cv.Mat();
  cv.Canny(denoised, rawEdges, DETAIL_CANNY_LOW, DETAIL_CANNY_HIGH);

  // Morphological close to bridge small gaps
  let kernel = cv.Mat.ones(MORPH_CLOSE_KERNEL_SIZE, MORPH_CLOSE_KERNEL_SIZE, cv.CV_8U);
  let closed = new cv.Mat();
  cv.morphologyEx(rawEdges, closed, cv.MORPH_CLOSE, kernel);
  kernel.delete();
  rawEdges.delete();

  // Connected components with stats for pruning
  let labels = new cv.Mat();
  let stats = new cv.Mat();
  let centroids = new cv.Mat();
  const numLabels = cv.connectedComponentsWithStats(closed, labels, stats, centroids, 8, cv.CV_32S);

  // Prune small components (scatter noise) and remove structural-tier pixels
  let notStructural = new cv.Mat();
  cv.bitwise_not(structuralMask, notStructural);

  // Build pruned mask: keep only components above MIN_COMPONENT_AREA, minus structural
  let prunedMask = cv.Mat.zeros(height, width, cv.CV_8U);
  const closedData = closed.data;
  const labelsData = labels.data32S;
  const prunedData = prunedMask.data;
  const notStructData = notStructural.data;

  // Collect component areas and sort for the secondary/fine split
  const componentInfo = [];
  for (let label = 1; label < numLabels; label++) {
    const area = stats.intAt(label, cv.CC_STAT_AREA);
    if (area >= MIN_COMPONENT_AREA) {
      componentInfo.push({ label, area });
    }
  }
  componentInfo.sort((a, b) => b.area - a.area);

  // Mark valid pixels in pruned mask
  const validLabels = new Set(componentInfo.map(c => c.label));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (closedData[pos] > 0 && validLabels.has(labelsData[pos]) && notStructData[pos] > 0) {
        prunedData[pos] = 255;
      }
    }
  }

  const droppedCount = (numLabels - 1) - componentInfo.length;
  console.log(`[SketchLens] Pruned ${droppedCount} small components (below ${MIN_COMPONENT_AREA}px)`);

  // Split remaining components into secondary (top ~40% by area) and fine (bottom ~60%)
  let totalArea = componentInfo.reduce((sum, c) => sum + c.area, 0);
  let cumulativeArea = 0;
  const secondaryLabels = new Set();
  const fineLabels = new Set();

  for (const comp of componentInfo) {
    cumulativeArea += comp.area;
    if (cumulativeArea <= totalArea * SECONDARY_AREA_FRACTION) {
      secondaryLabels.add(comp.label);
    } else {
      fineLabels.add(comp.label);
    }
  }

  // Build secondary and fine masks
  let secondaryMask = cv.Mat.zeros(height, width, cv.CV_8U);
  let fineMask = cv.Mat.zeros(height, width, cv.CV_8U);
  const secData = secondaryMask.data;
  const fineData = fineMask.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (prunedData[pos] > 0) {
        const lbl = labelsData[pos];
        if (secondaryLabels.has(lbl)) {
          secData[pos] = 255;
        } else if (fineLabels.has(lbl)) {
          fineData[pos] = 255;
        }
      }
    }
  }

  // Add adaptive threshold shading pixels to fine tier (minus structural and secondary)
  let shadingStrokes = new cv.Mat();
  cv.adaptiveThreshold(
    denoised, shadingStrokes, 255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV,
    ADAPTIVE_BLOCK_SIZE, ADAPTIVE_C
  );

  // Subtract structural + secondary from shading strokes
  let claimed = new cv.Mat();
  cv.bitwise_or(structuralMask, secondaryMask, claimed);
  let notClaimed = new cv.Mat();
  cv.bitwise_not(claimed, notClaimed);
  let shadingClean = new cv.Mat();
  cv.bitwise_and(shadingStrokes, notClaimed, shadingClean);

  // Merge shading into fine mask
  cv.bitwise_or(fineMask, shadingClean, fineMask);

  // Cleanup
  closed.delete();
  labels.delete();
  stats.delete();
  centroids.delete();
  notStructural.delete();
  prunedMask.delete();
  shadingStrokes.delete();
  claimed.delete();
  notClaimed.delete();
  shadingClean.delete();

  return { secondaryMask, fineMask };
}


// ─── Step 4: Order pixels by connected component (reused per tier) ──────────

function orderTierPixels(cv, tierMask, width, height) {
  // Light dilate for grouping purposes only
  let dilated = new cv.Mat();
  let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  cv.dilate(tierMask, dilated, kernel, new cv.Point(-1, -1), 1);
  kernel.delete();

  // Connected components on dilated mask
  let labels = new cv.Mat();
  let stats = new cv.Mat();
  let centroids = new cv.Mat();
  const numLabels = cv.connectedComponentsWithStats(dilated, labels, stats, centroids);
  dilated.delete();

  // Sort by area, largest first (skip label 0 = background)
  const components = [];
  for (let label = 1; label < numLabels; label++) {
    const area = stats.intAt(label, cv.CC_STAT_AREA);
    components.push({ label, area });
  }
  components.sort((a, b) => b.area - a.area);

  // Collect ORIGINAL (non-dilated) edge pixels, ordered by component rank
  const maskData = tierMask.data;
  const labelsData = labels.data32S;
  const orderedPixels = [];
  const claimed = new Set();

  for (const { label } of components) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        if (labelsData[pos] === label && maskData[pos] > 0) {
          orderedPixels.push({ x, y });
          claimed.add(pos);
        }
      }
    }
  }

  // Catch stragglers not covered by any dilated component
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (maskData[pos] > 0 && !claimed.has(pos)) {
        orderedPixels.push({ x, y });
      }
    }
  }

  labels.delete();
  stats.delete();
  centroids.delete();

  return orderedPixels;
}


// ─── Step 5: Per-tier step allocation ───────────────────────────────────────

function allocateStepsToTiers(stepCount, tierPixels) {
  const tierCounts = tierPixels.map(p => p.length);
  const nonEmpty = tierCounts.filter(c => c > 0).length;

  if (stepCount <= 1 || nonEmpty <= 1) {
    const maxTier = tierCounts.indexOf(Math.max(...tierCounts));
    const allocation = [0, 0, 0];
    allocation[maxTier] = stepCount;
    return allocation;
  }

  if (stepCount === 2) {
    // Structural+secondary already merged upstream
    const first = tierCounts.findIndex(c => c > 0);
    const last = 2 - [...tierCounts].reverse().findIndex(c => c > 0);
    const allocation = [0, 0, 0];
    if (first === last) {
      allocation[first] = 2;
    } else {
      allocation[first] = 1;
      allocation[last] = 1;
    }
    return allocation;
  }

  // stepCount >= 3: each non-empty tier gets at least 1, remainder weighted
  const allocation = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    if (tierCounts[i] > 0) allocation[i] = 1;
  }

  let remaining = stepCount - allocation.reduce((a, b) => a + b, 0);

  if (remaining > 0) {
    const activeWeights = TIER_WEIGHTS.map((w, i) => tierCounts[i] > 0 ? w : 0);
    const totalWeight = activeWeights.reduce((a, b) => a + b, 0);

    if (totalWeight > 0) {
      const rawAlloc = activeWeights.map(w => (w / totalWeight) * remaining);
      const floored = rawAlloc.map(Math.floor);
      let leftover = remaining - floored.reduce((a, b) => a + b, 0);

      // Drift correction: give leftover to tiers with largest fractional parts
      const fractions = rawAlloc.map((r, i) => ({ i, frac: r - floored[i] }))
        .filter(f => tierCounts[f.i] > 0)
        .sort((a, b) => b.frac - a.frac);

      for (const f of fractions) {
        if (leftover <= 0) break;
        floored[f.i]++;
        leftover--;
      }

      for (let i = 0; i < 3; i++) {
        allocation[i] += floored[i];
      }
    }
  }

  return allocation;
}


// ─── Step 6: Cumulative rendering ───────────────────────────────────────────

function renderCumulativeSteps(src, tierPixels, tierSteps, width, height) {
  const stepImages = [];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  let imgData = ctx.getImageData(0, 0, width, height);
  const srcData = src.data;

  let globalStep = 0;
  for (let tier = 0; tier < 3; tier++) {
    const pixels = tierPixels[tier];
    const stepsForTier = tierSteps[tier];

    if (stepsForTier === 0) continue; // empty tier guard

    for (let s = 0; s < stepsForTier; s++) {
      const startIdx = Math.floor((s / stepsForTier) * pixels.length);
      const endIdx = Math.floor(((s + 1) / stepsForTier) * pixels.length);

      for (let i = startIdx; i < endIdx; i++) {
        const px = pixels[i];
        const idx = (px.y * width + px.x) * 4;
        imgData.data[idx] = srcData[idx];         // R
        imgData.data[idx + 1] = srcData[idx + 1]; // G
        imgData.data[idx + 2] = srcData[idx + 2]; // B
        imgData.data[idx + 3] = srcData[idx + 3]; // A
      }

      ctx.putImageData(imgData, 0, 0);
      stepImages.push(canvas.toDataURL('image/png'));

      globalStep++;
      console.log(
        `[SketchLens] Step ${globalStep} (tier ${tier + 1}, sub-step ${s + 1}/${stepsForTier}): ` +
        `pixels ${startIdx}–${endIdx} (${endIdx - startIdx} new)`
      );
    }
  }

  // Fallback: if no pixels at all, produce at least one blank step
  if (stepImages.length === 0) {
    stepImages.push(canvas.toDataURL('image/png'));
  }

  return stepImages;
}
