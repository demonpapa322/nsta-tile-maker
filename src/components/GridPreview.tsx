import { memo, useMemo } from 'react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
}

export const GridPreview = memo(function GridPreview({ imageUrl, grid }: GridPreviewProps) {
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
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Preview</h3>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div>
            <p className="text-sm font-medium">your_profile</p>
          </div>
        </div>
        
        <div 
          className="grid gap-px rounded-lg overflow-hidden bg-border"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {tiles.map(({ index, row, col, postOrder }) => (
            <div
              key={index}
              className="relative aspect-square bg-card overflow-hidden group"
            >
              <div 
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${cols * 100}% ${rows * 100}%`,
                  backgroundPosition: `${cols > 1 ? (col / (cols - 1)) * 100 : 50}% ${rows > 1 ? (row / (rows - 1)) * 100 : 50}%`,
                }}
              />
              
              {/* Number indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold">
                {postOrder}
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          Post order: <span className="text-foreground font-medium">{totalTiles} → 1</span>
        </p>
      </div>
    </div>
  );
});
