export interface GridFitGeometry {
  canvasWidth: number;
  canvasHeight: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  backgroundX: number;
  backgroundY: number;
  backgroundWidth: number;
  backgroundHeight: number;
  tileSize: number;
  scale: number;
}

const MAX_CANVAS_DIMENSION = 4096;

/**
 * Calculate shared tile geometry that contains the complete source image and
 * provides an overscanned cover image for filling any unused canvas area.
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

  const maxTileByDimension = Math.floor(MAX_CANVAS_DIMENSION / Math.max(cols, rows));
  const neededTileSize = Math.ceil(Math.max(sourceWidth / cols, sourceHeight / rows));
  const tileSize = Math.max(1, Math.min(neededTileSize, maxTileByDimension));
  const canvasWidth = cols * tileSize;
  const canvasHeight = rows * tileSize;
  const scale = Math.min(1, canvasWidth / sourceWidth, canvasHeight / sourceHeight);
  const imageWidth = sourceWidth * scale;
  const imageHeight = sourceHeight * scale;
  const backgroundScale = Math.max(canvasWidth / sourceWidth, canvasHeight / sourceHeight) * 1.08;
  const backgroundWidth = sourceWidth * backgroundScale;
  const backgroundHeight = sourceHeight * backgroundScale;

  return {
    canvasWidth,
    canvasHeight,
    imageX: (canvasWidth - imageWidth) / 2,
    imageY: (canvasHeight - imageHeight) / 2,
    imageWidth,
    imageHeight,
    backgroundX: (canvasWidth - backgroundWidth) / 2,
    backgroundY: (canvasHeight - backgroundHeight) / 2,
    backgroundWidth,
    backgroundHeight,
    tileSize,
    scale,
  };
}