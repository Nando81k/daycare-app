'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { premiumTransition } from './motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const shouldReduce = Boolean(reduceMotion);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 42, scale: 0.95, filter: 'blur(14px)' }}
        animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -26, scale: 0.975, filter: 'blur(8px)' }}
        transition={shouldReduce ? premiumTransition('xs') : { duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
