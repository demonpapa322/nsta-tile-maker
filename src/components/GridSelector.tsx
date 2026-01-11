import { memo, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface GridSelectorProps {
  selectedGrid: string;
  onGridSelect: (grid: string) => void;
}

const gridOptions = [
  { value: '3x1', label: '3×1', cols: 3, rows: 1 },
  { value: '3x2', label: '3×2', cols: 3, rows: 2 },
  { value: '3x3', label: '3×3', cols: 3, rows: 3 },
  { value: '3x4', label: '3×4', cols: 3, rows: 4 },
] as const;

const MIN_COLS = 1;
const MAX_COLS = 10;
const MIN_ROWS = 1;
const MAX_ROWS = 10;

// Memoized preset button to prevent re-renders
const PresetButton = memo(function PresetButton({
  option,
  isSelected,
  onClick,
}: {
  option: typeof gridOptions[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const gridPreviewStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${option.cols}, 1fr)`,
    gridTemplateRows: `repeat(${option.rows}, 1fr)`,
  }), [option.cols, option.rows]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-xl border-2 transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <div className="flex flex-col items-center gap-1.5">
        <div className="grid gap-0.5" style={gridPreviewStyle}>
          {Array.from({ length: option.cols * option.rows }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-sm transition-colors",
                isSelected ? "bg-primary" : "bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
        
        <span className={cn(
          "text-xs font-semibold transition-colors",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
          {option.label}
        </span>
      </div>
    </button>
  );
});

export const GridSelector = memo(function GridSelector({ 
  selectedGrid, 
  onGridSelect 
}: GridSelectorProps) {
  const [customCols, setCustomCols] = useState(3);
  const [customRows, setCustomRows] = useState(1);
  const [showCustom, setShowCustom] = useState(false);

  const isPresetSelected = useMemo(() => 
    gridOptions.some(opt => opt.value === selectedGrid), 
    [selectedGrid]
  );

  const handlePresetSelect = useCallback((value: string) => {
    setShowCustom(false);
    onGridSelect(value);
  }, [onGridSelect]);

  const handleCustomChange = useCallback((newCols: number, newRows: number) => {
    const cols = Math.min(MAX_COLS, Math.max(MIN_COLS, newCols));
    const rows = Math.min(MAX_ROWS, Math.max(MIN_ROWS, newRows));
    setCustomCols(cols);
    setCustomRows(rows);
    onGridSelect(`${cols}x${rows}`);
  }, [onGridSelect]);

  const activateCustom = useCallback(() => {
    setShowCustom(true);
  }, []);

  const incrementCols = useCallback(() => {
    activateCustom();
    handleCustomChange(customCols + 1, customRows);
  }, [activateCustom, handleCustomChange, customCols, customRows]);

  const decrementCols = useCallback(() => {
    activateCustom();
    handleCustomChange(customCols - 1, customRows);
  }, [activateCustom, handleCustomChange, customCols, customRows]);

  const incrementRows = useCallback(() => {
    activateCustom();
    handleCustomChange(customCols, customRows + 1);
  }, [activateCustom, handleCustomChange, customCols, customRows]);

  const decrementRows = useCallback(() => {
    activateCustom();
    handleCustomChange(customCols, customRows - 1);
  }, [activateCustom, handleCustomChange, customCols, customRows]);

  const isCustomActive = showCustom && !isPresetSelected;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Grid Size</span>
      </div>
      
      {/* Preset options */}
      <div className="grid grid-cols-4 gap-2">
        {gridOptions.map((option) => (
          <PresetButton
            key={option.value}
            option={option}
            isSelected={selectedGrid === option.value && !showCustom}
            onClick={() => handlePresetSelect(option.value)}
          />
        ))}
      </div>

      {/* Custom grid controls */}
      <div className={cn(
        "border rounded-lg p-2.5 bg-card transition-colors",
        isCustomActive ? "border-primary" : "border-border"
      )}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Custom</span>
          {isCustomActive && (
            <span className="text-[10px] text-primary font-medium">
              {selectedGrid}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-3 mt-2">
          {/* Rows control */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-0.5">R</span>
            <button
              onClick={decrementRows}
              disabled={customRows <= MIN_ROWS}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-medium text-xs">{customRows}</span>
            <button
              onClick={incrementRows}
              disabled={customRows >= MAX_ROWS}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <span className="text-muted-foreground font-medium text-sm">×</span>

          {/* Columns control */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-0.5">C</span>
            <button
              onClick={decrementCols}
              disabled={customCols <= MIN_COLS}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-medium text-xs">{customCols}</span>
            <button
              onClick={incrementCols}
              disabled={customCols >= MAX_COLS}
              className="w-6 h-6 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
