/**
 * src/utils/imageProcessor.js
 * OpenCV.js logic for SketchLens
 *
 * Hybrid approach: uses contours to ORDER pixels (big shapes → details)
 * but distributes raw pixels evenly to guarantee exactly N steps.
 */

export const processImageWithOpenCV = async (imageElement, stepCount) => {
  if (!window.cv || typeof window.cv.imread !== 'function') {
    throw new Error('OpenCV.js not loaded yet');
  }

  const cv = window.cv;
  let src = cv.imread(imageElement);

  // 1. Downscale to max 1200px on the longest side
  const maxSize = 1200;
  let width = src.cols;
  let height = src.rows;

  if (width > maxSize || height > maxSize) {
    const scale = maxSize / Math.max(width, height);
    const newWidth = Math.round(width * scale);
    const newHeight = Math.round(height * scale);
    let resized = new cv.Mat();
    cv.resize(src, resized, new cv.Size(newWidth, newHeight), 0, 0, cv.INTER_AREA);
    src.delete();
    src = resized;
    width = newWidth;
    height = newHeight;
  }

  // 2. Grayscale → CLAHE → Blur → Canny
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
  let enhanced = new cv.Mat();
  clahe.apply(gray, enhanced);

  let blurred = new cv.Mat();
  cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 40, 120);

  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  cv.dilate(edges, edges, kernel);

  // 3. Find contours and sort by area (largest/structural first → smallest/detail last)
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_NONE);

  const contourAreas = [];
  for (let i = 0; i < contours.size(); i++) {
    contourAreas.push({ index: i, area: cv.contourArea(contours.get(i)) });
  }
  contourAreas.sort((a, b) => b.area - a.area); // Largest first

  // 4. For each contour (in importance order), stamp it onto a mask and collect
  //    the NEW edge pixels it covers. This orders pixels by drawing importance
  //    while guaranteeing every edge pixel is included exactly once.
  const claimed = new Uint8Array(width * height); // tracks which pixels are taken
  const orderedPixels = [];

  for (const { index } of contourAreas) {
    // Draw this single contour onto a temporary mask
    let mask = cv.Mat.zeros(height, width, cv.CV_8U);
    cv.drawContours(mask, contours, index, new cv.Scalar(255), 2, cv.LINE_8, hierarchy, 0);

    const maskData = mask.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        if (maskData[pos] > 0 && !claimed[pos]) {
          // This pixel is on this contour AND hasn't been claimed yet
          orderedPixels.push({ x, y });
          claimed[pos] = 1;
        }
      }
    }
    mask.delete();
  }

  // 5. Catch any remaining edge pixels not covered by contours
  const edgeData = edges.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (edgeData[pos] > 0 && !claimed[pos]) {
        orderedPixels.push({ x, y });
      }
    }
  }

  console.log(`[SketchLens] Total ordered pixels: ${orderedPixels.length}, splitting into ${stepCount} steps`);

  // 6. Create cumulative step images — perfectly even distribution
  const stepImages = [];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  let imgData = ctx.getImageData(0, 0, width, height);

  for (let step = 0; step < stepCount; step++) {
    const startIdx = Math.floor((step / stepCount) * orderedPixels.length);
    const endIdx = Math.floor(((step + 1) / stepCount) * orderedPixels.length);

    for (let i = startIdx; i < endIdx; i++) {
      const px = orderedPixels[i];
      const idx = (px.y * width + px.x) * 4;
      imgData.data[idx] = 0;       // R
      imgData.data[idx + 1] = 0;   // G
      imgData.data[idx + 2] = 0;   // B
      imgData.data[idx + 3] = 255; // A
    }

    ctx.putImageData(imgData, 0, 0);
    stepImages.push(canvas.toDataURL('image/png'));

    console.log(`[SketchLens] Step ${step + 1}: pixels ${startIdx}–${endIdx} (${endIdx - startIdx} new)`);
  }

  // Cleanup
  src.delete();
  gray.delete();
  enhanced.delete();
  clahe.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();

  return stepImages;
};
