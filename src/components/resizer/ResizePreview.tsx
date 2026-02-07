import { memo, useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { resizeImagePreview, type ResizeMode } from '@/lib/imageResize';

interface ResizePreviewProps {
  originalUrl: string;
  targetWidth: number;
  targetHeight: number;
  mode: ResizeMode;
  bgColor: string;
}

export const ResizePreview = memo(function ResizePreview({
  originalUrl,
  targetWidth,
  targetHeight,
  mode,
  bgColor,
}: ResizePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const prevUrlRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const generatePreview = useCallback(async () => {
    if (targetWidth < 1 || targetHeight < 1) return;
    
    setIsProcessing(true);
    try {
      const url = await resizeImagePreview(originalUrl, targetWidth, targetHeight, mode, bgColor);
      
      // Revoke old preview URL
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err) {
      console.error('Preview generation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [originalUrl, targetWidth, targetHeight, mode, bgColor]);

  useEffect(() => {
    // Debounce preview generation for custom dimension typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generatePreview, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [generatePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  // Calculate display aspect ratio for preview container
  const aspectRatio = targetWidth / targetHeight;
  const maxContainerW = 600;
  const maxContainerH = 500;
  let displayW: number, displayH: number;

  if (aspectRatio > maxContainerW / maxContainerH) {
    displayW = maxContainerW;
    displayH = maxContainerW / aspectRatio;
  } else {
    displayH = maxContainerH;
    displayW = maxContainerH * aspectRatio;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-border shadow-lg bg-muted/20"
        style={{ width: '100%', maxWidth: displayW, aspectRatio: `${targetWidth}/${targetHeight}` }}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.img
              key={previewUrl}
              src={previewUrl}
              alt="Resized preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Overlay */}
        {isProcessing && previewUrl && (
          <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Dimension Badge */}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium tabular-nums text-muted-foreground">
          {targetWidth} × {targetHeight}px
        </span>
        <span className="text-[10px] text-muted-foreground/60 capitalize">
          {mode === 'fill' ? 'Smart Crop' : mode === 'fit' ? 'Fit to Frame' : 'Stretch'}
        </span>
      </div>
    </div>
  );
});
