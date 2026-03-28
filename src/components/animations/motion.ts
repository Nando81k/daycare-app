export const MOTION_DURATIONS = {
  xs: 0.12,
  sm: 0.18,
  md: 0.24,
  lg: 0.36,
  xl: 0.7,
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
