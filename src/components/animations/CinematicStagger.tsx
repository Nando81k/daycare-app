'use client';

import { Children } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { premiumTransition, revealFromBottom, staggerParent } from './motion';

interface CinematicStaggerProps {
  children: React.ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  y?: number;
}

export function CinematicStagger({
  children,
  className,
  selector = '[data-stagger-item]',
  stagger = 0.13,
  y = 36,
}: CinematicStaggerProps) {
  const reduceMotion = useReducedMotion();
  const itemVariants = revealFromBottom(y);
  const parentVariants = staggerParent(stagger, 0.03);

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : parentVariants}
      initial={reduceMotion ? undefined : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.1 }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={reduceMotion ? undefined : itemVariants}
          initial={reduceMotion ? { opacity: 1 } : undefined}
          whileInView={reduceMotion ? { opacity: 1 } : undefined}
          viewport={reduceMotion ? { once: true, amount: 0.1 } : undefined}
          transition={reduceMotion ? premiumTransition('xs') : { duration: 0.74, ease: [0.2, 0.8, 0.2, 1] }}
          data-stagger-wrapper={selector}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
