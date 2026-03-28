import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  variant?: 'glass' | 'soft' | 'strong' | 'solid';
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  glass: 'glass-shell rounded-[18px] border-primary-100 shadow-[0_20px_42px_-30px_rgba(8,42,88,0.35)]',
  soft: 'glass-soft rounded-[17px] border-primary-100',
  strong: 'glass-strong rounded-[18px] border-primary-200',
  solid: 'rounded-panel border border-primary-100 bg-white shadow-[0_16px_34px_-28px_rgba(8,42,88,0.32)]',
};

export function Card({
  title,
  subtitle,
  actions,
  footer,
  variant = 'glass',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section className={cn(variantClasses[variant], 'p-4 md:p-5', className)} {...props}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3 border-b border-line/70 pb-3">
          <div>
            {title ? <h3 className="text-[1.08rem] font-semibold text-ink-900 md:text-[1.12rem]">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm leading-relaxed text-ink-500">{subtitle}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
      {footer ? <footer className="mt-4 border-t border-line/80 pt-3">{footer}</footer> : null}
    </section>
  );
}
