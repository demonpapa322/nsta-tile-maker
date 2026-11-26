import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Bookmark, User } from 'lucide-react';
import { calculateGridFitGeometry, GridFitGeometry } from '@/lib/gridFitGeometry';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
  showNumbers?: boolean;
}

// Simplified tile component - uses straightforward background positioning
const GridTile = memo(function GridTile({ 
  index, 
  postOrder, 
  cols, 
  rows, 
  imageUrl, 
  showNumbers,
  fit,
}: { 
  index: number; 
  postOrder: number; 
  cols: number; 
  rows: number; 
  imageUrl: string; 
  showNumbers: boolean;
  fit: GridFitGeometry | null;
}) {
  const column = index % cols;
  const row = Math.floor(index / cols);
  const style = useMemo(() => {
    if (!fit) return null;

    const getLayerStyle = (x: number, y: number, width: number, height: number) => ({
      left: `${((x / fit.tileSize) - column) * 100}%`,
      top: `${((y / fit.tileSize) - row) * 100}%`,
      width: `${(width / fit.tileSize) * 100}%`,
      height: `${(height / fit.tileSize) * 100}%`,
    });

    return {
      background: getLayerStyle(fit.backgroundX, fit.backgroundY, fit.backgroundWidth, fit.backgroundHeight),
      source: getLayerStyle(fit.imageX, fit.imageY, fit.imageWidth, fit.imageHeight),
    };
  }, [column, fit, row]);
  
  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      {fit && style && (
        <>
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
            className="absolute max-w-none pointer-events-none blur-[10px] brightness-[0.72]"
            style={style.background}
          />
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
            className="absolute max-w-none pointer-events-none"
            style={style.source}
          />
        </>
      )}
      {showNumbers && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white">{postOrder}</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.postOrder === nextProps.postOrder &&
    prevProps.cols === nextProps.cols &&
    prevProps.rows === nextProps.rows &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.showNumbers === nextProps.showNumbers
  );
});

// Tab button component - prevents parent re-renders
const TabButton = memo(function TabButton({ 
  icon: Icon, 
  isActive, 
  label 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  isActive: boolean; 
  label: string;
}) {
  return (
    <button 
      className={`p-2 ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`} 
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
});

export const GridPreview = memo(function GridPreview({ 
  imageUrl, 
  grid, 
  showNumbers = true 
}: GridPreviewProps) {
  const { cols, rows, totalTiles } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, totalTiles: c * r };
  }, [grid]);

  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImageDimensions(null);
    const image = new Image();
    image.onload = () => {
      if (!cancelled) {
        setImageDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      }
    };
    image.onerror = () => {
      if (!cancelled) setImageDimensions(null);
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [imageUrl]);

  const fit = useMemo(() => {
    if (!imageDimensions) return null;
    return calculateGridFitGeometry(imageDimensions.width, imageDimensions.height, cols, rows);
  }, [cols, imageDimensions, rows]);

  // Pre-compute tiles array once
  const tiles = useMemo(() => {
    return Array.from({ length: totalTiles }, (_, index) => ({
      index,
      postOrder: totalTiles - index,
    }));
  }, [totalTiles]);

  // Cross-fade on image change: keep the previous image as an overlay that
  // dissolves out while the tiles underneath already show the new image.
  const [fadingImage, setFadingImage] = useState<string | null>(null);
  const prevImageRef = useRef(imageUrl);
  useEffect(() => {
    if (prevImageRef.current !== imageUrl) {
      const prev = prevImageRef.current;
      prevImageRef.current = imageUrl;
      setFadingImage(prev);
    }
  }, [imageUrl]);

  // Stable grid container style
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '2px',
    backgroundColor: 'hsl(var(--background))',
  }), [cols]);

  return (
    <div className="w-full flex justify-center">
      <div className="rounded-xl overflow-hidden bg-card shadow-lg border border-border/50 max-w-sm w-full">
        {/* Instagram tab icons */}
        <div className="flex items-center justify-center gap-12 py-3 border-b border-border/30">
          <TabButton icon={Grid3X3} isActive={true} label="Grid view" />
          <TabButton icon={Bookmark} isActive={false} label="Saved" />
          <TabButton icon={User} isActive={false} label="Tagged" />
        </div>

        {/* Grid */}
        <div style={gridStyle} className="relative">
          {tiles.map(({ index, postOrder }) => (
            <GridTile
              key={index}
              index={index}
              postOrder={postOrder}
              cols={cols}
              rows={rows}
              imageUrl={imageUrl}
              showNumbers={showNumbers}
              fit={fit}
            />
          ))}

          {/* Previous image dissolving out over the new one */}
          {fadingImage && (
            <motion.div
              key={fadingImage}
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${fadingImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onAnimationComplete={() => setFadingImage(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.grid === nextProps.grid &&
    prevProps.showNumbers === nextProps.showNumbers
  );
});
