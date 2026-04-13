"use client"

import React, { type ReactNode } from "react"
import { useFormStatus } from "react-dom"

import { AlertBanner } from "@/components/shared/alert-banner"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ParentActionState } from "@/types/app"
import { cn } from "@/lib/utils"

type ParentActionPanelProps = {
  eyebrow?: string
  title: string
  description?: string
  state: ParentActionState
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function ParentActionPanel({
  eyebrow,
  title,
  description,
  state,
  children,
  footer,
  className,
}: ParentActionPanelProps) {
  return (
    <Card className={cn("gap-4 px-5 py-5", className)}>
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
    </Card>
  )
}

type ParentSubmitButtonProps = React.ComponentProps<typeof Button> & {
  idleLabel: string
  pendingLabel: string
}

export function ParentSubmitButton({
  idleLabel,
  pendingLabel,
  disabled,
  ...props
}: ParentSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending || disabled} {...props}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  )
}
