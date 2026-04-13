"use client"

import type * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldContainerProps = React.ComponentProps<"div"> & {
  invalid?: boolean
  disabled?: boolean
}

type FieldSetProps = React.ComponentProps<"fieldset"> & {
  invalid?: boolean
  disabled?: boolean
}

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-5", className)} {...props} />
}

export function Field({ className, invalid, disabled, ...props }: FieldContainerProps) {
  return (
    <div
      data-slot="field"
      data-invalid={invalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={cn("group flex flex-col gap-2", className)}
      {...props}
    />
  )
}

export function FieldSet({ className, invalid, disabled, ...props }: FieldSetProps) {
  return (
    <fieldset
      data-slot="field-set"
      data-invalid={invalid ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={cn("group flex flex-col gap-4", className)}
      {...props}
    />
  )
}

export function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend className={cn("text-sm font-medium leading-none text-foreground", className)} {...props} />
  )
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn("text-sm font-medium", className)} {...props} />
}

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-xs leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) {
    return null
  }

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("text-xs font-medium leading-5 text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
}
