import { useState } from 'react';
import { motion } from 'framer-motion';
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
  onSplit: () => void;
}

export function DownloadSection({ imageUrl, grid }: DownloadSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitImages, setSplitImages] = useState<SplitResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const splitImage = async () => {
    setIsProcessing(true);
    setIsComplete(false);

    try {
      const [cols, rows] = grid.split('x').map(Number);
      const totalTiles = cols * rows;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Calculate tile size based on the smaller dimension to ensure squares
      const tileWidth = Math.floor(img.width / cols);
      const tileHeight = Math.floor(img.height / rows);
      const tileSize = Math.min(tileWidth, tileHeight);

      // Center the grid on the image
      const offsetX = Math.floor((img.width - tileSize * cols) / 2);
      const offsetY = Math.floor((img.height - tileSize * rows) / 2);

      const results: SplitResult[] = [];

      for (let i = 0; i < totalTiles; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const canvas = document.createElement('canvas');
        canvas.width = tileSize;
        canvas.height = tileSize;
        const ctx = canvas.getContext('2d')!;

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
      toast.success(`Successfully split into ${totalTiles} images!`);
    } catch (error) {
      console.error('Error splitting image:', error);
      toast.error('Failed to split image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    
    splitImages.forEach((img) => {
      zip.file(`tile_${img.postOrder.toString().padStart(2, '0')}_post_order.png`, img.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'instagram_grid.zip');
    toast.success('ZIP file downloaded!');
  };

  const downloadSingle = (img: SplitResult) => {
    saveAs(img.blob, `tile_${img.postOrder.toString().padStart(2, '0')}.png`);
  };

  const [cols, rows] = grid.split('x').map(Number);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full space-y-6"
    >
      {!isComplete ? (
        <Button
          variant="gradient"
          size="xl"
          className="w-full"
          onClick={splitImage}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Split Image
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            <span className="font-medium">Split Complete!</span>
          </div>
          
          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={downloadZip}
          >
            <Package className="w-5 h-5" />
            Download All as ZIP
          </Button>

          <div className="glass rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Or download individual tiles:
            </p>
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {splitImages.map((img) => {
                const row = Math.floor(img.index / cols);
                const col = img.index % cols;
                
                return (
                  <motion.button
                    key={img.index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadSingle(img)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors group"
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: `${cols * 100}% ${rows * 100}%`,
                        backgroundPosition: `${(col / (cols - 1 || 1)) * 100}% ${(row / (rows - 1 || 1)) * 100}%`,
                      }}
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-center justify-center">
                      <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                      {img.postOrder}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Button
            variant="outline"
            size="default"
            className="w-full"
            onClick={() => {
              setSplitImages([]);
              setIsComplete(false);
            }}
          >
            Start Over
          </Button>
        </div>
      )}
    </motion.div>
  );
}
