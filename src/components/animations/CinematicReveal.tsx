'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { premiumTransition } from './motion';

interface CinematicRevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function CinematicReveal({
  children,
  className,
  y = 36,
  delay = 0,
  duration = 0.8,
  once = true,
}: CinematicRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y, scale: 0.985, filter: 'blur(6px)' }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.2 }}
      transition={
        reduceMotion
          ? premiumTransition('xs')
          : {
              duration,
              delay,
              ease: [0.2, 0.8, 0.2, 1],
            }
      }
    >
      {children}
    </motion.div>
  );
}
