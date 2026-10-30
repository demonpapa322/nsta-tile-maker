import type { Variants } from 'framer-motion';

// iOS-style app open/close page transition: the outgoing page fades out
// while the incoming one fades in over it (true cross-dissolve, pages
// stacked via .page-stack in index.css). Pure tweens with an iOS-style
// easing curve — no springs, so there is zero bounce or jitter.
export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.995,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }
};

