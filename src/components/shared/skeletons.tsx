import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const SURFACE_CARD = "rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6"
const INNER_PANEL = "rounded-xl border border-border/55 bg-background/60 p-4"

export function PageHeaderSkeleton({
  variant = "admin",
  actionCount = 2,
  metricCount = 0,
  className,
}: {
  variant?: "admin" | "parent"
  actionCount?: number
  metricCount?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton
            className={cn(
              variant === "admin" ? "h-9 w-80" : "h-8 w-72",
              "max-w-full",
            )}
          />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        {actionCount > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: actionCount }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-32 rounded-md" />
            ))}
          </div>
        ) : null}
      </div>
      {metricCount > 0 ? (
        <div
          className={cn(
            "grid gap-2.5 border-t border-border/55 pt-4",
            variant === "admin"
              ? "sm:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-3",
          )}
        >
          {Array.from({ length: metricCount }).map((_, i) => (
            <MetricChipSkeleton key={i} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function MetricChipSkeleton() {
  return (
    <div className="metric-chip">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-5 w-16" />
      <Skeleton className="mt-1.5 h-2 w-20" />
    </div>
  )
}

export function DataTableSkeleton({
  rows = 6,
  columns = 5,
  withToolbar = true,
}: {
  rows?: number
  columns?: number
  withToolbar?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-[1.55rem] border border-border/45 bg-card/92">
      <div className="space-y-2 border-b border-border/45 p-4 md:p-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-3 w-72 max-w-full" />
      </div>
      {withToolbar ? (
        <div className="border-b border-border/45 px-4 py-3 md:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-9 w-full max-w-sm rounded-md" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : null}
      <div className="px-4 py-3 md:px-5">
        <div className="hidden gap-3 pb-3 md:flex">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-3",
                i === 0 ? "w-32" : i === columns - 1 ? "ml-auto w-16" : "w-24",
              )}
            />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="flex flex-col gap-2 rounded-xl border border-border/45 bg-background/55 px-3 py-3 md:flex-row md:items-center md:gap-4"
            >
              {Array.from({ length: columns }).map((_, c) => (
                <Skeleton
                  key={c}
                  className={cn(
                    "h-4",
                    c === 0
                      ? "w-44"
                      : c === columns - 1
                        ? "md:ml-auto w-16"
                        : "w-32",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FilterTabsSkeleton({
  tabs = 4,
  withTrailingAction = true,
}: {
  tabs?: number
  withTrailingAction?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex h-10 items-center gap-1 rounded-md border border-border/55 bg-muted/30 p-1">
        {Array.from({ length: tabs }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-md" />
        ))}
      </div>
      {withTrailingAction ? (
        <Skeleton className="h-9 w-28 rounded-md" />
      ) : null}
    </div>
  )
}

export function CardGridSkeleton({
  count = 6,
  columnsClass = "md:grid-cols-2 xl:grid-cols-3",
  lines = 3,
}: {
  count?: number
  columnsClass?: string
  lines?: number
}) {
  return (
    <div className={cn("grid gap-4", columnsClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className={SURFACE_CARD}>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-2/3" />
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: lines }).map((_, l) => (
              <Skeleton
                key={l}
                className={cn("h-3", l === lines - 1 ? "w-2/3" : "w-full")}
              />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function TwoColumnCardsSkeleton({
  layoutClass = "xl:grid-cols-2",
  itemsPerColumn = 3,
}: {
  layoutClass?: string
  itemsPerColumn?: number
}) {
  return (
    <div className={cn("grid gap-4", layoutClass)}>
      {[0, 1].map((col) => (
        <article key={col} className={SURFACE_CARD}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: itemsPerColumn }).map((_, i) => (
              <div key={i} className={cn(INNER_PANEL, "space-y-2")}>
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function FormSectionsSkeleton({
  sections = 2,
  fieldsPerSection = 4,
  layoutClass = "xl:grid-cols-2",
}: {
  sections?: number
  fieldsPerSection?: number
  layoutClass?: string
}) {
  return (
    <div className={cn("grid gap-6", layoutClass)}>
      {Array.from({ length: sections }).map((_, s) => (
        <article key={s} className={SURFACE_CARD}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <Skeleton className="mt-2 h-3 w-3/4 max-w-full" />
          <div className="mt-5 grid gap-4">
            {Array.from({ length: fieldsPerSection }).map((_, f) => (
              <div key={f} className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-5 h-9 w-32 rounded-md" />
        </article>
      ))}
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className={SURFACE_CARD}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-6 w-32" />
        <Skeleton className="mt-4 h-9 w-full rounded-md" />
        <ul className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="space-y-1.5 rounded-xl border border-border/45 bg-background/55 px-3 py-2.5"
            >
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-1/3" />
            </li>
          ))}
        </ul>
      </aside>
      <article className={SURFACE_CARD}>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="size-9 rounded-full" />
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                INNER_PANEL,
                "space-y-2",
                i % 2 === 1 && "ml-auto max-w-[80%] bg-secondary/40",
              )}
            >
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Skeleton className="h-24 w-full rounded-md" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </article>
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_18.5rem]">
      <article className={SURFACE_CARD}>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-3 w-full" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={`d-${i}`} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </article>
      <article className={SURFACE_CARD}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-32" />
        <ul className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="space-y-1.5 rounded-xl border border-border/45 bg-background/55 px-3 py-3"
            >
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-1/3" />
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

export function DetailSectionSkeleton({
  fields = 4,
  columnsClass = "md:grid-cols-2",
}: {
  fields?: number
  columnsClass?: string
}) {
  return (
    <article className={SURFACE_CARD}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-6 w-1/2" />
      <div className={cn("mt-5 grid gap-3", columnsClass)}>
        {Array.from({ length: fields }).map((_, j) => (
          <div key={j} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </article>
  )
}

export function BackLinkSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}
