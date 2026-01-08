import { useState, useCallback, useMemo, useEffect, useRef, forwardRef } from 'react';
import { Download, Loader2, Check, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SplitResult {
  blob: Blob;
  index: number;
  postOrder: number;
  url?: string; // Store object URL for reliable downloads
}

interface DownloadSectionProps {
  imageUrl: string;
  grid: string;
}

type ExportOption = 'jpeg' | 'png-standard' | 'png-hd';

const exportOptions: Record<ExportOption, { 
  label: string; 
  description: string; 
  format: 'jpeg' | 'png';
  quality: number; 
  maxSize?: number 
}> = {
  'jpeg': { 
    label: 'JPEG', 
    description: 'Compressed, smaller files', 
    format: 'jpeg',
    quality: 0.85, 
    maxSize: 1080 
  },
  'png-standard': { 
    label: 'PNG Standard', 
    description: 'Good quality, balanced size', 
    format: 'png',
    quality: 1.0, 
    maxSize: 1080 
  },
  'png-hd': { 
    label: 'PNG HD', 
    description: 'Maximum quality, larger files', 
    format: 'png',
    quality: 1.0 
  },
};

// Check if Web Share API with files is supported
const canShareFiles = () => {
  return 'share' in navigator && 'canShare' in navigator;
};

// Check if on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 100);
  });
};

export const DownloadSection = forwardRef<HTMLDivElement, DownloadSectionProps>(function DownloadSection({ 
  imageUrl, 
  grid 
}, ref) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitImages, setSplitImages] = useState<SplitResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [exportOption, setExportOption] = useState<ExportOption>('jpeg');
  const [progress, setProgress] = useState(0);
  const [isSharingSupported, setIsSharingSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  
  const isMountedRef = useRef(true);
  const downloadAbortRef = useRef(false);
  
  useEffect(() => {
    isMountedRef.current = true;
    setIsSharingSupported(canShareFiles());
    setIsMobile(isMobileDevice());
    return () => {
      isMountedRef.current = false;
      downloadAbortRef.current = true;
    };
  }, []);

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

      const processTile = async (i: number): Promise<void> => {
        if (!isMountedRef.current) return;

        const row = Math.floor(i / cols);
        const col = i % cols;

        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: false })!;
        
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

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), mimeType, preset.quality);
        });

        results.push({
          blob,
          index: i,
          postOrder: totalTiles - i,
        });

        if (isMountedRef.current) {
          setProgress(Math.round(((i + 1) / totalTiles) * 100));
        }
      };

      const batchSize = 3;
      for (let i = 0; i < totalTiles; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, totalTiles); j++) {
          batch.push(processTile(j));
        }
        await Promise.all(batch);
        await new Promise((resolve) => setTimeout(resolve, 0));
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

  // Sequential download with progress tracking - most reliable approach
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
        
        // Wait between downloads to prevent browser blocking
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
    
    // Fallback to direct download
    await downloadFile(img.blob, fileName);
    toast.success('Downloaded!');
  }, [fileExtension, isMobile, isSharingSupported, mimeType]);

  return (
    <div ref={ref} className="w-full space-y-3">
      {!isComplete ? (
        <div className="space-y-3">
          {/* Export Settings - Compact horizontal layout */}
          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-xs">Export Format</span>
            </div>
            
            <div className="flex gap-1.5">
              {(Object.keys(exportOptions) as ExportOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setExportOption(option)}
                  className={cn(
                    "flex-1 py-2 px-2 rounded-lg border text-center transition-all",
                    exportOption === option
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "font-medium text-xs block",
                    exportOption === option ? "text-primary" : "text-foreground"
                  )}>
                    {option === 'jpeg' ? 'JPEG' : option === 'png-standard' ? 'PNG' : 'PNG HD'}
                  </span>
                  <span className="text-[9px] text-muted-foreground block mt-0.5">
                    {option === 'jpeg' ? 'Smaller' : option === 'png-standard' ? 'Standard' : 'Max quality'}
                  </span>
                </button>
              ))}
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
                style={{ width: `${progress}%` }}
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
          
          {/* Primary action - Save all with progress */}
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
                style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
              />
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Or {isMobile ? 'save' : 'download'} individually:
            </p>
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
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
            onClick={() => {
              downloadAbortRef.current = true;
              setSplitImages([]);
              setIsComplete(false);
              setProgress(0);
              setIsDownloading(false);
            }}
            disabled={isDownloading}
          >
            Split Again
          </Button>
        </div>
      )}
    </div>
  );
});
