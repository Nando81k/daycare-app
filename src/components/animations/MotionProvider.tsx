'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion="user"
        transition={{
          duration: 0.62,
          ease: [0.2, 0.8, 0.2, 1],
        }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
