/**
 * Animation utilities and helpers
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get transition duration based on user preference
 */
export function getTransitionDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * Animation variants for common use cases
 */
export const animations = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Slide animations
  slideInFromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  
  slideInFromLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  
  slideInFromTop: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  
  slideInFromBottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  
  // Scale animations
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  
  scaleUp: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  
  // Collapse animations
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
};

/**
 * Transition presets
 */
export const transitions = {
  fast: { duration: 0.15, ease: 'easeInOut' },
  normal: { duration: 0.25, ease: 'easeInOut' },
  slow: { duration: 0.35, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
};

/**
 * Get CSS transition string
 */
export function getCSSTransition(
  properties: string[],
  duration: 'fast' | 'normal' | 'slow' = 'normal'
): string {
  if (prefersReducedMotion()) {
    return 'none';
  }
  
  const durations = {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  };
  
  return properties
    .map(prop => `${prop} ${durations[duration]} ease-in-out`)
    .join(', ');
}

/**
 * Stagger children animation helper
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  if (prefersReducedMotion()) return 0;
  return index * baseDelay;
}

/**
 * Hover animation helper
 */
export function getHoverAnimation(scale: number = 1.05) {
  if (prefersReducedMotion()) {
    return {};
  }
  
  return {
    scale,
    transition: { duration: 0.2 },
  };
}

/**
 * Tap animation helper
 */
export function getTapAnimation(scale: number = 0.95) {
  if (prefersReducedMotion()) {
    return {};
  }
  
  return {
    scale,
    transition: { duration: 0.1 },
  };
}

/**
 * Page transition variants
 */
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
    transition: { duration: 0.2 },
  },
};

/**
 * Modal animation variants
 */
export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  
  content: {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

/**
 * Toast notification animation variants
 */
export const toastAnimations = {
  topRight: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  topLeft: {
    initial: { x: -400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -400, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  bottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * List item animation variants
 */
export const listItemAnimations = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
  },
};
