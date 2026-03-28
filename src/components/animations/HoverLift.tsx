'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type HoverLiftElement = 'div' | 'article' | 'section';

interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
  as?: HoverLiftElement;
  lift?: number;
  scale?: number;
  [key: string]: unknown;
}

export function HoverLift({
  children,
  className,
  as = 'div',
  lift = 8,
  scale = 1.01,
  ...rest
}: HoverLiftProps) {
  const reduceMotion = useReducedMotion();

  const shared = {
    className: cn(className, !reduceMotion && 'will-change-transform'),
    whileHover: reduceMotion ? undefined : { y: -lift, scale },
    whileTap: reduceMotion ? undefined : { scale: 0.997 },
    transition: {
      duration: reduceMotion ? 0.12 : 0.28,
      ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
    },
    ...rest,
  };

  if (as === 'article') {
    return <motion.article {...(shared as any)}>{children}</motion.article>;
  }

  if (as === 'section') {
    return <motion.section {...(shared as any)}>{children}</motion.section>;
  }

  return <motion.div {...(shared as any)}>{children}</motion.div>;
}
