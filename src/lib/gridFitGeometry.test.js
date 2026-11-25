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

test('a mismatched image keeps its original pixels and is fully contained in a 3x1 grid', () => {
  const fit = calculateGridFitGeometry(1200, 900, 3, 1);

  expect(fit.canvasWidth).toBe(2700);
  expect(fit.canvasHeight).toBe(900);
  expect(fit.scale).toBe(1);
  expect(fit.imageWidth).toBe(1200);
  expect(fit.imageHeight).toBe(900);
  expect(fit.imageX).toBe(750);
  expect(fit.imageY).toBe(0);
  expect(fit.imageX + fit.imageWidth).toBeLessThanOrEqual(fit.canvasWidth);
  expect(fit.imageY + fit.imageHeight).toBeLessThanOrEqual(fit.canvasHeight);
});

test('very large source images remain inside the canvas memory budget without upscaling', () => {
  const fit = calculateGridFitGeometry(12000, 9000, 3, 1);

  expect(fit.canvasWidth).toBe(3546);
  expect(fit.canvasHeight).toBe(1182);
  expect(fit.canvasWidth * fit.canvasHeight).toBeLessThanOrEqual(2048 * 2048);
  expect(fit.scale).toBeLessThan(1);
  expect(fit.imageWidth / fit.imageHeight).toBeCloseTo(12000 / 9000, 8);
});