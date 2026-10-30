import type { Variants } from 'framer-motion';

// iOS-style app open/close page transition: quick fade-out, gentle fade-in
// with a barely-there zoom. Pure tween with an iOS-style easing curve —
// no springs, so there is zero bounce or jitter.
export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.995,
    transition: { duration: 0.18, ease: [0.5, 0, 0.75, 0] }
  }
};
