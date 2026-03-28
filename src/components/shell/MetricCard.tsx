import { cn } from '@/lib/utils';
import { isUiRevampEnabled } from '@/lib/ui-revamp';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
}

const legacyToneMap: Record<NonNullable<MetricCardProps['tone']>, string> = {
  neutral: 'border-primary-100 bg-white',
  primary: 'border-primary-200 bg-primary-50',
  success: 'border-teal-200 bg-emerald-50',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-rose-200 bg-rose-50',
};

const revampToneMap: Record<NonNullable<MetricCardProps['tone']>, string> = {
  neutral: 'border-sky-100/85 bg-white shadow-[0_18px_34px_-24px_rgba(8,44,94,0.35)]',
  primary: 'border-sky-200/90 bg-sky-50 shadow-[0_20px_36px_-24px_rgba(20,80,170,0.38)]',
  success: 'border-emerald-200/90 bg-emerald-50 shadow-[0_20px_36px_-24px_rgba(8,122,89,0.32)]',
  warning: 'border-amber-200/90 bg-amber-50 shadow-[0_20px_36px_-24px_rgba(15,112,164,0.3)]',
  danger: 'border-rose-200/90 bg-rose-50 shadow-[0_20px_36px_-24px_rgba(50,88,134,0.3)]',
};

export function MetricCard({ label, value, hint, tone = 'neutral' }: MetricCardProps) {
  const revampEnabled = isUiRevampEnabled('foundation');
  const toneMap = revampEnabled ? revampToneMap : legacyToneMap;

  return (
    <article
      className={cn(
        'metric-card border',
        revampEnabled &&
          'overflow-hidden rounded-[16px] border-white/80 transition-[transform,box-shadow,border-color,background-color] duration-240 ease-fluid hover:-translate-y-1',
        toneMap[tone],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-500', revampEnabled && 'tracking-[0.12em]')}>
          {label}
        </p>
        <span
          className={cn('h-2 w-2 rounded-full', {
            'bg-primary-600': tone === 'neutral' || tone === 'primary',
            'bg-emerald-600': tone === 'success',
            'bg-teal-600': tone === 'warning',
            'bg-rose-600': tone === 'danger',
          })}
        />
      </div>
      <p className="mt-1.5 text-[1.42rem] font-semibold leading-none text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-600">{hint}</p> : null}
    </article>
  );
}
