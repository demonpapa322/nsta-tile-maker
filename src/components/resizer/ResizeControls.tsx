import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { Download, Loader2, Crop, Maximize, MoveHorizontal, Layers } from 'lucide-react';
import { resizeImage, type ResizeMode } from '@/lib/imageResize';
import { cn } from '@/lib/utils';

interface ResizeControlsProps {
  originalUrl: string;
  /** All uploaded images. When more than one, download produces a ZIP. */
  files?: File[];
  targetWidth: number;
  targetHeight: number;
  mode: ResizeMode;
  onModeChange: (mode: ResizeMode) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

const MODES: { value: ResizeMode; label: string; description: string; icon: typeof Crop }[] = [
  { value: 'fill', label: 'Smart Crop', description: 'Fills frame, minimal crop from center', icon: Crop },
  { value: 'fit', label: 'Fit to Frame', description: 'Full image visible, padded background', icon: Maximize },
  { value: 'stretch', label: 'Stretch', description: 'Stretches to exact dimensions', icon: MoveHorizontal },
];

export const ResizeControls = memo(function ResizeControls({
  originalUrl,
  files,
  targetWidth,
  targetHeight,
  mode,
  onModeChange,
  bgColor,
  onBgColorChange,
}: ResizeControlsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');

  const batchCount = files && files.length > 1 ? files.length : 0;

  const handleDownload = useCallback(async () => {
    if (targetWidth < 1 || targetHeight < 1) return;

    setIsDownloading(true);
    setProgress(0);
    try {
      if (batchCount > 1 && files) {
        // Batch: resize every image with the same settings, deliver one ZIP
        const zip = new JSZip();
        const used = new Set<string>();
        for (let i = 0; i < files.length; i++) {
          const src = URL.createObjectURL(files[i]);
          try {
            const out = await resizeImage(src, targetWidth, targetHeight, mode, bgColor);
            URL.revokeObjectURL(out.url);
            let base = files[i].name.replace(/\.[^.]+$/, '') || `image-${i + 1}`;
            while (used.has(base)) base += '-1';
            used.add(base);
            zip.file(`${base}-${targetWidth}x${targetHeight}.${downloadFormat}`, out.blob);
          } catch {
            // skip unreadable image
          } finally {
            URL.revokeObjectURL(src);
          }
          setProgress(i + 1);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resized-${targetWidth}x${targetHeight}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        const { blob, url } = await resizeImage(originalUrl, targetWidth, targetHeight, mode, bgColor);
        void blob;
        const link = document.createElement('a');
        link.href = url;
        link.download = `resized-${targetWidth}x${targetHeight}.${downloadFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke after download starts
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  }, [originalUrl, files, batchCount, targetWidth, targetHeight, mode, bgColor, downloadFormat]);

  return (
    <div className="space-y-4">
      {batchCount > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25">
          <Layers className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-[11px] font-medium text-foreground/80 leading-tight">
            Every change applies to all {batchCount} images.
          </span>
        </div>
      )}

      {/* Resize Mode */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Resize Mode</h3>
        <div className="space-y-1.5">
          {MODES.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onModeChange(value)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                mode === value
                  ? "bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 border border-violet-500/25"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", mode === value ? "text-primary" : "text-muted-foreground")} />
              <div>
                <div className={cn("text-sm font-medium", mode === value ? "text-foreground" : "text-muted-foreground")}>{label}</div>
                <div className="text-[10px] text-muted-foreground/70 leading-tight">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Color (only for Fit mode) */}
      {mode === 'fit' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-semibold text-foreground">Background</h3>
          <div className="flex gap-2">
            {['#ffffff', '#000000', '#f3f4f6', '#1f2937', '#fef3c7', '#dbeafe'].map(color => (
              <button
                key={color}
                onClick={() => onBgColorChange(color)}
                className={cn(
                  "w-8 h-8 rounded-lg border-2 transition-all hover:scale-110",
                  bgColor === color ? "border-primary shadow-md" : "border-border"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <label className="w-8 h-8 rounded-lg border-2 border-border overflow-hidden cursor-pointer hover:scale-110 transition-all" title="Custom color">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => onBgColorChange(e.target.value)}
                className="w-full h-full cursor-pointer opacity-0 absolute"
              />
              <div className="w-full h-full bg-gradient-to-br from-red-400 via-green-400 to-blue-400 rounded-md" />
            </label>
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Format Toggle */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Format</h3>
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl">
          {(['png', 'jpg'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => setDownloadFormat(fmt)}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all uppercase",
                downloadFormat === fmt
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading || targetWidth < 1 || targetHeight < 1}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
          "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white shadow-lg",
          "hover:shadow-xl hover:brightness-110",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        whileTap={{ scale: 0.97 }}
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {batchCount > 1 ? `Resizing ${progress}/${batchCount}...` : 'Processing...'}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {batchCount > 1 ? `Download All ${batchCount} (ZIP)` : 'Download Image'}
          </>
        )}
      </motion.button>

      {batchCount > 1 && (
        <p className="text-[11px] text-muted-foreground text-center leading-tight">
          The same size and mode are applied to all {batchCount} images.
        </p>
      )}
    </div>
  );
});
