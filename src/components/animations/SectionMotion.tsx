'use client';

import { motion, useReducedMotion } from 'motion/react';
import { premiumTransition } from './motion';

interface SectionMotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
}

export function SectionMotion({
  children,
  className,
  delay = 0,
  distance = 48,
  once = true,
  amount = 0.12,
}: SectionMotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: distance, scale: 0.97, filter: 'blur(12px)' }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={
        reduceMotion
          ? premiumTransition('xs')
          : {
              duration: 0.82,
              delay,
              ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
            }
      }
    >
      {children}
    </motion.div>
  );
}
