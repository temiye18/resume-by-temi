import type { Variants, Transition } from 'motion/react';

export const easeOutQuart = [0.25, 1, 0.5, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

export const heroWordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.06,
    },
  },
};

export const heroWordVariants: Variants = {
  hidden: { y: '105%' },
  visible: {
    y: 0,
    transition: { duration: 0.75, ease: easeOutExpo },
  },
};

export const heroFadeUpVariants: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const italicAccentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutExpo, delay: 0.08 },
  },
};

export const canvasLiftVariants: Variants = {
  hidden: { y: 18, scale: 0.985 },
  visible: {
    y: 0,
    scale: 1,
    transition: { duration: 0.95, ease: easeOutExpo },
  },
};

export const principleContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.08,
    },
  },
};

export const principleNumberVariants: Variants = {
  hidden: { y: '110%' },
  visible: {
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export const principleBodyVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo, delay: 0.18 },
  },
};

export const ctaArrowVariants: Variants = {
  rest: { x: 0, y: 0 },
  hover: {
    x: 2,
    y: -2,
    transition: { duration: 0.32, ease: easeOutQuart },
  },
};

export const ctaButtonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.015,
    transition: { duration: 0.24, ease: easeOutQuart },
  },
  pressed: {
    scale: 0.985,
    transition: { duration: 0.08, ease: easeOutQuart },
  },
};

export const tileVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.04,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const tileNumberVariants: Variants = {
  rest: { x: 0 },
  hover: {
    x: -4,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

export const reducedTransition: Transition = { duration: 0 };
export const reducedFadeTransition: Transition = { duration: 0.18, ease: 'linear' };
