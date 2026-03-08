import { motion } from 'framer-motion';
import { Bot, Clock, MessageSquare, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoModeToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

const features = [
  { icon: Clock, label: 'Auto-selects best posting time' },
  { icon: Send, label: 'Schedules post automatically' },
  { icon: MessageSquare, label: 'Posts first comment instantly' },
];

export function AutoModeToggle({ enabled, onToggle }: AutoModeToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border-2 p-5 transition-all",
        enabled
          ? "border-primary/50 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5"
          : "border-border/60 bg-card"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              Full Auto Mode
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">Let AI handle everything</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <motion.div
            animate={{ x: enabled ? 26 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>

      <motion.div
        animate={{ height: enabled ? 'auto' : 0, opacity: enabled ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="space-y-2 pt-2 border-t border-border/40">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: enabled ? 1 : 0, x: enabled ? 0 : -10 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2.5 text-sm text-foreground/80"
            >
              <f.icon className="w-4 h-4 text-primary/70" />
              <span>{f.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
