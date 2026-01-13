import { memo, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2.5 rounded-full bg-secondary hover:bg-muted transition-colors border border-border overflow-hidden will-animate touch-manipulation"
      aria-label="Toggle theme"
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="sync" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            className="will-animate"
            initial={{ y: -18, opacity: 0, rotate: -70 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 18, opacity: 0, rotate: 70 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Moon className="w-4 h-4 text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            className="will-animate"
            initial={{ y: 18, opacity: 0, rotate: 70 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -18, opacity: 0, rotate: -70 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Sun className="w-4 h-4 text-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});
