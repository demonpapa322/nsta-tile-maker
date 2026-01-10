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
    <div ref={ref} className="w-full">
      {/* Instagram-style profile mock */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Profile header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-xs font-bold text-foreground/80">YP</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">your_profile</p>
            <p className="text-xs text-muted-foreground">Preview Grid</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-sm font-bold text-foreground">{totalTiles}</p>
              <p className="text-[10px] text-muted-foreground">Posts</p>
            </div>
          </div>
        </div>
        
        {/* Instagram-style grid with 1:1 tiles and authentic gaps */}
        <div 
          className="grid w-full"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '3px',
            padding: '3px',
            backgroundColor: 'hsl(var(--border))'
          }}
        >
          {tiles.map(({ index, postOrder }) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden bg-muted"
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
              
              {/* Post order number overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group">
                <div className="absolute bottom-1 right-1 min-w-5 h-5 px-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{postOrder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer info */}
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <p className="text-center text-xs text-muted-foreground">
            Post order: <span className="text-foreground font-semibold">{totalTiles}</span> → <span className="text-foreground font-semibold">1</span>
            <span className="mx-2 text-border">•</span>
            <span className="text-muted-foreground/70">{cols}×{rows} grid</span>
          </p>
        </div>
      </div>
    </div>
  );
});