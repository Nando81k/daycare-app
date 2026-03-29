'use client';

import { motion, useReducedMotion } from 'motion/react';
import { premiumTransition, revealFromBottom, revealFromSide } from './motion';

interface CinematicRevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  from?: 'bottom' | 'left' | 'right';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function CinematicReveal({
  children,
  className,
  y = 42,
  from = 'bottom',
  delay = 0,
  duration = 0.78,
  once = true,
}: CinematicRevealProps) {
  const reduceMotion = useReducedMotion();
  const variants =
    from === 'bottom' ? revealFromBottom(y) : revealFromSide(from === 'right' ? y : -y);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : variants.hidden}
      whileInView={reduceMotion ? { opacity: 1 } : variants.visible}
      viewport={{ once, amount: 0.12 }}
      transition={
        reduceMotion
          ? premiumTransition('xs')
          : {
              duration,
              delay,
              ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
            }
      }
    >
      {children}
    </motion.div>
  );
}
