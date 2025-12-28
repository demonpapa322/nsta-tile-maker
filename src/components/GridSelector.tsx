import { forwardRef, memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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

const MAX_COLS = 10;
const MAX_ROWS = 10;

export const GridSelector = memo(forwardRef<HTMLDivElement, GridSelectorProps>(function GridSelector({ 
  selectedGrid, 
  onGridSelect 
}, ref) {
  const [customCols, setCustomCols] = useState('');
  const [customRows, setCustomRows] = useState('');
  const [error, setError] = useState('');

  const isPresetSelected = gridOptions.some(opt => opt.value === selectedGrid);

  const handleCustomApply = useCallback(() => {
    const cols = parseInt(customCols, 10);
    const rows = parseInt(customRows, 10);

    if (isNaN(cols) || isNaN(rows) || cols < 1 || rows < 1) {
      setError('Enter valid numbers (1 or more)');
      return;
    }

    if (cols > MAX_COLS || rows > MAX_ROWS) {
      setError(`Max ${MAX_COLS} columns and ${MAX_ROWS} rows`);
      return;
    }

    setError('');
    onGridSelect(`${cols}x${rows}`);
  }, [customCols, customRows, onGridSelect]);

  const handlePresetSelect = useCallback((value: string) => {
    setCustomCols('');
    setCustomRows('');
    setError('');
    onGridSelect(value);
  }, [onGridSelect]);

  return (
    <div ref={ref} className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Grid Size</h3>
      
      {/* Preset options */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {gridOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetSelect(option.value)}
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

      {/* Custom grid input */}
      <div className="border border-border rounded-xl p-3 bg-card">
        <p className="text-xs font-medium text-muted-foreground mb-2">Custom Size</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={MAX_COLS}
            placeholder="Cols"
            value={customCols}
            onChange={(e) => {
              setCustomCols(e.target.value);
              setError('');
            }}
            className="w-16 h-9 text-center text-sm"
          />
          <span className="text-muted-foreground font-medium">×</span>
          <Input
            type="number"
            min={1}
            max={MAX_ROWS}
            placeholder="Rows"
            value={customRows}
            onChange={(e) => {
              setCustomRows(e.target.value);
              setError('');
            }}
            className="w-16 h-9 text-center text-sm"
          />
          <Button
            size="sm"
            onClick={handleCustomApply}
            disabled={!customCols || !customRows}
            className="h-9 px-3"
          >
            <Check className="h-4 w-4" />
          </Button>
          {!isPresetSelected && (
            <span className="text-xs text-primary font-medium ml-1">
              {selectedGrid}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}));
