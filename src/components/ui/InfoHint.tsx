import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoHintProps {
  label: string;
  title: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function InfoHint({ label, title, children, align = 'right', className }: InfoHintProps) {
  return (
    <details className={cn('group relative inline-block', className)}>
      <summary
        className="list-none rounded-full border border-white/75 bg-white/90 p-1.5 text-ink-500 shadow-sm transition hover:border-primary-300 hover:bg-white hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-label={label}
      >
        <Info className="h-4 w-4" />
      </summary>
      <div
        className={cn(
          'glass-strong absolute z-30 mt-2 w-[18rem] rounded-field p-3 text-xs shadow-float',
          align === 'right' ? 'right-0' : 'left-0',
        )}
      >
        <p className="font-semibold text-ink-900">{title}</p>
        <div className="mt-1.5 leading-relaxed text-ink-600">{children}</div>
      </div>
    </details>
  );
}
