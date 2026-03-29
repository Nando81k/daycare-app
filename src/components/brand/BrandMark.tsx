'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className, size = 34 }: BrandMarkProps) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center justify-center rounded-[7px] border bg-white p-1.5 shadow-soft',
        className,
      )}
      whileHover={{ y: -2, scale: 1.015 }}
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <rect x="7" y="7" width="42" height="42" rx="8" fill="#0f2340" />
        <rect x="11" y="11" width="34" height="34" rx="5" stroke="#72a5ff" strokeWidth="1.8" fill="url(#markGradient)" />
        <path d="M17 37V22.8L28 16L39 22.8V37H17Z" fill="#0f4fc9" stroke="#cfe0ff" strokeWidth="1.4" />
        <path d="M22 28.6L28 24.8L34 28.6V34H22V28.6Z" fill="#e9f1ff" />
        <path d="M28 13L40.5 20.6" stroke="#72a5ff" strokeWidth="1.8" />
        <path d="M28 13L15.5 20.6" stroke="#72a5ff" strokeWidth="1.8" />
        <defs>
          <linearGradient id="markGradient" x1="11" y1="11" x2="45" y2="45" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1d3d6b" />
            <stop offset="1" stopColor="#112744" />
          </linearGradient>
        </defs>
      </svg>
    </motion.span>
  );
}
