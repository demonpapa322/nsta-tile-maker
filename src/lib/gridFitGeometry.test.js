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
    backgroundX: -48,
    backgroundY: -16,
    backgroundWidth: 1296,
    backgroundHeight: 432,
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
  expect(fit.backgroundX).toBeLessThan(0);
  expect(fit.backgroundY).toBeLessThan(0);
  expect(fit.backgroundX + fit.backgroundWidth).toBeGreaterThan(fit.canvasWidth);
  expect(fit.backgroundY + fit.backgroundHeight).toBeGreaterThan(fit.canvasHeight);
});

test('full-resolution square sources are not reduced by a small preview canvas cap', () => {
  const fit = calculateGridFitGeometry(3000, 3000, 3, 3);

  expect(fit.canvasWidth).toBe(3000);
  expect(fit.canvasHeight).toBe(3000);
  expect(fit.tileSize).toBe(1000);
  expect(fit.scale).toBe(1);
  expect(fit.imageWidth).toBe(3000);
  expect(fit.imageHeight).toBe(3000);
});

test('very large source images stay within the browser canvas dimension limit without upscaling', () => {
  const fit = calculateGridFitGeometry(12000, 9000, 3, 1);

  expect(fit.canvasWidth).toBe(4095);
  expect(fit.canvasHeight).toBe(1365);
  expect(Math.max(fit.canvasWidth, fit.canvasHeight)).toBeLessThanOrEqual(4096);
  expect(fit.scale).toBeLessThan(1);
  expect(fit.imageWidth / fit.imageHeight).toBeCloseTo(12000 / 9000, 8);
});