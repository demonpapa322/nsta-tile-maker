import { useState, useCallback, useMemo, useEffect, useRef, forwardRef } from 'react';
import { saveAs } from 'file-saver';
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

type ExportFormat = 'png' | 'jpeg';
type QualityPreset = 'hd' | 'standard' | 'compressed';

const qualityPresets: Record<QualityPreset, { label: string; description: string; quality: number; maxSize?: number }> = {
  hd: { label: 'HD', description: 'Original quality', quality: 1.0 },
  standard: { label: 'Standard', description: 'Good balance', quality: 0.85, maxSize: 1080 },
  compressed: { label: 'Compressed', description: 'Smaller files', quality: 0.6, maxSize: 1080 },
};

// Check if Web Share API with files is supported
const canShareFiles = () => {
  return 'share' in navigator && 'canShare' in navigator;
};

// Check if on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const DownloadSection = forwardRef<HTMLDivElement, DownloadSectionProps>(function DownloadSection({ 
  imageUrl, 
  grid 
}, ref) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitImages, setSplitImages] = useState<SplitResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('jpeg');
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('standard');
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSharingSupported, setIsSharingSupported] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    setIsSharingSupported(canShareFiles());
    setIsMobile(isMobileDevice());
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSplitImages([]);
    setIsComplete(false);
    setProgress(0);
  }, [imageUrl, grid]);

  const { cols, rows } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r };
  }, [grid]);

  const fileExtension = format === 'png' ? 'png' : 'jpg';
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

  const splitImage = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsProcessing(true);
    setIsComplete(false);
    setProgress(0);

    try {
      const totalTiles = cols * rows;
      const preset = qualityPresets[qualityPreset];

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
  }, [imageUrl, cols, rows, mimeType, qualityPreset]);

  const shareToGallery = useCallback(async (img: SplitResult) => {
    const fileName = `tile_${img.postOrder.toString().padStart(2, '0')}.${fileExtension}`;
    const file = new File([img.blob], fileName, { type: mimeType });
    
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Grid Tile',
        });
        toast.success('Image shared/saved!');
      } else {
        saveAs(img.blob, fileName);
        toast.success('Downloaded!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        saveAs(img.blob, fileName);
        toast.success('Downloaded!');
      }
    }
  }, [fileExtension, mimeType]);

  const saveAllToDevice = useCallback(() => {
    splitImages.forEach((img) => {
      const fileName = `tile_${img.postOrder.toString().padStart(2, '0')}.${fileExtension}`;
      saveAs(img.blob, fileName);
    });
    toast.success('All images downloaded!');
  }, [splitImages, fileExtension]);

  const downloadSingle = useCallback((img: SplitResult) => {
    if (isMobile && isSharingSupported) {
      shareToGallery(img);
    } else {
      saveAs(img.blob, `tile_${img.postOrder.toString().padStart(2, '0')}.${fileExtension}`);
    }
  }, [fileExtension, isMobile, isSharingSupported, shareToGallery]);

  return (
    <div ref={ref} className="w-full space-y-4">
      {!isComplete ? (
        <div className="space-y-4">
          {/* Export Settings */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Export Settings</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {format.toUpperCase()} • {qualityPresets[qualityPreset].label}
              </span>
            </button>

            {showSettings && (
              <div className="space-y-4 pt-2 border-t border-border">
                {/* Format Selection */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Format</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['png', 'jpeg'] as ExportFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-sm font-medium transition-colors",
                          format === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-muted-foreground/50"
                        )}
                      >
                        {f.toUpperCase()}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {f === 'png' ? 'Lossless, larger' : 'Compressed, smaller'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Selection */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Quality</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(qualityPresets) as QualityPreset[]).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setQualityPreset(preset)}
                        className={cn(
                          "py-2 px-2 rounded-lg border text-sm font-medium transition-colors",
                          qualityPreset === preset
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-muted-foreground/50"
                        )}
                      >
                        {qualityPresets[preset].label}
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {qualityPresets[preset].description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {qualityPreset === 'hd' && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    💡 HD exports at original resolution for maximum quality. File sizes will be larger.
                  </p>
                )}
              </div>
            )}
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
              ({format.toUpperCase()} • {qualityPresets[qualityPreset].label})
            </span>
          </div>
          
          {/* Primary action - Save all directly */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={saveAllToDevice}
          >
            {isMobile && isSharingSupported ? 'Save to Gallery' : 'Download All'}
          </Button>

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
                  className="aspect-square rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
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
              setSplitImages([]);
              setIsComplete(false);
              setShowSettings(false);
              setProgress(0);
            }}
          >
            Split Again
          </Button>
        </div>
      )}
    </div>
  );
});