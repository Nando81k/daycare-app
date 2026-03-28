import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva('badge', {
  variants: {
    variant: {
      default: 'border-line/90 bg-white text-ink-700',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-200 bg-amber-50 text-amber-800',
      danger: 'border-rose-200 bg-rose-50 text-rose-700',
      info: 'border-primary-200 bg-primary-50 text-primary-800',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps extends VariantProps<typeof variants> {
  className?: string;
  children?: React.ReactNode;
  status?: string;
}

function statusToVariant(status: string | undefined): NonNullable<BadgeProps['variant']> {
  if (!status) return 'default';
  if (['APPROVED', 'PAID', 'SUCCEEDED', 'ACTIVE', 'READY'].includes(status)) return 'success';
  if (['WAITLISTED', 'REQUEST_INFO', 'OPEN', 'PENDING', 'PAUSED'].includes(status)) return 'warning';
  if (['DENIED', 'FAILED', 'PAST_DUE', 'VOID', 'INACTIVE'].includes(status)) return 'danger';
  return 'default';
}

export function Badge({ variant, className, children, status }: BadgeProps) {
  const resolvedVariant = variant || statusToVariant(status);
  const text = children || (status ? status.replace(/_/g, ' ') : '');
  return <span className={cn(variants({ variant: resolvedVariant }), className)}>{text}</span>;
}
