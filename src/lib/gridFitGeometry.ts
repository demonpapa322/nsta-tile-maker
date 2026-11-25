export interface GridFitGeometry {
  canvasWidth: number;
  canvasHeight: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  tileSize: number;
  scale: number;
}

const MAX_CANVAS_PIXELS = 2048 * 2048;
const MAX_CANVAS_DIMENSION = 4096;

/**
 * Calculate a square-tile canvas that contains the complete source image.
 * The image is never enlarged; excess canvas area is left for a neutral fill.
 */
export function calculateGridFitGeometry(
  sourceWidth: number,
  sourceHeight: number,
  cols: number,
  rows: number,
): GridFitGeometry {
  if (
    !Number.isFinite(sourceWidth) || sourceWidth < 1 ||
    !Number.isFinite(sourceHeight) || sourceHeight < 1 ||
    !Number.isInteger(cols) || cols < 1 ||
    !Number.isInteger(rows) || rows < 1 ||
    Math.floor(MAX_CANVAS_DIMENSION / Math.max(cols, rows)) < 1
  ) {
    throw new RangeError('Invalid image or grid dimensions');
  }

  const maxTileByPixels = Math.floor(Math.sqrt(MAX_CANVAS_PIXELS / (cols * rows)));
  const maxTileByDimension = Math.floor(MAX_CANVAS_DIMENSION / Math.max(cols, rows));
  const maxTileSize = Math.min(maxTileByPixels, maxTileByDimension);
  const neededTileSize = Math.ceil(Math.max(sourceWidth / cols, sourceHeight / rows));
  const tileSize = Math.max(1, Math.min(neededTileSize, maxTileSize));
  const canvasWidth = cols * tileSize;
  const canvasHeight = rows * tileSize;
  const scale = Math.min(1, canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const imageWidth = sourceWidth * scale;
  const imageHeight = sourceHeight * scale;

  return {
    canvasWidth,
    canvasHeight,
    imageX: (canvasWidth - imageWidth) / 2,
    imageY: (canvasHeight - imageHeight) / 2,
    imageWidth,
    imageHeight,
    tileSize,
    scale,
  };
}