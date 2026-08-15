/**
 * src/utils/imageProcessor.js
 * OpenCV.js logic for SketchLens
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

  // 2. Grayscale, CLAHE (Contrast Enhancement), Blur, and Canny Edge Detection
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  
  // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
  // This boosts local contrast so soft features (like the face) become visible to Canny
  let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
  let enhanced = new cv.Mat();
  clahe.apply(gray, enhanced);

  let blurred = new cv.Mat();
  cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

  let edges = new cv.Mat();
  // Using Canny now gives single-pixel lines (no double edges) 
  // and thanks to CLAHE, it won't miss the face!
  cv.Canny(blurred, edges, 40, 120);

  // Use MORPH_CLOSE to connect broken lines. 
  // (MORPH_OPEN was destroying the 1-pixel lines from Canny)
  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  cv.morphologyEx(edges, edges, cv.MORPH_CLOSE, kernel);

  // 3. Find Contours with RETR_TREE to get hierarchy
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

  // Parse hierarchy
  const contourData = [];
  for (let i = 0; i < contours.size(); ++i) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);
    const arcLength = cv.arcLength(contour, false);
    
    // Filter out tiny dots and noise
    if (arcLength < 20) continue;

    const hierarchyData = hierarchy.intPtr(0, i);
    const parent = hierarchyData[3];
    // Calculate "depth"
    let depth = 0;
    let currParent = parent;
    while (currParent !== -1) {
      depth++;
      currParent = hierarchy.intPtr(0, currParent)[3];
    }
    contourData.push({ index: i, depth, area });
  }

  kernel.delete();

  // 4. Group contours by depth (0 = outer, 1 = inner, etc.), then sort by area descending within each depth
  contourData.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    return b.area - a.area;
  });

  // 5. Divide into discrete steps based on `stepCount`
  const stepSize = Math.ceil(contourData.length / stepCount);
  const stepImages = [];
  
  // We want cumulative images (each step has previous lines + new lines)
  // Let's create a transparent canvas
  let currentImageMat = new cv.Mat.zeros(height, width, cv.CV_8UC4);
  const color = new cv.Scalar(0, 0, 0, 255); // Black

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  for (let step = 0; step < stepCount; step++) {
    const startIdx = step * stepSize;
    const endIdx = Math.min(startIdx + stepSize, contourData.length);
    
    if (startIdx >= contourData.length) break;

    for (let i = startIdx; i < endIdx; i++) {
      cv.drawContours(currentImageMat, contours, contourData[i].index, color, 2, cv.LINE_8, hierarchy, 0);
    }

    cv.imshow(canvas, currentImageMat);
    stepImages.push(canvas.toDataURL('image/png'));
  }

  // Cleanup
  src.delete();
  gray.delete();
  enhanced.delete();
  clahe.delete();
  blurred.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
  currentImageMat.delete();

  return stepImages;
};
