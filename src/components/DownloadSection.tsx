import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { Download, Loader2, Check, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SplitResult {
  blob: Blob;
  index: number;
  postOrder: number;
}

interface DownloadSectionProps {
  imageUrl: string;
  grid: string;
}

type ExportOption = 'jpeg' | 'png-standard' | 'png-hd';

const exportOptions: Record<ExportOption, { 
  label: string; 
  shortLabel: string;
  description: string;
  format: 'jpeg' | 'png';
  quality: number; 
  maxSize?: number 
}> = {
  'jpeg': { 
    label: 'JPEG', 
    shortLabel: 'JPEG',
    description: 'Smaller', 
    format: 'jpeg',
    quality: 0.85, 
    maxSize: 1080 
  },
  'png-standard': { 
    label: 'PNG Standard', 
    shortLabel: 'PNG',
    description: 'Standard', 
    format: 'png',
    quality: 1.0, 
    maxSize: 1080 
  },
  'png-hd': { 
    label: 'PNG HD', 
    shortLabel: 'PNG HD',
    description: 'Max quality', 
    format: 'png',
    quality: 1.0 
  },
};

const EXPORT_KEYS = Object.keys(exportOptions) as ExportOption[];

// Check if on mobile device - memoize result
const isMobileDevice = (() => {
  let cached: boolean | null = null;
  return () => {
    if (cached === null) {
      cached = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return cached;
  };
})();

// Check if Web Share API with files is supported
const canShareFiles = (() => {
  let cached: boolean | null = null;
  return () => {
    if (cached === null) {
      cached = 'share' in navigator && 'canShare' in navigator;
    }
    return cached;
  };
})();

// Reliable single file download using native anchor
const downloadFile = (blob: Blob, fileName: string): Promise<void> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 100);
  });
};

