import { useMemo } from 'react';

interface FittingResult {
  // The computed visible area of the image that fits the grid
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  // Whether the image needs letterboxing/pillarboxing
  needsPadding: boolean;
  // The optimal output dimensions
  outputWidth: number;
  outputHeight: number;
  // Scale factor applied
  scale: number;
}

interface ImageFittingParams {
  imageWidth: number;
  imageHeight: number;
  cols: number;
  rows: number;
  maxTileSize?: number;
}

/**
 * Calculates the optimal fitting for an image into a grid
 * Uses contain-style behavior: preserves aspect ratio, centers content
 * Maximizes visible area while maintaining grid proportions
 */
export function calculateImageFitting({
  imageWidth,
  imageHeight,
  cols,
  rows,
  maxTileSize,
}: ImageFittingParams): FittingResult {
  const imageAspect = imageWidth / imageHeight;
  const gridAspect = cols / rows;
  
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;
  let needsPadding = false;
  
  // Calculate the largest area we can use while maintaining grid aspect ratio
  if (Math.abs(imageAspect - gridAspect) < 0.01) {
    // Aspects match closely - use full image
    sourceWidth = imageWidth;
    sourceHeight = imageHeight;
  } else if (imageAspect > gridAspect) {
    // Image is wider than grid aspect - crop sides (or add vertical padding)
    // We'll crop to maximize visible area
    sourceHeight = imageHeight;
    sourceWidth = imageHeight * gridAspect;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    // Image is taller than grid aspect - crop top/bottom (or add horizontal padding)
    sourceWidth = imageWidth;
    sourceHeight = imageWidth / gridAspect;
    sourceY = (imageHeight - sourceHeight) / 2;
  }
  
  // Calculate output tile size (each tile should be square for Instagram)
  const tileWidth = sourceWidth / cols;
  const tileHeight = sourceHeight / rows;
  
  // For Instagram, tiles should be square - use the dimension that fits
  const rawTileSize = Math.min(tileWidth, tileHeight);
  const tileSize = maxTileSize ? Math.min(rawTileSize, maxTileSize) : rawTileSize;
  
  const scale = tileSize / rawTileSize;
  
  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    needsPadding,
    outputWidth: Math.floor(tileSize * cols),
    outputHeight: Math.floor(tileSize * rows),
    scale,
  };
}

/**
 * Hook to compute image fitting for a grid
 */
export function useImageFitting(
  imageWidth: number,
  imageHeight: number,
  cols: number,
  rows: number,
  maxTileSize?: number
) {
  return useMemo(() => {
    if (!imageWidth || !imageHeight) {
      return null;
    }
    return calculateImageFitting({
      imageWidth,
      imageHeight,
      cols,
      rows,
      maxTileSize,
    });
  }, [imageWidth, imageHeight, cols, rows, maxTileSize]);
}
