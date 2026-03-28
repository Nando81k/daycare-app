'use client';

import { Children } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { premiumTransition } from './motion';

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
  stagger = 0.08,
  y = 28,
}: CinematicStaggerProps) {
  const reduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y, scale: 0.985, filter: 'blur(4px)' },
    visible: reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      transition={
        reduceMotion
          ? premiumTransition('xs')
          : {
              staggerChildren: stagger,
              delayChildren: 0.04,
            }
      }
    >
      {Children.map(children, (child, index) => (
        <motion.div
          variants={itemVariants}
          transition={reduceMotion ? premiumTransition('xs') : { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          key={index}
          data-stagger-wrapper={selector}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
