/**
 * src/utils/imageProcessor.js
 * OpenCV.js logic for SketchLens
 * 
 * Uses raw edge pixels (not contours) to guarantee exactly N steps
 * with perfectly equal visual progress.
 */

export const processImageWithOpenCV = async (imageElement, stepCount) => {
  // Ensure OpenCV is loaded
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

  // 2. Grayscale, CLAHE, Blur, and Canny Edge Detection
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  
  let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
  let enhanced = new cv.Mat();
  clahe.apply(gray, enhanced);

  let blurred = new cv.Mat();
  cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

  let edges = new cv.Mat();
  cv.Canny(blurred, edges, 40, 120);

  // Thicken the edges slightly so the final sketch looks clean
  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  cv.dilate(edges, edges, kernel);

  // 3. Collect ALL edge pixel coordinates directly from the Canny output
  const edgePixels = [];
  const edgeData = edges.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edgeData[y * width + x] > 0) {
        edgePixels.push({ x, y });
      }
    }
  }

  console.log(`[SketchLens] Total edge pixels: ${edgePixels.length}, splitting into ${stepCount} steps`);

  // 4. Sort pixels by distance from center (draws outer structure first, inner details last)
  const cx = width / 2;
  const cy = height / 2;
  edgePixels.sort((a, b) => {
    const distA = (a.x - cx) * (a.x - cx) + (a.y - cy) * (a.y - cy);
    const distB = (b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy);
    return distB - distA; // Farthest pixels first (outer edges)
  });

  // 5. Create cumulative step images — each step adds exactly (totalPixels / stepCount) new pixels
  const stepImages = [];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Start with a white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Use ImageData for fast pixel manipulation
  let imgData = ctx.getImageData(0, 0, width, height);

  for (let step = 0; step < stepCount; step++) {
    const startIdx = Math.floor((step / stepCount) * edgePixels.length);
    const endIdx = Math.floor(((step + 1) / stepCount) * edgePixels.length);

    // Draw this step's batch of pixels onto the cumulative image
    for (let i = startIdx; i < endIdx; i++) {
      const px = edgePixels[i];
      const idx = (px.y * width + px.x) * 4;
      imgData.data[idx] = 0;       // R
      imgData.data[idx + 1] = 0;   // G
      imgData.data[idx + 2] = 0;   // B
      imgData.data[idx + 3] = 255; // A
    }

    ctx.putImageData(imgData, 0, 0);
    stepImages.push(canvas.toDataURL('image/png'));

    console.log(`[SketchLens] Step ${step + 1}: drew pixels ${startIdx}–${endIdx} (${endIdx - startIdx} new pixels)`);
  }

  // Cleanup OpenCV Mats
  src.delete();
  gray.delete();
  enhanced.delete();
  clahe.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();

  return stepImages;
};
