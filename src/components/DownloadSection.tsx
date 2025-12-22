import { useState, useCallback, useMemo, memo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, Package, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SplitResult {
  blob: Blob;
  index: number;
  postOrder: number;
}

interface DownloadSectionProps {
  imageUrl: string;
  grid: string;
}

export const DownloadSection = memo(function DownloadSection({ 
  imageUrl, 
  grid 
}: DownloadSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitImages, setSplitImages] = useState<SplitResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const { cols, rows } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r };
  }, [grid]);

  const splitImage = useCallback(async () => {
    setIsProcessing(true);
    setIsComplete(false);

    try {
      const totalTiles = cols * rows;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      const tileWidth = Math.floor(img.width / cols);
      const tileHeight = Math.floor(img.height / rows);
      const tileSize = Math.min(tileWidth, tileHeight);
      const offsetX = Math.floor((img.width - tileSize * cols) / 2);
      const offsetY = Math.floor((img.height - tileSize * rows) / 2);

      const results: SplitResult[] = [];

      // Process tiles synchronously for speed
      for (let i = 0; i < totalTiles; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const canvas = document.createElement('canvas');
        canvas.width = tileSize;
        canvas.height = tileSize;
        const ctx = canvas.getContext('2d', { willReadFrequently: false })!;

        ctx.drawImage(
          img,
          offsetX + col * tileSize,
          offsetY + row * tileSize,
          tileSize,
          tileSize,
          0,
          0,
          tileSize,
          tileSize
        );

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
        });

        results.push({
          blob,
          index: i,
          postOrder: totalTiles - i,
        });
      }

      setSplitImages(results);
      setIsComplete(true);
      toast.success(`Split into ${totalTiles} images!`);
    } catch (error) {
      console.error('Error splitting image:', error);
      toast.error('Failed to split image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [imageUrl, cols, rows]);

  const downloadZip = useCallback(async () => {
    const zip = new JSZip();
    
    splitImages.forEach((img) => {
      zip.file(`tile_${img.postOrder.toString().padStart(2, '0')}.png`, img.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'instagram_grid.zip');
    toast.success('Downloaded!');
  }, [splitImages]);

  const downloadSingle = useCallback((img: SplitResult) => {
    saveAs(img.blob, `tile_${img.postOrder.toString().padStart(2, '0')}.png`);
  }, []);

  return (
    <div className="w-full space-y-4">
      {!isComplete ? (
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
              Processing...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Split Image
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary text-sm">
            <Check className="w-4 h-4" />
            <span className="font-medium">Ready to download</span>
          </div>
          
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={downloadZip}
          >
            <Package className="w-4 h-4" />
            Download All as ZIP
          </Button>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">Or download individually:</p>
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
            }}
          >
            Split Again
          </Button>
        </div>
      )}
    </div>
  );
});
