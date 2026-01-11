import { memo, useMemo } from 'react';
import { Grid3X3, Bookmark, User } from 'lucide-react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
  showNumbers?: boolean;
}

// Memoized tile component to prevent re-renders
const GridTile = memo(function GridTile({ 
  index, 
  postOrder, 
  cols, 
  rows, 
  imageUrl, 
  showNumbers 
}: { 
  index: number; 
  postOrder: number; 
  cols: number; 
  rows: number; 
  imageUrl: string; 
  showNumbers: boolean;
}) {
  // Pre-compute position percentages
  const bgPosX = cols > 1 ? (index % cols) * (100 / (cols - 1)) : 50;
  const bgPosY = rows > 1 ? Math.floor(index / cols) * (100 / (rows - 1)) : 50;
  
  return (
    <div className="relative aspect-square overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${cols * 100}% ${rows * 100}%`,
          backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        }}
      />
      
      {showNumbers && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md">
          <span className="text-xs font-semibold text-white">{postOrder}</span>
        </div>
      )}
    </div>
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

  const tiles = useMemo(() => {
    return Array.from({ length: totalTiles }, (_, index) => ({
      index,
      postOrder: totalTiles - index,
    }));
  }, [totalTiles]);

  // Memoize grid style to prevent object recreation
  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '2px',
    backgroundColor: 'hsl(var(--background))'
  }), [cols]);

  return (
    <div className="w-full flex justify-center">
      <div className="rounded-xl overflow-hidden bg-card shadow-lg border border-border/50 max-w-sm w-full">
        {/* Instagram tab icons */}
        <div className="flex items-center justify-center gap-12 py-3 border-b border-border/30">
          <button className="p-2 text-foreground" aria-label="Grid view">
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground/50" aria-label="Saved">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground/50" aria-label="Tagged">
            <User className="w-5 h-5" />
          </button>
        </div>
        
        {/* Grid */}
        <div className="grid w-full" style={gridStyle}>
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
});