export const DownloadSection = memo(function DownloadSection({ 
  imageUrl, 
  grid 
}: DownloadSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitImages, setSplitImages] = useState<SplitResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [exportOption, setExportOption] = useState<ExportOption>('jpeg');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  
  const isMountedRef = useRef(true);
  const downloadAbortRef = useRef(false);
  
  // Memoize derived values
  const isMobile = useMemo(() => isMobileDevice(), []);
  const isSharingSupported = useMemo(() => canShareFiles(), []);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      downloadAbortRef.current = true;
    };
  }, []);

  // Reset state when image or grid changes
  useEffect(() => {
    setSplitImages([]);
    setIsComplete(false);
    setProgress(0);
    setIsDownloading(false);
    setDownloadProgress({ current: 0, total: 0 });
  }, [imageUrl, grid]);

  const { cols, rows } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r };
  }, [grid]);

  const currentExport = exportOptions[exportOption];
  const fileExtension = currentExport.format === 'png' ? 'png' : 'jpg';
  const mimeType = currentExport.format === 'png' ? 'image/png' : 'image/jpeg';

  const splitImage = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setProgress(0);

    try {
      const totalTiles = cols * rows;
      const preset = currentExport;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      if (!isMountedRef.current) return;

      const tileWidth = Math.floor(img.width / cols);
      const tileHeight = Math.floor(img.height / rows);
      const tileSize = Math.min(tileWidth, tileHeight);
      
      const outputSize = preset.maxSize ? Math.min(tileSize, preset.maxSize) : tileSize;
      
      const offsetX = Math.floor((img.width - tileSize * cols) / 2);
      const offsetY = Math.floor((img.height - tileSize * rows) / 2);

      const results: SplitResult[] = [];
      
      // Use OffscreenCanvas if available for better performance
      const useOffscreen = typeof OffscreenCanvas !== 'undefined';

      const processTile = async (i: number): Promise<void> => {
        if (!isMountedRef.current) return;

        const row = Math.floor(i / cols);
        const col = i % cols;

        let canvas: HTMLCanvasElement | OffscreenCanvas;
        let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
        
        if (useOffscreen) {
          canvas = new OffscreenCanvas(outputSize, outputSize);
          ctx = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = outputSize;
          canvas.height = outputSize;
          ctx = canvas.getContext('2d', { willReadFrequently: false });
        }
        
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          offsetX + col * tileSize,
          offsetY + row * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          outputSize,
          outputSize
        );

        let blob: Blob;
        if (useOffscreen && canvas instanceof OffscreenCanvas) {
          blob = await canvas.convertToBlob({ type: mimeType, quality: preset.quality });
        } else {
          blob = await new Promise<Blob>((resolve) => {
            (canvas as HTMLCanvasElement).toBlob((b) => resolve(b!), mimeType, preset.quality);
          });
        }

        results.push({
          blob,
          index: i,
          postOrder: totalTiles - i,
        });

        if (isMountedRef.current) {
          setProgress(Math.round(((i + 1) / totalTiles) * 100));
        }
      };

      // Process tiles one at a time on mobile, batch on desktop for smoother UX
      const isMobileProcessing = isMobileDevice();
      const batchSize = isMobileProcessing ? 1 : 3;
      
      for (let i = 0; i < totalTiles; i += batchSize) {
        if (!isMountedRef.current) return;
        
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, totalTiles); j++) {
          batch.push(processTile(j));
        }
        await Promise.all(batch);
        
        // Longer yield on mobile to prevent frame drops
        await new Promise(resolve => setTimeout(resolve, isMobileProcessing ? 16 : 0));
      }

      if (!isMountedRef.current) return;

      setSplitImages(results);
      setIsComplete(true);
      
      const totalSize = results.reduce((acc, r) => acc + r.blob.size, 0);
      const sizeStr = totalSize > 1024 * 1024 
        ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(totalSize / 1024)} KB`;
      
      toast.success(`Split into ${totalTiles} images (${sizeStr})`);
    } catch (error) {
      console.error('Error splitting image:', error);
      if (isMountedRef.current) {
        toast.error('Failed to split image. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  }, [imageUrl, cols, rows, mimeType, currentExport]);

  const saveAllToDevice = useCallback(async () => {
    if (!splitImages.length || isDownloading) return;

    downloadAbortRef.current = false;
    setIsDownloading(true);
    
    const ordered = [...splitImages].sort((a, b) => a.postOrder - b.postOrder);
    const total = ordered.length;
    
    setDownloadProgress({ current: 0, total });
    toast.info(`Downloading ${total} images...`);

    let successCount = 0;

    for (let i = 0; i < ordered.length; i++) {
      if (downloadAbortRef.current || !isMountedRef.current) break;
      
      const img = ordered[i];
      const fileName = `tile_${img.postOrder.toString().padStart(2, '0')}.${fileExtension}`;
      
      try {
        await downloadFile(img.blob, fileName);
        successCount++;
        
        if (isMountedRef.current) {
          setDownloadProgress({ current: i + 1, total });
        }
        
        if (i < ordered.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      } catch (error) {
        console.error(`Failed to download ${fileName}:`, error);
      }
    }

    if (isMountedRef.current) {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
      
      if (successCount === total) {
        toast.success(`All ${total} images downloaded!`);
      } else if (successCount > 0) {
        toast.warning(`Downloaded ${successCount} of ${total} images`);
      } else {
        toast.error('Download failed. Try downloading individually.');
      }
    }
  }, [fileExtension, splitImages, isDownloading]);

  const downloadSingle = useCallback(async (img: SplitResult) => {
    const fileName = `tile_${img.postOrder.toString().padStart(2, '0')}.${fileExtension}`;
    
    if (isMobile && isSharingSupported) {
      const file = new File([img.blob], fileName, { type: mimeType });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Grid Tile' });
          toast.success('Image saved!');
          return;
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }
    
    await downloadFile(img.blob, fileName);
    toast.success('Downloaded!');
  }, [fileExtension, isMobile, isSharingSupported, mimeType]);

  const handleReset = useCallback(() => {
    downloadAbortRef.current = true;
    setSplitImages([]);
    setIsComplete(false);
    setProgress(0);
    setIsDownloading(false);
  }, []);

  // Memoize individual tile grid style
  const tileGridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${cols}, 1fr)`
  }), [cols]);

  const progressWidth = useMemo(() => ({ 
    width: `${progress}%` 
  }), [progress]);

  const downloadProgressWidth = useMemo(() => ({ 
    width: `${downloadProgress.total ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%` 
  }), [downloadProgress]);

  return (
    <div className="w-full space-y-3" style={{ transform: 'translateZ(0)' }}>
      {!isComplete ? (
        <div className="space-y-3">
          {/* Export Settings */}
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-xs">Export Format</span>
            </div>
            
            <div className="flex gap-1.5">
              {EXPORT_KEYS.map((option) => {
                const opt = exportOptions[option];
                const isSelected = exportOption === option;
                return (
                  <button
                    key={option}
                    onClick={() => setExportOption(option)}
                    className={cn(
                      "flex-1 py-2 px-2 rounded-lg border text-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <span className={cn(
                      "font-medium text-xs block",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {opt.shortLabel}
                    </span>
                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={splitImage}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing... {progress}%
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Split Image
              </>
            )}
          </Button>
          
          {isProcessing && (
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={progressWidth}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary text-sm">
            <Check className="w-4 h-4" />
            <span className="font-medium">Ready to {isMobile ? 'save' : 'download'}</span>
            <span className="text-muted-foreground">
              ({exportOptions[exportOption].label})
            </span>
          </div>
          
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={saveAllToDevice}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading {downloadProgress.current}/{downloadProgress.total}...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download All ({splitImages.length} images)
              </>
            )}
          </Button>
          
          {isDownloading && (
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={downloadProgressWidth}
              />
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Or {isMobile ? 'save' : 'download'} individually:
            </p>
            <div className="grid gap-2" style={tileGridStyle}>
              {splitImages.map((img) => (
                <button
                  key={img.index}
                  onClick={() => downloadSingle(img)}
                  disabled={isDownloading}
                  className="aspect-square rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <span className="text-xs font-medium">{img.postOrder}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleReset}
            disabled={isDownloading}
          >
            Split Again
          </Button>
        </div>
      )}
    </div>
  );
});
