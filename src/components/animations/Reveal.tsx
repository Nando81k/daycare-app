'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { premiumTransition } from './motion';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  delay?: number;
}

export function Reveal({ children, className, distance = 12, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={
        reduceMotion
          ? premiumTransition('xs')
          : {
              ...premiumTransition('lg'),
              delay,
            }
      }
    >
      {children}
    </motion.div>
  );
}
