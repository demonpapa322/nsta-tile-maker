import type { Variants } from 'framer-motion';

// Lightweight cross-dissolve: opacity-only animation avoids scaling and
// repainting large page surfaces while preserving the existing navigation fade.
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] }
  }
};

