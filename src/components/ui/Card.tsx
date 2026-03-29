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
  glass: 'glass-shell rounded-[20px] shadow-[0_26px_52px_-40px_rgba(28,36,50,0.34)]',
  soft: 'glass-soft rounded-[20px]',
  strong: 'glass-strong rounded-[20px]',
  solid: 'rounded-[20px] border bg-white shadow-[0_18px_40px_-30px_rgba(28,36,50,0.3)]',
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
    <section className={cn(variantClasses[variant], 'p-4 md:p-6', className)} {...props}>
      {(title || subtitle || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3 border-b border-line/70 pb-3.5">
          <div>
            {title ? <h3 className="text-[1.16rem] font-semibold text-ink-900 md:text-[1.24rem]">{title}</h3> : null}
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
