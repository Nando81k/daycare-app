import type { ComponentType, ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function DrawerBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6 pt-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DrawerSummary({
  title,
  subtitle,
  badges,
  meta,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  badges?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "border-border/60 shadow-none",
        className
      )}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-base font-semibold text-foreground">{title}</p>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {badges ? (
            <div className="flex flex-wrap items-center gap-1.5">{badges}</div>
          ) : null}
        </div>
        {meta ? (
          <>
            <Separator />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              {meta}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function DrawerSection({
  title,
  icon: Icon,
  description,
  trailing,
  children,
  className,
  contentClassName,
  padded = true,
}: {
  title: string
  icon?: ComponentType<{ className?: string }>
  description?: ReactNode
  trailing?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  padded?: boolean
}) {
  return (
    <Card className={cn("border-border/60 shadow-none", className)}>
      <CardContent
        className={cn(
          padded ? "p-4" : "p-0",
          "flex flex-col gap-3"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                <Icon className="size-3.5" />
              </span>
            ) : null}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{title}</p>
              {description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </div>
          </div>
          {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
        </div>
        <div className={cn("flex flex-col gap-3", contentClassName)}>
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function DrawerFieldGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode
  columns?: 1 | 2
  className?: string
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-3",
        columns === 2 ? "sm:grid-cols-2" : "",
        className
      )}
    >
      {children}
    </dl>
  )
}

export function DrawerField({
  label,
  value,
  span = 1,
  emphasis = false,
}: {
  label: string
  value: ReactNode
  span?: 1 | 2
  emphasis?: boolean
}) {
  if (value === null || value === undefined || value === "") {
    return null
  }
  return (
    <div className={cn("flex flex-col gap-1", span === 2 ? "sm:col-span-2" : "")}>
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm leading-6 break-words",
          emphasis
            ? "font-semibold text-foreground"
            : "text-foreground"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function DrawerActionBar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-popover/95 px-5 py-3 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DrawerEmpty({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
