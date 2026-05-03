"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Sparkles, Sun } from "lucide-react"

import { SurfaceCard } from "@/components/shared/surface-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DashboardChild } from "@/lib/dal/parent-overview"

export function ParentTodayReportCard({
  records,
}: {
  records: DashboardChild[]
}) {
  const [activeId, setActiveId] = useState(records[0]?.id ?? "")
  const active = records.find((c) => c.id === activeId) ?? records[0] ?? null

  if (!active) {
    return (
      <SurfaceCard className="flex h-full flex-col gap-4 p-5">
        <CardHeader />
        <p className="text-sm text-muted-foreground">
          No children are linked to your account yet.
        </p>
      </SurfaceCard>
    )
  }

  const report = active.todayReport

  return (
    <SurfaceCard className="flex h-full flex-col gap-4 p-5">
      <CardHeader />
      {records.length > 1 ? (
        <Tabs value={active.id} onValueChange={setActiveId} className="-mx-1">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/40">
            {records.map((child) => (
              <TabsTrigger
                key={child.id}
                value={child.id}
                className="text-sm"
              >
                {child.firstName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}

      {report ? (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {active.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                {active.classroomName ?? "Classroom unassigned"}
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              <Sun className="mr-1 inline h-3 w-3" />
              {report.arrivalMood}
            </span>
          </div>

          <div className="rounded-2xl border border-border/55 bg-background/85 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {report.dateLabel}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground">
              {report.summary}
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-center">
            <ReportStat label="Meals" value={report.mealsCount} />
            <ReportStat label="Rest" value={report.restCount} />
            <ReportStat label="Activities" value={report.activitiesCount} />
          </dl>

          <Link
            href={`/parent/child/${active.slug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-auto justify-center"
            )}
          >
            View full report
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-start gap-3 rounded-2xl border border-dashed border-border/65 bg-muted/15 p-4">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm leading-6 text-muted-foreground">
            {active.firstName}&apos;s classroom hasn&apos;t posted today&apos;s
            report yet. Check back later this afternoon.
          </p>
          <Link
            href={`/parent/child/${active.slug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-auto justify-center"
            )}
          >
            Go to {active.firstName}&apos;s profile
          </Link>
        </div>
      )}
    </SurfaceCard>
  )
}

function CardHeader() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Today
      </p>
      <h2 className="mt-1 text-xl font-semibold text-foreground">
        Daily report
      </h2>
    </div>
  )
}

function ReportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/55 bg-background/85 px-2 py-3">
      <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  )
}
