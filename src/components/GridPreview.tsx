import { forwardRef, useMemo } from 'react';
import { Grid3X3, Bookmark, User } from 'lucide-react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
  showNumbers?: boolean;
}

export const GridPreview = forwardRef<HTMLDivElement, GridPreviewProps>(function GridPreview({ imageUrl, grid, showNumbers = true }, ref) {
  const { cols, rows, totalTiles } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, totalTiles: c * r };
  }, [grid]);

  const tiles = useMemo(() => {
    return Array.from({ length: totalTiles }).map((_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { index, row, col, postOrder: totalTiles - index };
    });
  }, [totalTiles, cols]);

  return (
    <div ref={ref} className="w-full flex justify-center">
      {/* Instagram-style profile mock */}
      <div className="rounded-xl overflow-hidden bg-card shadow-lg border border-border/50 max-w-sm w-full">
        {/* Instagram tab icons */}
        <div className="flex items-center justify-center gap-12 py-3 border-b border-border/30">
          <button className="p-2 text-foreground">
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
        
        {/* Grid */}
        <div 
          className="grid w-full"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '2px',
            backgroundColor: 'hsl(var(--background))'
          }}
        >
          {tiles.map(({ index, postOrder }) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden"
            >
              {/* Each tile shows its portion of the image */}
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${(index % cols) * (100 / (cols - 1 || 1))}% ${Math.floor(index / cols) * (100 / (rows - 1 || 1))}%`,
                }}
              />
              
              {/* Post order number badge */}
              {showNumbers && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md">
                  <span className="text-xs font-semibold text-white">{postOrder}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});