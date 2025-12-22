import { memo } from 'react';
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
  { value: '4x4', label: '4×4', cols: 4, rows: 4 },
  { value: '4x5', label: '4×5', cols: 4, rows: 5 },
];

export const GridSelector = memo(function GridSelector({ 
  selectedGrid, 
  onGridSelect 
}: GridSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Grid Size</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {gridOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onGridSelect(option.value)}
            className={cn(
              "relative p-3 rounded-xl border transition-colors",
              selectedGrid === option.value
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground/50"
            )}
          >
            <div className="flex flex-col items-center gap-2">
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
                      "w-2.5 h-2.5 rounded-sm transition-colors",
                      selectedGrid === option.value
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    )}
                  />
                ))}
              </div>
              
              <span className={cn(
                "text-xs font-medium transition-colors",
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
    </div>
  );
});
