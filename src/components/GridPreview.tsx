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

  // Limit preview size based on grid complexity
  const maxPreviewWidth = cols > 3 ? 'max-w-md' : 'max-w-sm';

  return (
    <div ref={ref} className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Preview</h3>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div>
            <p className="text-sm font-medium">your_profile</p>
          </div>
        </div>
        
        <div className={`mx-auto ${maxPreviewWidth}`}>
          {/* Container with correct aspect ratio for the full grid */}
          <div 
            className="relative w-full rounded-lg overflow-hidden bg-border"
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
              className="absolute inset-0 grid gap-px"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {tiles.map(({ index, postOrder }) => (
                <div
                  key={index}
                  className="relative aspect-square border border-background/20"
                >
                  {/* Number indicator */}
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-[8px] font-bold">
                    {postOrder}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          Post order: <span className="text-foreground font-medium">{totalTiles} → 1</span>
        </p>
      </div>
    </div>
  );
});
