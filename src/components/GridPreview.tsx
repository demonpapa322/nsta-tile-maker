import { forwardRef, useMemo } from 'react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
}

export const GridPreview = forwardRef<HTMLDivElement, GridPreviewProps>(function GridPreview({ imageUrl, grid }, ref) {
  const { cols, rows, totalTiles, aspect } = useMemo(() => {
    const [c, r] = grid.split('x').map(Number);
    return { cols: c, rows: r, totalTiles: c * r, aspect: c / r };
  }, [grid]);

  const tiles = useMemo(() => {
    return Array.from({ length: totalTiles }).map((_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { index, row, col, postOrder: totalTiles - index };
    });
  }, [totalTiles, cols]);

  return (
    <div ref={ref} className="w-full">
      {/* Instagram-style card preview */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Instagram header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-[2px]">
            <div className="w-full h-full rounded-full bg-card" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">your_profile</p>
            <p className="text-xs text-muted-foreground">Instagram Grid</p>
          </div>
        </div>
        
        {/* Image preview area */}
        <div className="relative w-full bg-muted/30">
          {/* Container with correct aspect ratio for the full grid */}
          <div 
            className="relative w-full"
            style={{ aspectRatio: `${cols} / ${rows}` }}
          >
            {/* Full image covering the entire grid area */}
            <img
              src={imageUrl}
              alt="Grid preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Grid overlay showing tile divisions */}
            <div 
              className="absolute inset-0 grid"
              style={{ 
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '3px',
                background: 'hsl(var(--foreground) / 0.85)'
              }}
            >
              {tiles.map(({ index, postOrder }) => (
                <div
                  key={index}
                  className="relative aspect-square bg-transparent"
                >
                  {/* Number indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-foreground shadow-sm">
                    {postOrder}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {cols} × {rows} grid
          </span>
          <span className="text-xs font-medium text-foreground">
            {totalTiles} posts
          </span>
        </div>
      </div>
    </div>
  );
});
