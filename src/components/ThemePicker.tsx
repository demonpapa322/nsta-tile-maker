import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ThemeId = 'default' | 'pastel-green' | 'pure-white' | 'warm-beige' | 'lavender' | 'midnight';

interface ThemeOption {
  id: ThemeId;
  label: string;
  preview: string[]; // 3 color swatches
}

const themes: ThemeOption[] = [
  { id: 'default', label: 'Rose', preview: ['hsl(340,65%,65%)', 'hsl(30,30%,98%)', 'hsl(200,60%,70%)'] },
  { id: 'pastel-green', label: 'Sage', preview: ['hsl(150,35%,55%)', 'hsl(140,20%,97%)', 'hsl(160,30%,80%)'] },
  { id: 'pure-white', label: 'Snow', preview: ['hsl(220,60%,55%)', 'hsl(0,0%,100%)', 'hsl(220,30%,90%)'] },
  { id: 'warm-beige', label: 'Sand', preview: ['hsl(28,55%,58%)', 'hsl(35,30%,95%)', 'hsl(30,25%,82%)'] },
  { id: 'lavender', label: 'Lilac', preview: ['hsl(270,50%,62%)', 'hsl(270,25%,97%)', 'hsl(280,35%,82%)'] },
];

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('app-theme') as ThemeId) || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('theme-pastel-green', 'theme-pure-white', 'theme-warm-beige', 'theme-lavender', 'theme-midnight');
    if (activeTheme !== 'default') {
      root.classList.add(`theme-${activeTheme}`);
    }
    localStorage.setItem('app-theme', activeTheme);
  }, [activeTheme]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm text-muted-foreground hover:text-foreground"
      >
        <Palette className="w-4 h-4" />
        <span>Theme</span>
        {/* Active theme indicator */}
        <div className="ml-auto flex gap-0.5">
          {themes.find(t => t.id === activeTheme)?.preview.slice(0, 2).map((c, i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ background: c }} />
          ))}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-full left-0 right-0 mb-1.5 p-2 rounded-xl bg-popover border border-border/60 shadow-elevated z-50"
          >
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-2 mb-1.5">Choose theme</p>
            <div className="space-y-0.5">
              {themes.map((theme) => {
                const isActive = activeTheme === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Color swatches */}
                    <div className="flex -space-x-1">
                      {theme.preview.map((color, i) => (
                        <motion.span
                          key={i}
                          layoutId={`swatch-${theme.id}-${i}`}
                          className="w-4 h-4 rounded-full border-2 border-popover"
                          style={{ background: color, zIndex: 3 - i }}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-xs">{theme.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="theme-active"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
