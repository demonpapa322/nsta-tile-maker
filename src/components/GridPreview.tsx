import { memo, useMemo, useState, useEffect } from 'react';
import { Grid3X3, Bookmark, User } from 'lucide-react';

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
}: { 
  index: number; 
  postOrder: number; 
  cols: number; 
  rows: number; 
  imageUrl: string; 
  showNumbers: boolean;
}) {
  const style = useMemo(() => {
    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);
    
    // Simple and correct: the image is pre-cropped to the grid aspect ratio,
    // so we just need to slice it evenly. No cover/zoom logic needed.
    // Background size = full grid dimensions (cols x rows tiles worth)
    // Each tile shows 1/cols width and 1/rows height of the image
    const bgWidth = cols * 100;
    const bgHeight = rows * 100;
    
    // Position the background so this tile shows its corresponding slice
    // For col 0: 0%, col 1: 100/(cols-1)%, etc. (percentage of movable range)
    const bgPosX = cols > 1 ? (colIndex / (cols - 1)) * 100 : 50;
    const bgPosY = rows > 1 ? (rowIndex / (rows - 1)) * 100 : 50;
    
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${bgWidth}% ${bgHeight}%`,
      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
      backgroundRepeat: 'no-repeat',
    };
  }, [index, cols, rows, imageUrl]);
  
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
