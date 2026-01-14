import { useState, useRef, useCallback, forwardRef, useEffect, useMemo, memo } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Check, RotateCcw, Move, ZoomIn, RotateCw, Minus, Plus, Loader2 } from 'lucide-react';
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

// Memoized controls component for sidebar
const SidebarControls = memo(function SidebarControls({
  zoom,
  rotation,
  isProcessing,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onReset,
  onCancel,
  onApply,
  canApply,
  isApplying
}: {
  zoom: number;
  rotation: number;
  isProcessing: boolean;
  onZoomChange: (value: number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
  canApply: boolean;
  isApplying: boolean;
}) {
  return (
    <div className="flex flex-col h-full gap-6 p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <ZoomIn className="w-4 h-4" />
          Zoom
        </h3>
        <div className="space-y-3">
          <Slider
            value={[zoom]}
            onValueChange={onZoomChange}
            min={0.5}
            max={3}
            step={0.1}
            disabled={isProcessing}
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomOut}
              disabled={zoom <= 0.5 || isProcessing}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomIn}
              disabled={zoom >= 3 || isProcessing}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          Rotation
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateLeft}
            className="h-9 px-2 text-xs"
            disabled={isProcessing}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRotateRight}
            className="h-9 px-2 text-xs"
            disabled={isProcessing}
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            +90°
          </Button>
        </div>
        <div className="text-center">
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            Current: {rotation % 360}°
          </span>
        </div>
      </div>

      <div className="mt-auto space-y-2 pt-6 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full justify-start gap-2 h-9"
          disabled={isProcessing}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-9"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={onApply}
            className="h-9"
            disabled={!canApply || isProcessing}
          >
            {isApplying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Done
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export const ImageCropper = memo(forwardRef<HTMLDivElement, ImageCropperProps>(function ImageCropper({
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
  const [isApplying, setIsApplying] = useState(false);
  
  const { revokeAll } = useObjectUrlManager();
  
  const { cols, rows, aspect } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, aspect: c / r };
  }, [grid]);

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

      // Use OffscreenCanvas if available
      const useOffscreen = typeof OffscreenCanvas !== 'undefined';
      
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      const width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      const height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      let canvas: HTMLCanvasElement | OffscreenCanvas;
      let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

      if (useOffscreen) {
        canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
      } else {
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
      }

      if (!ctx) {
        setIsApplying(false);
        return;
      }

      // Rotate and scale the image correctly on the canvas
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
        image.naturalWidth,
        image.naturalHeight,
      );

      const handleBlob = (blob: Blob | null) => {
        setIsApplying(false);
        if (blob) {
          const croppedUrl = URL.createObjectURL(blob);
          onCropComplete(croppedUrl);
        }
      };

      if (useOffscreen && canvas instanceof OffscreenCanvas) {
        canvas.convertToBlob({ type: 'image/png', quality: 1.0 }).then(handleBlob);
      } else {
        (canvas as HTMLCanvasElement).toBlob(handleBlob, 'image/png', 1.0);
      }
    }, 10);
  }, [completedCrop, onCropComplete, zoom, rotation]);

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
  const handleZoomChange = useCallback((value: number[]) => setZoom(value[0]), []);

  // Superior transformation logic - no debouncing, using CSS for instant feedback, 
  // and optimized canvas rendering for the final crop
  const isProcessing = isApplying; 

  // Instead of re-rendering a new blob on every zoom/rotate (which is slow),
  // we apply CSS transforms to the image in the cropper for instant feedback,
  // and only perform the heavy canvas work when "Apply" is clicked.
  const imageStyle = useMemo(() => ({
    transform: `rotate(${rotation}deg) scale(${zoom})`,
    transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
    willChange: 'transform',
  }), [rotation, zoom]);

  return (
    <div ref={ref} className="w-full">
      {/* Mobile-only header info */}
      <div className="flex lg:hidden items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Move className="w-3.5 h-3.5" />
          <span>Drag to reposition</span>
        </div>
        <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Grid: {cols}:{rows}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
        {/* Sidebar Controls - Desktop Left, Mobile Top */}
        <aside className="order-2 lg:order-1 bg-card border border-border rounded-2xl shadow-sm lg:sticky lg:top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <SidebarControls
            zoom={zoom}
            rotation={rotation}
            isProcessing={isProcessing}
            onZoomChange={handleZoomChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            onReset={handleReset}
            onCancel={onCancel}
            onApply={handleCropComplete}
            canApply={!!completedCrop}
            isApplying={isApplying}
          />
        </aside>

        {/* Main Crop Area */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="rounded-2xl border border-border bg-card/50 overflow-hidden shadow-sm relative group">
            <div className="flex items-center justify-center p-4 min-h-[300px] lg:min-h-[500px] bg-muted/20 relative">
              <div className="w-full h-full flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-w-full max-h-[500px] transition-transform duration-200"
                  disabled={isProcessing}
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={imageStyle}
                    className="max-w-full max-h-[500px] w-auto h-auto object-contain select-none"
                    crossOrigin="anonymous"
                    decoding="async"
                  />
                </ReactCrop>
              </div>

              {/* Desktop-only hint overlay */}
              <div className="hidden lg:group-hover:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-4 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-xs text-muted-foreground shadow-sm pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-1.5">
                  <Move className="w-3 h-3" />
                  Drag image to reposition
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 border border-muted-foreground rounded-[2px]" />
                  Corners to resize
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile-only action buttons footer */}
          <div className="flex lg:hidden gap-3 mt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="flex-1 rounded-xl"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleCropComplete}
              className="flex-[2] rounded-xl"
              disabled={!completedCrop || isProcessing}
            >
              {isApplying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}));
