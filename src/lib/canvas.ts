export type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

export function normalizeCanvasSize(value: number): number {
  if (!Number.isFinite(value)) return 1;
  // OffscreenCanvas requires unsigned long (integer >= 0). We clamp to >= 1.
  return Math.max(1, Math.round(value));
}

export function create2DCanvas(width: number, height: number): {
  canvas: AnyCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  isOffscreen: boolean;
  width: number;
  height: number;
} {
  const w = normalizeCanvasSize(width);
  const h = normalizeCanvasSize(height);

  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const offscreen = new OffscreenCanvas(w, h);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        return { canvas: offscreen, ctx, isOffscreen: true, width: w, height: h };
      }
    } catch {
      // Some browsers expose OffscreenCanvas but cannot construct it reliably.
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Very defensive: should not happen, but prevents hard crashes.
    throw new Error('Failed to get 2D canvas context');
  }
  return { canvas, ctx, isOffscreen: false, width: w, height: h };
}

export async function canvasToBlob(
  canvas: AnyCanvas,
  opts: { type: string; quality?: number },
): Promise<Blob | null> {
  if (canvas instanceof OffscreenCanvas) {
    try {
      return await canvas.convertToBlob({ type: opts.type, quality: opts.quality });
    } catch {
      return null;
    }
  }

  return await new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), opts.type, opts.quality);
  });
}
