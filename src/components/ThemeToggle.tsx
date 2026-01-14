import { memo, useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  if (!mounted) return <div className="p-2.5 w-[38px] h-[38px]" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full bg-secondary hover:bg-muted transition-colors border border-border overflow-hidden touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 transition-transform"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Moon className="w-4 h-4 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Sun className="w-4 h-4 text-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});
