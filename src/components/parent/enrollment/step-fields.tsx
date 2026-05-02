"use client"

import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const fieldClasses =
  "rounded-xl border-slate-200 bg-white/95 shadow-sm focus-visible:ring-sky-400"

export function Field({
  label,
  htmlFor,
  optional,
  children,
  className,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-slate-400">
            (optional)
          </span>
        )}
      </Label>
      {children}
    </div>
  )
}

export function FieldsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

export function StepIntro({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  if (!title && !description) return null
  return (
    <div className="mb-1 space-y-1">
      {title && (
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      )}
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
  )
}
