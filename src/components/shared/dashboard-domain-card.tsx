import Link from "next/link"
import type { ReactNode } from "react"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardDomainSummary } from "@/types/app"
import { cn } from "@/lib/utils"

export function DashboardDomainCard({
  summary,
  tone,
  featured = false,
  children,
  className,
}: {
  summary: DashboardDomainSummary
  tone: "parent" | "admin"
  featured?: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border/65",
        featured && tone === "parent" && "bg-[linear-gradient(180deg,rgba(250,246,238,0.96),rgba(255,255,255,0.98))]",
        featured && tone === "admin" && "bg-[linear-gradient(180deg,rgba(241,247,246,0.96),rgba(255,255,255,0.98))]",
        className
      )}
    >
      <CardHeader className={cn("gap-4", featured ? "p-6" : "p-5")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="editorial-kicker">{summary.label}</p>
            <div className="space-y-1.5">
              <CardTitle className={cn(featured ? "text-[1.55rem] leading-tight" : "text-xl")}>
                {summary.title}
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {summary.description}
              </CardDescription>
            </div>
          </div>
          {summary.statusLabel ? (
            <StatusBadge variant={summary.statusTone ?? "secondary"}>{summary.statusLabel}</StatusBadge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={cn("flex flex-col gap-5 pt-0", featured ? "px-6 pb-6" : "px-5 pb-5")}>
        <div
          className={cn(
            "grid gap-3",
            featured ? "sm:grid-cols-3" : "sm:grid-cols-2"
          )}
        >
          {summary.stats.map((stat) => (
            <div
              key={`${summary.key}-${stat.label}`}
              className="rounded-[1rem] border border-border/60 bg-muted/18 px-4 py-3"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {children ? <div className="grid gap-3">{children}</div> : null}

        <div className="flex flex-col gap-4 border-t border-border/60 pt-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ownership
              </p>
              <p className="text-sm text-foreground">{summary.ownerLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Latest change
              </p>
              <p className="text-sm text-foreground">{summary.recentLabel}</p>
            </div>
          </div>

          <div>
            <Link
              href={summary.actionHref}
              className={buttonVariants({ variant: featured ? "default" : "outline", size: "sm" })}
            >
              {summary.actionLabel}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardInfoRow({
  label,
  value,
  supporting,
  action,
}: {
  label: string
  value: string
  supporting?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[1rem] border border-border/60 bg-background/82 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        {supporting ? <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{supporting}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function DashboardActionButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link href={href}>
      <Button variant="ghost" size="sm">
        {label}
      </Button>
    </Link>
  )
}
