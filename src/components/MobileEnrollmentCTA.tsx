import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonStyles } from '@/components/ui';

export function MobileEnrollmentCTA() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4 md:hidden">
      <Link
        href="/register"
        className={buttonStyles({
          variant: 'primary',
          fullWidth: true,
          size: 'lg',
          className: 'public-mobile-cta pointer-events-auto rounded-full border border-white/28 text-white shadow-float',
        })}
      >
        Start Enrollment
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
