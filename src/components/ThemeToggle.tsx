import { memo, useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = memo(function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      setTheme(newTheme);
    });
  }, [resolvedTheme, setTheme]);

  if (!mounted) return <div className="p-2.5 w-[38px] h-[38px]" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full bg-secondary hover:bg-muted transition-colors border border-border overflow-hidden touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 transition-transform"
      aria-label="Toggle theme"
      style={{ transform: 'translateZ(0)' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
          >
            <Moon className="w-4 h-4 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
          >
            <Sun className="w-4 h-4 text-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
});
