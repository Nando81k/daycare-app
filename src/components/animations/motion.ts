export const MOTION_DURATIONS = {
  xs: 0.16,
  sm: 0.3,
  md: 0.56,
  lg: 0.82,
  xl: 1.05,
} as const;

export const MOTION_EASE = {
  standard: 'easeOut',
  premium: [0.2, 0.8, 0.2, 1],
} as const;

type DurationKey = keyof typeof MOTION_DURATIONS;

export function premiumTransition(duration: DurationKey = 'md') {
  return {
    duration: MOTION_DURATIONS[duration],
    ease: MOTION_EASE.premium,
  } as const;
}

export function revealFromBottom(distance = 44) {
  return {
    hidden: { opacity: 0, y: distance, scale: 0.96, filter: 'blur(14px)' },
    visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  } as const;
}

export function revealFromSide(distance = 52) {
  return {
    hidden: { opacity: 0, x: distance, scale: 0.965, filter: 'blur(14px)' },
    visible: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
  } as const;
}

export function staggerParent(stagger = 0.14, delayChildren = 0.07) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  } as const;
}

export function motionSafe() {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function motionCapability(): 'off' | 'reduced' | 'full' {
  if (typeof window === 'undefined') return 'off';
  if (!motionSafe()) return 'off';

  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const lowThreads = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  if (narrow || saveData || lowThreads) return 'reduced';
  return 'full';
}

export function cinematicEnabled() {
  return motionCapability() === 'full';
}
