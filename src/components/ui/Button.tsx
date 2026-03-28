import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  'inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-button border text-sm font-semibold leading-none tracking-[0.01em] transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-180 ease-fluid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'border-primary-700 bg-primary-700 text-white shadow-sm hover:-translate-y-0.5 hover:border-primary-800 hover:bg-primary-800 hover:shadow-soft active:translate-y-0',
        secondary:
          'border-teal-600 bg-teal-500 text-white shadow-sm hover:-translate-y-0.5 hover:border-teal-700 hover:bg-teal-600 hover:shadow-soft active:translate-y-0',
        outline:
          'border-primary-200 bg-white text-ink-800 shadow-sm hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-900 hover:shadow-soft active:translate-y-0',
        ghost:
          'border-transparent bg-white text-ink-700 hover:-translate-y-0.5 hover:bg-primary-50 hover:text-ink-900 hover:shadow-soft active:translate-y-0',
        danger:
          'border-danger bg-danger text-white shadow-sm hover:-translate-y-0.5 hover:border-rose-700 hover:bg-rose-700 hover:shadow-soft active:translate-y-0',
        link:
          'h-auto border-transparent bg-transparent px-0 py-0 text-primary-700 shadow-none underline-offset-4 hover:text-primary-900 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface ButtonStyleProps extends VariantProps<typeof variants> {
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function buttonStyles(props: ButtonStyleProps = {}) {
  const { className, ...variantProps } = props;
  return cn(variants(variantProps), className);
}

export function Button({
  asChild,
  variant,
  size,
  fullWidth,
  className,
  children,
  isLoading,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot className={cn(variants({ variant, size, fullWidth }), className)} aria-busy={isLoading} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      type={type}
      className={cn(variants({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        leftIcon
      )}
      <span className="whitespace-nowrap">{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading ? rightIcon : null}
    </button>
  );
}
