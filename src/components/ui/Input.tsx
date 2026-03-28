import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface FieldBase {
  label?: ReactNode;
  helpText?: ReactNode;
  error?: string;
  containerClassName?: string;
}

const baseField =
  'w-full rounded-field border border-primary-100/85 bg-white/96 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 shadow-sm transition-all duration-180 ease-fluid focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-100/85 disabled:cursor-not-allowed disabled:bg-ink-100';

function labelId(id: string) {
  return `${id}-desc`;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldBase {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helpText, error, containerClassName, startAdornment, endAdornment, id, required, ...props },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const fieldId = id || `input-${uid}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {startAdornment ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-400">
            {startAdornment}
          </span>
        ) : null}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={helpText || error ? labelId(fieldId) : undefined}
          className={cn(
            baseField,
            startAdornment && 'pl-10',
            endAdornment && 'pr-10',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100',
          )}
          {...props}
        />
        {endAdornment ? (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-400">
            {endAdornment}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
      {!error && helpText ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-ink-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldBase {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helpText, error, containerClassName, id, required, rows = 4, ...props },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const fieldId = id || `textarea-${uid}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={helpText || error ? labelId(fieldId) : undefined}
        className={cn(baseField, 'resize-y', error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100')}
        {...props}
      />
      {error ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
      {!error && helpText ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-ink-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldBase {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helpText, error, containerClassName, id, required, children, ...props },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const fieldId = id || `select-${uid}`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink-800">
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={helpText || error ? labelId(fieldId) : undefined}
        className={cn(baseField, 'pr-8', error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-100')}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      ) : null}
      {!error && helpText ? (
        <p id={labelId(fieldId)} className="mt-1 text-sm text-ink-500">
          {helpText}
        </p>
      ) : null}
    </div>
  );
});
