'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
        initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.99, filter: 'blur(8px)' }}
        animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.995, filter: 'blur(6px)' }}
        transition={shouldReduce ? premiumTransition('xs') : { duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
