import { motion } from 'framer-motion';

interface GridPreviewProps {
  imageUrl: string;
  grid: string;
}

export function GridPreview({ imageUrl, grid }: GridPreviewProps) {
  const [cols, rows] = grid.split('x').map(Number);
  const totalTiles = cols * rows;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold mb-4">Instagram Preview</h3>
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-primary" />
          <div>
            <p className="font-semibold text-sm">your_profile</p>
            <p className="text-xs text-muted-foreground">Your Location</p>
          </div>
        </div>
        
        <div 
          className="grid gap-0.5 rounded-lg overflow-hidden bg-border"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {Array.from({ length: totalTiles }).map((_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative aspect-square bg-card overflow-hidden group"
              >
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${cols * 100}% ${rows * 100}%`,
                    backgroundPosition: `${(col / (cols - 1 || 1)) * 100}% ${(row / (rows - 1 || 1)) * 100}%`,
                  }}
                />
                
                {/* Tile number overlay */}
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-2xl font-bold">
                    {totalTiles - index}
                  </span>
                </div>
                
                {/* Small number indicator */}
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                  {totalTiles - index}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          Post in order: <span className="text-foreground font-medium">{totalTiles} → 1</span> (bottom-right to top-left)
        </p>
      </div>
    </motion.div>
  );
}
