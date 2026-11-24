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

/**
 * Calculate a square-tile canvas that contains the complete source image.
 * The image is never enlarged; excess canvas area is left for a neutral fill.
 */
export function calculateGridFitGeometry(
  sourceWidth: number,
  sourceHeight: number,
  cols: number,
  rows: number,
  maxDimension = 2048,
): GridFitGeometry {
  if (
    !Number.isFinite(sourceWidth) || sourceWidth < 1 ||
    !Number.isFinite(sourceHeight) || sourceHeight < 1 ||
    !Number.isInteger(cols) || cols < 1 ||
    !Number.isInteger(rows) || rows < 1 ||
    !Number.isInteger(maxDimension) || maxDimension < Math.max(cols, rows)
  ) {
    throw new RangeError('Invalid image or grid dimensions');
  }

  const maxTileSize = Math.floor(maxDimension / Math.max(cols, rows));
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