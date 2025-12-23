import { useState, useRef, useCallback, forwardRef, useEffect, useMemo } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, RotateCcw, Move, ZoomIn, RotateCw, Minus, Plus, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useObjectUrlManager } from '@/hooks/useObjectUrl';

interface ImageCropperProps {
  imageUrl: string;
  grid: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const ImageCropper = forwardRef<HTMLDivElement, ImageCropperProps>(function ImageCropper({
  imageUrl,
  grid,
  onCropComplete,
  onCancel,
}, ref) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [transformedImageUrl, setTransformedImageUrl] = useState(imageUrl);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const { createUrl, revokeUrl, revokeAll } = useObjectUrlManager();
  
  // Debounce zoom and rotation to prevent excessive processing
  const debouncedZoom = useDebounce(zoom, 150);
  const debouncedRotation = useDebounce(rotation, 150);

  const { cols, rows, aspect } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, aspect: c / r };
  }, [grid]);

  // Generate transformed image when debounced zoom or rotation changes
  useEffect(() => {
    if (debouncedZoom === 1 && debouncedRotation === 0) {
      setTransformedImageUrl(imageUrl);
      setIsTransforming(false);
      return;
    }

    let cancelled = false;
    setIsTransforming(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (cancelled) return;
      
      // Use requestIdleCallback or setTimeout for non-blocking processing
      const processImage = () => {
        if (cancelled) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsTransforming(false);
          return;
        }

        const radians = (debouncedRotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        const rotatedWidth = img.width * cos + img.height * sin;
        const rotatedHeight = img.width * sin + img.height * cos;

        canvas.width = rotatedWidth * debouncedZoom;
        canvas.height = rotatedHeight * debouncedZoom;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.scale(debouncedZoom, debouncedZoom);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          if (cancelled || !blob) {
            setIsTransforming(false);
            return;
          }
          
          // Revoke previous URL before creating new one
          if (transformedImageUrl !== imageUrl) {
            revokeUrl(transformedImageUrl);
          }
          
          const url = createUrl(blob);
          setTransformedImageUrl(url);
          setIsTransforming(false);
        }, 'image/png');
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(processImage, { timeout: 500 });
      } else {
        setTimeout(processImage, 0);
      }
    };
    
    img.onerror = () => {
      if (!cancelled) setIsTransforming(false);
    };
    
    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl, debouncedZoom, debouncedRotation, createUrl, revokeUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeAll();
    };
  }, [revokeAll]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerAspectCrop(width, height, aspect);
    setCrop(newCrop);
  }, [aspect]);

  // Reset crop when grid changes
  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (width && height) {
        const newCrop = centerAspectCrop(width, height, aspect);
        setCrop(newCrop);
      }
    }
  }, [aspect]);

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsApplying(true);

    // Use setTimeout to prevent UI freeze
    setTimeout(() => {
      const image = imgRef.current;
      if (!image) {
        setIsApplying(false);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsApplying(false);
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      canvas.toBlob(
        (blob) => {
          setIsApplying(false);
          if (blob) {
            const croppedUrl = createUrl(blob);
            onCropComplete(croppedUrl);
          }
        },
        'image/png',
        1.0
      );
    }, 10);
  }, [completedCrop, onCropComplete, createUrl]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerAspectCrop(width, height, aspect);
      setCrop(newCrop);
    }
  }, [aspect]);

  const handleRotateLeft = useCallback(() => setRotation((r) => r - 90), []);
  const handleRotateRight = useCallback(() => setRotation((r) => r + 90), []);
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.1, 3)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.1, 0.5)), []);

  const isProcessing = isTransforming || isApplying;

  return (
    <div ref={ref} className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Move className="w-4 h-4" />
          <span>Drag to reposition • Corners to resize</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Aspect: {cols}:{rows}
        </div>
      </div>

      {/* Zoom & Rotation Controls */}
      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5 || isProcessing}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Slider
            value={[zoom]}
            onValueChange={([v]) => setZoom(v)}
            min={0.5}
            max={3}
            step={0.1}
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 3 || isProcessing}
          >
            <Plus className="w-3 h-3" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Rotation Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateLeft}
            className="gap-1"
            disabled={isProcessing}
          >
            <RotateCcw className="w-4 h-4" />
            -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateRight}
            className="gap-1"
            disabled={isProcessing}
          >
            <RotateCw className="w-4 h-4" />
            +90°
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {rotation % 360}°
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-center p-4 bg-muted/30 max-h-[500px] relative">
          {isTransforming && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            className="max-h-[450px]"
            disabled={isProcessing}
          >
            <img
              ref={imgRef}
              src={transformedImageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[450px] w-auto"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex-1"
          disabled={isProcessing}
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          variant="gradient"
          size="sm"
          onClick={handleCropComplete}
          className="flex-1"
          disabled={!completedCrop || isProcessing}
        >
          {isApplying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Apply Crop
        </Button>
      </div>
    </div>
  );
});
