"use client"

import type * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Option = {
  label: string
  value: string
}

type BaseFieldProps = {
  name: string
  label: string
  defaultValue?: string
  placeholder?: string
  description?: string
  error?: string
  disabled?: boolean
}

export function ParentFieldGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <FieldGroup className={className}>{children}</FieldGroup>
}

export function ParentTextField({
  name,
  label,
  defaultValue,
  placeholder,
  description,
  error,
  disabled,
  type = "text",
  inputMode,
}: BaseFieldProps & {
  type?: React.ComponentProps<typeof Input>["type"]
  inputMode?: React.ComponentProps<typeof Input>["inputMode"]
}) {
  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function ParentTextareaField({
  name,
  label,
  defaultValue,
  placeholder,
  description,
  error,
  disabled,
  rows = 5,
}: BaseFieldProps & {
  rows?: number
}) {
  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        disabled={disabled}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function ParentSelectField({
  name,
  label,
  defaultValue,
  description,
  error,
  disabled,
  options,
}: BaseFieldProps & {
  options: Option[]
}) {
  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error)}
          disabled={disabled}
          className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background/90 px-4 pr-10 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
