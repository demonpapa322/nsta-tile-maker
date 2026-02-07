import { create2DCanvas, canvasToBlob } from './canvas';

export type ResizeMode = 'fill' | 'fit' | 'stretch';

export interface ResizePreset {
  id: string;
  label: string;
  platform: string;
  width: number;
  height: number;
  icon: string;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  // Instagram
  { id: 'ig-square', label: 'Square Post', platform: 'Instagram', width: 1080, height: 1080, icon: '📸' },
  { id: 'ig-portrait', label: 'Portrait Post', platform: 'Instagram', width: 1080, height: 1350, icon: '📸' },
  { id: 'ig-landscape', label: 'Landscape Post', platform: 'Instagram', width: 1080, height: 566, icon: '📸' },
  { id: 'ig-story', label: 'Story / Reel', platform: 'Instagram', width: 1080, height: 1920, icon: '📸' },
  // Facebook
  { id: 'fb-post', label: 'Post', platform: 'Facebook', width: 1200, height: 630, icon: '👤' },
  { id: 'fb-cover', label: 'Cover Photo', platform: 'Facebook', width: 820, height: 312, icon: '👤' },
  // Twitter / X
  { id: 'tw-post', label: 'Post Image', platform: 'Twitter / X', width: 1600, height: 900, icon: '🐦' },
  { id: 'tw-header', label: 'Header', platform: 'Twitter / X', width: 1500, height: 500, icon: '🐦' },
  // YouTube
  { id: 'yt-thumb', label: 'Thumbnail', platform: 'YouTube', width: 1280, height: 720, icon: '🎬' },
  { id: 'yt-banner', label: 'Channel Banner', platform: 'YouTube', width: 2560, height: 1440, icon: '🎬' },
  // LinkedIn
  { id: 'li-post', label: 'Post', platform: 'LinkedIn', width: 1200, height: 627, icon: '💼' },
  { id: 'li-cover', label: 'Cover', platform: 'LinkedIn', width: 1584, height: 396, icon: '💼' },
  // Pinterest
  { id: 'pin-standard', label: 'Standard Pin', platform: 'Pinterest', width: 1000, height: 1500, icon: '📌' },
  // TikTok
  { id: 'tt-video', label: 'Video Cover', platform: 'TikTok', width: 1080, height: 1920, icon: '🎵' },
];

export interface CustomDimensions {
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Smart resize with three modes:
 * 
 * - fill: Scales image to fully cover target dimensions, center-crops excess.
 *         The image fills every pixel — no empty space. Minimal cropping from center.
 * 
 * - fit: Scales image to fit entirely within target, adds background padding.
 *        No cropping — the entire image is visible.
 * 
 * - stretch: Stretches/squashes image to exact target dimensions.
 */
export async function resizeImage(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode = 'fill',
  bgColor: string = '#ffffff'
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  const img = await loadImage(imageUrl);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  const { canvas, ctx, width: canvasW, height: canvasH } = create2DCanvas(targetWidth, targetHeight);

  // Fill background (visible in 'fit' mode)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasW, canvasH);

  let sx = 0, sy = 0, sw = srcW, sh = srcH;
  let dx = 0, dy = 0, dw = canvasW, dh = canvasH;

  if (mode === 'fill') {
    // Cover: scale to fill, crop from center
    const srcAspect = srcW / srcH;
    const dstAspect = canvasW / canvasH;

    if (srcAspect > dstAspect) {
      // Source is wider than target — crop sides
      sw = srcH * dstAspect;
      sx = (srcW - sw) / 2;
    } else {
      // Source is taller than target — crop top/bottom
      sh = srcW / dstAspect;
      sy = (srcH - sh) / 2;
    }
  } else if (mode === 'fit') {
    // Contain: fit inside, letterbox
    const srcAspect = srcW / srcH;
    const dstAspect = canvasW / canvasH;

    if (srcAspect > dstAspect) {
      // Image is wider — fit by width, letterbox top/bottom
      dw = canvasW;
      dh = canvasW / srcAspect;
      dy = (canvasH - dh) / 2;
    } else {
      // Image is taller — fit by height, letterbox sides
      dh = canvasH;
      dw = canvasH * srcAspect;
      dx = (canvasW - dw) / 2;
    }
  }
  // 'stretch' uses default: full source → full destination

  // Use high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

  const blob = await canvasToBlob(canvas, { type: 'image/png', quality: 0.95 });
  if (!blob) throw new Error('Failed to create image blob');

  const url = URL.createObjectURL(blob);
  return { blob, url, width: canvasW, height: canvasH };
}

/**
 * Generate a quick preview (lower resolution for speed)
 */
export async function resizeImagePreview(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  mode: ResizeMode = 'fill',
  bgColor: string = '#ffffff',
  maxPreviewDim: number = 800
): Promise<string> {
  const scale = Math.min(1, maxPreviewDim / Math.max(targetWidth, targetHeight));
  const previewW = Math.round(targetWidth * scale);
  const previewH = Math.round(targetHeight * scale);

  const { url } = await resizeImage(imageUrl, previewW, previewH, mode, bgColor);
  return url;
}
