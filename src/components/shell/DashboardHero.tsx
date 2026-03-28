import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { isUiRevampEnabled } from '@/lib/ui-revamp';

interface DashboardHeroStat {
  label: string;
  value: string | number;
}

interface DashboardHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: DashboardHeroStat[];
  tone?: 'admin' | 'parent';
  className?: string;
}

export function DashboardHero({
  eyebrow = 'Dashboard Workspace',
  title,
  description,
  actions,
  stats = [],
  tone = 'admin',
  className,
}: DashboardHeroProps) {
  const revampEnabled = isUiRevampEnabled('foundation');

  return (
    <section
      className={cn(
        'dashboard-hero',
        tone === 'admin' ? 'dashboard-hero-admin' : 'dashboard-hero-parent',
        revampEnabled &&
          'relative overflow-hidden rounded-[16px] border border-primary-100 bg-white shadow-[0_20px_42px_-30px_rgba(8,42,88,0.38)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-5">
        <div className="min-w-0">
          <p className={cn('dashboard-hero-eyebrow', revampEnabled && 'relative z-[1] text-primary-700')}>{eyebrow}</p>
          <h2 className={cn('dashboard-hero-title', revampEnabled && 'relative z-[1] text-[1.2rem] sm:text-[1.35rem]')}>{title}</h2>
          {description ? <p className="dashboard-hero-description">{description}</p> : null}
        </div>
        {actions ? <div className={cn('dashboard-hero-actions', revampEnabled && 'relative z-[1]')}>{actions}</div> : null}
      </div>

      {stats.length ? (
        <div className={cn('dashboard-hero-stats', revampEnabled && 'relative z-[1] mt-3')}>
          {stats.map((stat) => (
            <article
              key={stat.label}
              className={cn(
                'dashboard-hero-stat',
                revampEnabled &&
                  'rounded-[14px] border border-primary-100/90 bg-white/95 shadow-[0_16px_30px_-24px_rgba(8,42,88,0.4)]',
              )}
            >
              <p className="dashboard-hero-stat-label">{stat.label}</p>
              <p className="dashboard-hero-stat-value">{stat.value}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
