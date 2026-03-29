'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface ParallaxBlockProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}

export function ParallaxBlock({ children, className, distance = 72 }: ParallaxBlockProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduceMotion ? undefined : { y }}
      transition={{ duration: 0.52, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
