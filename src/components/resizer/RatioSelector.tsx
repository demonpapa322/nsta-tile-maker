import { useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { RESIZE_PRESETS, type ResizePreset, type CustomDimensions } from '@/lib/imageResize';
import { cn } from '@/lib/utils';

interface RatioSelectorProps {
  selectedPreset: ResizePreset | null;
  customDimensions: CustomDimensions;
  onPresetSelect: (preset: ResizePreset) => void;
  onCustomChange: (dims: CustomDimensions) => void;
  onUseCustom: () => void;
  isCustom: boolean;
}

const platforms = ['Instagram', 'Facebook', 'Twitter / X', 'YouTube', 'LinkedIn', 'Pinterest', 'TikTok'] as const;

export const RatioSelector = memo(function RatioSelector({
  selectedPreset,
  customDimensions,
  onPresetSelect,
  onCustomChange,
  onUseCustom,
  isCustom,
}: RatioSelectorProps) {
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('Instagram');

  const groupedPresets = useMemo(() => {
    const groups: Record<string, ResizePreset[]> = {};
    for (const preset of RESIZE_PRESETS) {
      if (!groups[preset.platform]) groups[preset.platform] = [];
      groups[preset.platform].push(preset);
    }
    return groups;
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setExpandedPlatform(prev => prev === platform ? null : platform);
  }, []);

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onCustomChange({ ...customDimensions, width: Math.min(val, 4096) });
  }, [customDimensions, onCustomChange]);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onCustomChange({ ...customDimensions, height: Math.min(val, 4096) });
  }, [customDimensions, onCustomChange]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Dimensions</h3>

      {/* Platform Presets */}
      <div className="space-y-1">
        {platforms.map(platform => {
          const presets = groupedPresets[platform];
          if (!presets) return null;
          const isExpanded = expandedPlatform === platform;

          return (
            <div key={platform} className="rounded-xl overflow-hidden">
              <button
                onClick={() => togglePlatform(platform)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{presets[0].icon}</span>
                  <span className="font-medium">{platform}</span>
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-2 pb-2 space-y-1">
                      {presets.map(preset => {
                        const isSelected = !isCustom && selectedPreset?.id === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => onPresetSelect(preset)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all",
                              isSelected
                                ? "bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15 to-rose-500/15 border border-violet-500/30 text-foreground"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="font-medium">{preset.label}</span>
                            <span className="text-[10px] tabular-nums opacity-70">
                              {preset.width}×{preset.height}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Custom Dimensions */}
      <div className="space-y-2">
        <button
          onClick={onUseCustom}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            isCustom
              ? "bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15 to-rose-500/15 border border-violet-500/30 text-foreground"
              : "hover:bg-muted/50 text-muted-foreground"
          )}
        >
          ✏️ Custom Size
        </button>

        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 px-2"
          >
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Width</label>
              <input
                type="number"
                value={customDimensions.width || ''}
                onChange={handleWidthChange}
                placeholder="1080"
                min={1}
                max={4096}
                className="w-full mt-1 px-2.5 py-1.5 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
            <div className="flex items-end pb-2 text-muted-foreground text-xs">×</div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Height</label>
              <input
                type="number"
                value={customDimensions.height || ''}
                onChange={handleHeightChange}
                placeholder="1080"
                min={1}
                max={4096}
                className="w-full mt-1 px-2.5 py-1.5 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});
