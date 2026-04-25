import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function EditorialFieldGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col gap-6", className)}>{children}</div>
}

export function EditorialField({
  children,
  className,
  invalid,
}: {
  children: ReactNode
  className?: string
  invalid?: boolean
}) {
  return (
    <div
      data-invalid={invalid ? true : undefined}
      className={cn("group flex flex-col gap-2", className)}
    >
      {children}
    </div>
  )
}

export function EditorialLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.22em] text-muted-foreground"
      >
        {children}
      </label>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

export function EditorialError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <p className="text-xs text-destructive">{children}</p>
}
