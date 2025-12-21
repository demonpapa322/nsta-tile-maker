import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GridSelectorProps {
  selectedGrid: string;
  onGridSelect: (grid: string) => void;
}

const gridOptions = [
  { value: '3x1', label: '3×1', cols: 3, rows: 1 },
  { value: '3x2', label: '3×2', cols: 3, rows: 2 },
  { value: '3x3', label: '3×3', cols: 3, rows: 3 },
  { value: '3x4', label: '3×4', cols: 3, rows: 4 },
];

export function GridSelector({ selectedGrid, onGridSelect }: GridSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold mb-4">Grid Size</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {gridOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onGridSelect(option.value)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200",
              selectedGrid === option.value
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground/50"
            )}
          >
            {selectedGrid === option.value && (
              <motion.div
                layoutId="gridSelector"
                className="absolute inset-0 rounded-xl bg-primary/10 border-2 border-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center gap-3">
              {/* Mini grid preview */}
              <div 
                className="grid gap-0.5"
                style={{ 
                  gridTemplateColumns: `repeat(${option.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${option.rows}, 1fr)`,
                }}
              >
                {Array.from({ length: option.cols * option.rows }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-sm",
                      selectedGrid === option.value
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>
              
              <span className={cn(
                "text-sm font-medium",
                selectedGrid === option.value
                  ? "text-primary"
                  : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
