import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"

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
  featured = false,
  children,
  className,
}: {
  summary: DashboardDomainSummary
  tone?: "parent" | "admin"
  featured?: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-sm border border-border/60 bg-card shadow-none",
        className
      )}
    >
      <CardHeader className={cn("gap-4", featured ? "p-7" : "p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            <p className="editorial-kicker">{summary.label}</p>
            <div className="space-y-2">
              <CardTitle
                className={cn(
                  "font-heading tracking-[-0.01em]",
                  featured ? "text-2xl leading-tight md:text-3xl" : "text-xl leading-tight md:text-2xl"
                )}
              >
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

      <CardContent className={cn("flex flex-col gap-6 pt-0", featured ? "px-7 pb-7" : "px-6 pb-6")}>
        <div className={cn("grid gap-px bg-border/60", featured ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {summary.stats.map((stat) => (
            <div
              key={`${summary.key}-${stat.label}`}
              className="flex flex-col gap-2 bg-card px-5 py-4"
            >
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="font-heading text-2xl leading-tight text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {children ? <div className="flex flex-col gap-3">{children}</div> : null}

        <div className="flex flex-col gap-5 border-t border-border/60 pt-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Ownership
              </p>
              <p className="text-sm text-foreground">{summary.ownerLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Latest change
              </p>
              <p className="text-sm text-foreground">{summary.recentLabel}</p>
            </div>
          </div>

          <Link
            href={summary.actionHref}
            className={cn(
              buttonVariants({ variant: featured ? "default" : "outline", size: "sm" }),
              "rounded-none"
            )}
          >
            {summary.actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
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
    <div className="flex items-start justify-between gap-3 border border-border/60 bg-background px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
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
      <Button variant="ghost" size="sm" className="rounded-none">
        {label}
      </Button>
    </Link>
  )
}
