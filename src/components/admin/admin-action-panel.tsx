"use client"

import React, { type ReactNode } from "react"
import { useFormStatus } from "react-dom"

import { AlertBanner } from "@/components/shared/alert-banner"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"
import type { AdminActionState } from "@/types/app"
import { cn } from "@/lib/utils"

type AdminActionPanelProps = {
  eyebrow?: string
  title: string
  description?: string
  state: AdminActionState
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AdminActionPanel({
  eyebrow,
  title,
  description,
  state,
  children,
  footer,
  className,
}: AdminActionPanelProps) {
  return (
    <SurfaceCard density="compact" className={cn("gap-4 px-5 py-5", className)}>
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="text-xl text-foreground">{title}</h2>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>

      {state.error ? (
        <AlertBanner tone="destructive" title="Update failed" description={state.error} />
      ) : null}
      {state.success && state.message ? (
        <AlertBanner tone="success" title="Saved" description={state.message} />
      ) : null}

      {children}

      {footer ? <div className="border-t border-border/60 pt-4">{footer}</div> : null}
    </SurfaceCard>
  )
}

type AdminSubmitButtonProps = React.ComponentProps<typeof Button> & {
  idleLabel: string
  pendingLabel: string
}

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  disabled,
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}
