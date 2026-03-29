import { BRAND } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { BrandMark } from './BrandMark';

interface Props {
  className?: string;
  compact?: boolean;
  showTagline?: boolean;
  tone?: 'default' | 'inverse';
}

export function BrandLockup({ className, compact, showTagline = true, tone = 'default' }: Props) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark size={compact ? 24 : 30} />
      <div>
        <p
          className={cn(
            'font-display font-semibold tracking-tight',
            tone === 'inverse' ? 'text-white' : 'text-ink-900',
            compact ? 'text-sm' : 'text-lg'
          )}
        >
          {BRAND.name}
        </p>
        {showTagline ? (
          <p
            className={cn(
              'text-[0.68rem] font-semibold uppercase tracking-[0.16em]',
              tone === 'inverse' ? 'text-[#bfd0ef]' : 'text-[#486180]',
            )}
          >
            {BRAND.tagline}
          </p>
        ) : null}
      </div>
    </div>
  );
}
