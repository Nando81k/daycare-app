"use client"

import type * as React from "react"
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import { Controller } from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export type SelectOption = {
  label: string
  value: string
}

type BaseFieldProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  placeholder?: string
  disabled?: boolean
}

type TextFieldProps<TFieldValues extends FieldValues> = BaseFieldProps<TFieldValues> & {
  autoComplete?: string
  inputMode?: React.ComponentProps<typeof Input>["inputMode"]
  type?: React.ComponentProps<typeof Input>["type"]
}

type TextareaFieldProps<TFieldValues extends FieldValues> = BaseFieldProps<TFieldValues> & {
  rows?: number
}

type SelectFieldProps<TFieldValues extends FieldValues> = BaseFieldProps<TFieldValues> & {
  options: SelectOption[]
}

function getFieldError<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  name: FieldPath<TFieldValues>
) {
  const fieldState = form.getFieldState(name, form.formState)
  return fieldState.error?.message
}

export function MarketingFieldGroup({ children }: { children: React.ReactNode }) {
  return <FieldGroup>{children}</FieldGroup>
}

export function MarketingTextField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled,
  autoComplete,
  inputMode,
  type = "text",
}: TextFieldProps<TFieldValues>) {
  const error = getFieldError(form, name)

  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        {...form.register(name)}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function MarketingTextareaField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled,
  rows = 5,
}: TextareaFieldProps<TFieldValues>) {
  const error = getFieldError(form, name)

  return (
    <Field invalid={Boolean(error)} disabled={disabled}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        {...form.register(name)}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{error}</FieldError>
    </Field>
  )
}

export function MarketingSelectField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  placeholder,
  disabled,
  options,
}: SelectFieldProps<TFieldValues>) {
  const error = getFieldError(form, name)

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Field invalid={Boolean(error)} disabled={disabled}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            disabled={disabled}
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger id={name} aria-invalid={Boolean(error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldError>{error}</FieldError>
        </Field>
      )}
    />
  )
}
