'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LegacyRedirectNotice } from '@/components/common/LegacyRedirectNotice';
import { buttonStyles } from '@/components/ui';

interface Props {
  title: string;
  description: string;
  target: string;
}

export function LegacyRouteRedirect({ title, description, target }: Props) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(target);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [router, target]);

  return (
    <div className="glass-shell mx-auto mt-6 max-w-xl space-y-3 rounded-[18px] border-white/80 p-6 shadow-[0_26px_54px_-34px_rgba(9,42,88,0.45)]">
      <LegacyRedirectNotice title={title} description={description} />
      <Link href={target} className={buttonStyles({ variant: 'primary', className: 'w-full' })}>
        Continue
      </Link>
    </div>
  );
}
