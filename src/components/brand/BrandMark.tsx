'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className, size = 34 }: BrandMarkProps) {
  return (
    <motion.span
      className={cn(
        'inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/90 p-1.5 shadow-soft',
        className,
      )}
      whileHover={{ y: -1.5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <path
          d="M28 7C18 7 10 15 10 25.2C10 35.2 17.2 43.5 27.1 44.8C27.4 44.9 27.7 45 28 45C28.3 45 28.6 44.9 28.9 44.8C38.8 43.5 46 35.2 46 25.2C46 15 38 7 28 7Z"
          fill="#0f3f86"
          fillOpacity="0.18"
          stroke="#0f3f86"
          strokeWidth="2.6"
        />

        <path
          d="M28 16C23.6 16 20 19.6 20 24C20 29.2 23.3 33.9 28 37C32.7 33.9 36 29.2 36 24C36 19.6 32.4 16 28 16Z"
          fill="#2378eb"
        />

        <path
          d="M28 18.6C25.8 18.6 24 20.4 24 22.6C24 25.2 25.7 27.5 28 29.2C30.3 27.5 32 25.2 32 22.6C32 20.4 30.2 18.6 28 18.6Z"
          fill="white"
          fillOpacity="0.9"
        />

        <path
          d="M28 9.5C30.8 9.5 33 11.7 33 14.4C31.6 14 30.4 13 29.8 11.7C29.2 13 28 14 26.6 14.4C26.9 11.7 29.2 9.5 32 9.5H28Z"
          fill="#18be98"
        />
      </svg>
    </motion.span>
  );
}
