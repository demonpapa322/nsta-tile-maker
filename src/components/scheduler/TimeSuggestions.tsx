import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeSuggestion {
  time: string;
  day: string;
  engagementScore: number;
  reason: string;
}

interface TimeSuggestionsProps {
  suggestions: TimeSuggestion[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  isLoading: boolean;
}

export function TimeSuggestions({ suggestions, selectedIndex, onSelect, isLoading }: TimeSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => {
        const isSelected = selectedIndex === i;
        const isBest = i === 0;
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(i)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
              isSelected
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 bg-card hover:border-primary/40 hover:shadow-sm"
            )}
          >
            {isBest && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Best
              </span>
            )}
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {isSelected ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{s.time}</span>
                  <span className="text-xs text-muted-foreground">· {s.day}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{s.reason}</p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {s.engagementScore}%
                </div>
                <span className="text-[10px] text-muted-foreground">predicted</span>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
