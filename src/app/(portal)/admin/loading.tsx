import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for the admin overview. Mirrors admin-overview-page.tsx —
 * page header, "Today's triage" 4-card grid, attendance strip, and the
 * center overview block.
 */
export default function AdminLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      {/* Admin page header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Today's triage — 4 colored tiles */}
      <section aria-label="Today's triage" aria-busy>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <TriageCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Today's attendance strip */}
      <section
        aria-label="Today's attendance"
        className="rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Skeleton className="h-7 w-40 rounded-full" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-border/55 bg-muted/30 p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Center overview block */}
      <section className="rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Summary tile row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-border/55 bg-background/60 p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2 w-24" />
            </div>
          ))}
        </div>

        {/* Featured domain card */}
        <div className="mt-6 rounded-xl border border-border/55 bg-background/60 p-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="space-y-1.5 rounded-lg border border-border/55 bg-card p-4"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Two-column rows */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-border/55 bg-background/60 p-5"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}

function TriageCardSkeleton() {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-9 rounded-xl" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-9/12" />
      <div className="mt-auto rounded-xl border border-border/55 bg-muted/30 p-3">
        <Skeleton className="h-3 w-9/12" />
        <Skeleton className="mt-1.5 h-2 w-7/12" />
      </div>
    </article>
  )
}
