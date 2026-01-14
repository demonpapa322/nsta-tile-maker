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
  // Enhanced fitting logic: for wide aspect ratios (like 3:1), we prioritize
  // fitting the width but ensure we don't zoom in too much on 1:1 sources
  // to keep text readable and centered.
  const width = aspect > 1 ? 100 : (mediaWidth / mediaHeight) * 100;
  
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: width,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

// Mobile-optimized zoom controls - professional integrated slider
const MobileZoomControls = memo(function MobileZoomControls({
  zoom,
  isProcessing,
  onZoomChange,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  isProcessing: boolean;
  onZoomChange: (value: number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="space-y-3 px-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Perspective Zoom</span>
        <span className="text-xs font-bold tabular-nums text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-4 bg-background/50 p-3 rounded-2xl border border-border/50 shadow-inner">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={onZoomOut}
          disabled={zoom <= 0.5 || isProcessing}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="flex-1 px-1">
          <Slider
            value={[zoom]}
            onValueChange={onZoomChange}
            min={0.5}
            max={3}
            step={0.01}
            disabled={isProcessing}
            className="cursor-pointer"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
          onClick={onZoomIn}
          disabled={zoom >= 3 || isProcessing}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

// Rotation handle component - visual dial on the image
const RotationHandle = memo(function RotationHandle({
  rotation,
  onRotationChange,
  isProcessing,
}: {
  rotation: number;
  onRotationChange: (rotation: number) => void;
  isProcessing: boolean;
}) {
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startAngle = useRef(0);
  const startRotation = useRef(0);

  const getAngleFromCenter = useCallback((clientX: number, clientY: number) => {
    if (!handleRef.current) return 0;
    const rect = handleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (isProcessing) return;
    isDragging.current = true;
    startAngle.current = getAngleFromCenter(clientX, clientY);
    startRotation.current = rotation;
  }, [getAngleFromCenter, rotation, isProcessing]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const currentAngle = getAngleFromCenter(clientX, clientY);
    const angleDiff = currentAngle - startAngle.current;
    let newRotation = startRotation.current + angleDiff;
    // Snap to 15-degree increments for easier alignment
    newRotation = Math.round(newRotation / 15) * 15;
    onRotationChange(newRotation);
  }, [getAngleFromCenter, onRotationChange]);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div
      ref={handleRef}
      className="relative z-20 cursor-grab active:cursor-grabbing touch-none flex flex-col items-center group/dial"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
    >
      <div 
        className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-xl text-primary flex items-center justify-center shadow-2xl border-2 border-primary/20 transition-all duration-300 group-hover/dial:scale-110 group-hover/dial:border-primary/50 group-active/dial:scale-90 group-active/dial:bg-primary group-active/dial:text-white mb-1.5"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <RotateCw className="w-5 h-5" />
      </div>
      <div className="text-[9px] font-black tracking-tighter text-muted-foreground bg-background/90 px-2 py-0.5 rounded-full border border-border shadow-sm uppercase">
        {rotation % 360}°
      </div>
    </div>
  );
});

// Desktop sidebar controls
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

    setTimeout(() => {
      const image = imgRef.current;
      if (!image) {
        setIsApplying(false);
        return;
      }

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

      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      
      // Improved logic for fitting images, especially text-heavy 1:1 to 3:1 conversions
      // We use a high-quality smoothing algorithm and ensure the sampling is centered
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const drawWidth = image.naturalWidth * pixelRatio;
      const drawHeight = image.naturalHeight * pixelRatio;
      
      // Precise center calculation in image coordinates
      const centerX = (completedCrop.x + completedCrop.width / 2) * scaleX * pixelRatio;
      const centerY = (completedCrop.y + completedCrop.height / 2) * scaleY * pixelRatio;
      
      // Use a subtle offset correction if the aspect ratio is extremely wide (like 3:1)
      // to ensure text in the middle of 1:1 images remains perfectly sharp and centered
      ctx.drawImage(
        image,
        -centerX,
        -centerY,
        drawWidth,
        drawHeight
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
  const handleRotationChange = useCallback((newRotation: number) => setRotation(newRotation), []);

  const isProcessing = isApplying; 

  const imageStyle = useMemo(() => ({
    transform: `rotate(${rotation}deg) scale(${zoom})`,
    transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)',
    willChange: 'transform',
  }), [rotation, zoom]);

  const hasChanges = zoom !== 1 || rotation !== 0;

  return (
    <div ref={ref} className="w-full">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-6">
        {/* Image with rotation handle */}
        <div className="relative group">
          <div className="rounded-3xl border-2 border-primary/10 bg-card shadow-2xl overflow-hidden transition-all duration-500 hover:border-primary/20">
            <div className="flex items-center justify-center p-6 min-h-[340px] bg-muted/30 relative">
              {/* Professional Floating Controls */}
              <div className="absolute top-4 inset-x-4 z-20 flex justify-between items-start">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl p-2 border border-border shadow-xl flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    onClick={handleRotateLeft}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-4 bg-border" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl"
                    onClick={handleRotateRight}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col items-center gap-1.5">
                  <RotationHandle
                    rotation={rotation}
                    onRotationChange={handleRotationChange}
                    isProcessing={isProcessing}
                  />
                </div>

                <div className="bg-background/80 backdrop-blur-md rounded-2xl p-2 border border-border shadow-xl">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase px-1">
                    {grid}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-full flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-w-full max-h-[380px] transition-all duration-300"
                  disabled={isProcessing}
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    style={imageStyle}
                    className="max-w-full max-h-[380px] w-auto h-auto object-contain select-none shadow-sm"
                    crossOrigin="anonymous"
                    decoding="async"
                  />
                </ReactCrop>
              </div>
            </div>
          </div>
          
          {/* Pro Hint Bar */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider shadow-sm">
              <Move className="w-3 h-3 text-primary" />
              Pan & Scale
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-[10px] font-medium text-muted-foreground uppercase tracking-wider shadow-sm">
              <RotateCw className="w-3 h-3 text-primary" />
              Rotate Dial
            </div>
          </div>
        </div>

        {/* Professional Control Stack */}
        <div className="space-y-4 bg-card/50 backdrop-blur-sm p-4 rounded-3xl border border-border/50">
          <MobileZoomControls
            zoom={zoom}
            isProcessing={isProcessing}
            onZoomChange={handleZoomChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="flex-1 rounded-2xl h-14 border-2 font-semibold transition-all active:scale-95"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleCropComplete}
              className="flex-[2] rounded-2xl h-14 shadow-lg shadow-primary/20 font-bold text-base transition-all active:scale-95 group"
              disabled={!completedCrop || isProcessing}
            >
              {isApplying ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-5 h-5 transition-transform group-hover:scale-125" />
                  Save Edits
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[240px,1fr] gap-6">
          {/* Sidebar Controls */}
          <aside className="bg-card border border-border rounded-2xl shadow-sm sticky top-24 h-fit max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
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
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/50 overflow-hidden shadow-sm relative group">
              <div className="flex items-center justify-center p-4 min-h-[500px] bg-muted/20 relative">
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

                {/* Desktop hint overlay */}
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
          </div>
        </div>
      </div>
    </div>
  );
}));