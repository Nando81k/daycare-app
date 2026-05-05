import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for the parent dashboard. Mirrors the live layout in
 * parent-dashboard-page.tsx — page header, three-card top row (Daily report,
 * Balance, Messages), two-card bottom row (Children, News).
 */
export default function ParentLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      {/* Page header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Top row: Daily report · Balance · Messages */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCardSkeleton lines={3} hasButton />
        <BalanceCardSkeleton />
        <MessagesCardSkeleton />
      </div>

      {/* Bottom row: Children · News */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChildrenRosterSkeleton />
        <NewsSkeleton />
      </div>
    </PageShell>
  )
}

function DashboardCardSkeleton({
  lines,
  hasButton,
}: {
  lines: number
  hasButton?: boolean
}) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex-1 space-y-2 rounded-xl border border-border/55 bg-muted/30 p-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      {hasButton ? <Skeleton className="h-8 w-32 rounded-md" /> : null}
    </article>
  )
}

function BalanceCardSkeleton() {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="rounded-xl border border-primary/15 bg-primary/6 p-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
      {/* Yellow Pay button placeholder */}
      <Skeleton className="h-9 w-full rounded-full bg-brand-yellow/40" />
      <Skeleton className="h-3 w-3/4" />
    </article>
  )
}

function MessagesCardSkeleton() {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="size-9 rounded-full" />
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {[0, 1].map((i) => (
          <li
            key={i}
            className="space-y-1.5 rounded-xl border border-border/55 bg-background/60 p-3"
          >
            <Skeleton className="h-3 w-9/12" />
            <Skeleton className="h-3 w-7/12" />
            <Skeleton className="h-2 w-5/12" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-8 w-full rounded-md" />
    </article>
  )
}

function ChildrenRosterSkeleton() {
  return (
    <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-28" />
      </div>
      <ul className="mt-4 space-y-2">
        {[0, 1].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/55 bg-background/60 px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-40" />
              </div>
            </div>
            <Skeleton className="h-3 w-3" />
          </li>
        ))}
      </ul>
    </article>
  )
}

function NewsSkeleton() {
  return (
    <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
      <ul className="mt-4 space-y-3">
        {[0, 1].map((i) => (
          <li
            key={i}
            className="space-y-2 rounded-xl border border-border/55 bg-background/60 p-3"
          >
            <Skeleton className="h-3 w-7/12" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-2 w-5/12" />
          </li>
        ))}
      </ul>
    </article>
  )
}
