'use client';

import { PageTransition } from '@/components/animations';

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
