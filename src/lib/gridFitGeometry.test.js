import { expect, test } from 'bun:test';
import { calculateGridFitGeometry } from './gridFitGeometry.ts';

test('a 3:1 image fills a 3x1 grid without rescaling or padding', () => {
  const fit = calculateGridFitGeometry(1200, 400, 3, 1);

  expect(fit).toEqual({
    canvasWidth: 1200,
    canvasHeight: 400,
    imageX: 0,
    imageY: 0,
    imageWidth: 1200,
    imageHeight: 400,
    tileSize: 400,
    scale: 1,
  });
});

test('a mismatched image is fully contained in a 3x1 grid without upscaling', () => {
  const fit = calculateGridFitGeometry(1200, 900, 3, 1);

  expect(fit.canvasWidth).toBe(2046);
  expect(fit.canvasHeight).toBe(682);
  expect(fit.scale).toBeLessThanOrEqual(1);
  expect(fit.imageWidth / fit.imageHeight).toBeCloseTo(1200 / 900, 8);
  expect(fit.imageX).toBeGreaterThan(0);
  expect(fit.imageY).toBe(0);
  expect(fit.imageX + fit.imageWidth).toBeLessThanOrEqual(fit.canvasWidth);
  expect(fit.imageY + fit.imageHeight).toBeLessThanOrEqual(fit.canvasHeight);
});