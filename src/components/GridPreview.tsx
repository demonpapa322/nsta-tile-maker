import { memo, useMemo, useState, useEffect } from 'react';
import { Grid3X3, Bookmark, User } from 'lucide-react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
  showNumbers?: boolean;
}

// Lightweight tile component - uses CSS transform for GPU acceleration
const GridTile = memo(function GridTile({ 
  index, 
  postOrder, 
  cols, 
  rows, 
  imageUrl, 
  showNumbers,
  imageAspect,
  gridAspect,
}: { 
  index: number; 
  postOrder: number; 
  cols: number; 
  rows: number; 
  imageUrl: string; 
  showNumbers: boolean;
  imageAspect: number;
  gridAspect: number;
}) {
  // Pre-compute all values at mount, avoid recalc on scroll
  const style = useMemo(() => {
    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);
    
    // Calculate background size to cover while maintaining aspect ratio
    // This logic ensures the image fills the grid naturally without being
    // unnaturally zoomed in or out, regardless of the original aspect ratio.
    let bgWidth: number;
    let bgHeight: number;
    
    if (imageAspect > gridAspect) {
      // Image is wider than grid - fit by height, overflow width (natural cover)
      bgHeight = rows * 100;
      bgWidth = (bgHeight * imageAspect) / gridAspect;
    } else {
      // Image is taller than grid - fit by width, overflow height (natural cover)
      bgWidth = cols * 100;
      bgHeight = (bgWidth * gridAspect) / imageAspect;
    }
    
    // Calculate position based on tile index, centered
    const offsetX = (bgWidth - cols * 100) / 2;
    const offsetY = (bgHeight - rows * 100) / 2;
    
    const bgPosX = cols > 1 
      ? (offsetX + colIndex * 100) / (bgWidth - 100) * 100
      : 50;
    const bgPosY = rows > 1 
      ? (offsetY + rowIndex * 100) / (bgHeight - 100) * 100
      : 50;
    
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${bgWidth}% ${bgHeight}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      // Use transform for GPU layer - critical for mobile
      transform: 'translate3d(0, 0, 0) scale(1.001)',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
      willChange: 'transform' as const,
    };
  }, [index, cols, rows, imageUrl, imageAspect, gridAspect]);
  
  return (
    <div className="relative aspect-square overflow-hidden">
      <div className="absolute inset-0" style={style} />
      {showNumbers && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-white">{postOrder}</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.index === nextProps.index &&
    prevProps.postOrder === nextProps.postOrder &&
    prevProps.cols === nextProps.cols &&
    prevProps.rows === nextProps.rows &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.showNumbers === nextProps.showNumbers &&
    prevProps.imageAspect === nextProps.imageAspect &&
    prevProps.gridAspect === nextProps.gridAspect
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
  const [imageAspect, setImageAspect] = useState<number>(1);

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const { cols, rows, totalTiles, gridAspect } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, totalTiles: c * r, gridAspect: c / r };
  }, [grid]);

  // Pre-compute tiles array once
  const tiles = useMemo(() => {
    return Array.from({ length: totalTiles }, (_, index) => ({
      index,
      postOrder: totalTiles - index,
    }));
  }, [totalTiles]);

  // Stable grid container style
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '2px',
    backgroundColor: 'hsl(var(--background))',
    // Force GPU compositing for smooth scroll
    transform: 'translate3d(0, 0, 0)',
    backfaceVisibility: 'hidden' as const,
    willChange: 'transform' as const,
  }), [cols]);

  return (
    <div className="w-full flex justify-center">
      <div className="rounded-xl overflow-hidden bg-card shadow-lg border border-border/50 max-w-sm w-full">
        {/* Instagram tab icons - static, never re-renders */}
        <div className="flex items-center justify-center gap-12 py-3 border-b border-border/30">
          <TabButton icon={Grid3X3} isActive={true} label="Grid view" />
          <TabButton icon={Bookmark} isActive={false} label="Saved" />
          <TabButton icon={User} isActive={false} label="Tagged" />
        </div>
        
        {/* Grid - GPU accelerated container */}
        <div style={gridStyle}>
          {tiles.map(({ index, postOrder }) => (
            <GridTile
              key={index}
              index={index}
              postOrder={postOrder}
              cols={cols}
              rows={rows}
              imageUrl={imageUrl}
              showNumbers={showNumbers}
              imageAspect={imageAspect}
              gridAspect={gridAspect}
            />
          ))}
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
