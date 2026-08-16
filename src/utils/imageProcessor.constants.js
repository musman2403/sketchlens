/**
 * src/utils/imageProcessor.constants.js
 * Tunable parameters for SketchLens image processing.
 * Pull magic numbers here so they're adjustable without re-reading the algorithm.
 */

// --- Preprocessing ---
/** Max dimension (longest side) before downscaling */
export const MAX_IMAGE_SIZE = 1200;

/** Bilateral filter params — preserves edges while smoothing noise */
export const BILATERAL_D = 9;
export const BILATERAL_SIGMA_COLOR = 75;
export const BILATERAL_SIGMA_SPACE = 75;

// --- Tier 1: Structural (block-in polygon) ---
/** Canny thresholds for initial contour detection (loose to get full silhouette) */
export const CONTOUR_CANNY_LOW = 50;
export const CONTOUR_CANNY_HIGH = 150;

/** Epsilon factor for approxPolyDP (fraction of arc length) */
export const POLYGON_EPSILON_FACTOR = 0.01;

/** Rasterized polygon line thickness (px) */
export const POLYGON_LINE_THICKNESS = 3;

/** Minimum contour area (fraction of image area) to qualify as structural */
export const MIN_STRUCTURAL_AREA_FRACTION = 0.005;

// --- Tiers 2 & 3: Secondary + Fine ---
/** Single Canny pass thresholds for line detail */
export const DETAIL_CANNY_LOW = 40;
export const DETAIL_CANNY_HIGH = 120;

/** Morphological close kernel size to bridge small edge gaps */
export const MORPH_CLOSE_KERNEL_SIZE = 3;

/** Minimum connected component area (px) — components below this are pruned as scatter noise */
export const MIN_COMPONENT_AREA = 12;

/** Fraction of remaining component-area assigned to secondary tier (rest → fine) */
export const SECONDARY_AREA_FRACTION = 0.40;

/** Adaptive threshold params for fine shading/stroke detection */
export const ADAPTIVE_BLOCK_SIZE = 21;
export const ADAPTIVE_C = 4;

// --- Step allocation weights ---
/** Target weight per tier when distributing extra steps (structural / secondary / fine) */
export const TIER_WEIGHTS = [0.25, 0.35, 0.40];
