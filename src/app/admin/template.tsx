'use client';

import { PageTransition } from '@/components/animations';

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
