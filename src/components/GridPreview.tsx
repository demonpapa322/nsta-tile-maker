import { forwardRef, useMemo } from 'react';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
}

export const GridPreview = forwardRef<HTMLDivElement, GridPreviewProps>(function GridPreview({ imageUrl, grid }, ref) {
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
      {/* Clean Instagram-style grid */}
      <div className="rounded-xl overflow-hidden bg-background shadow-lg border border-border/50 max-w-md w-full">
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
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center shadow-md">
                <span className="text-xs font-semibold text-white">{postOrder}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});