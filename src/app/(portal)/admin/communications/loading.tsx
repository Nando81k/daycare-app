import { PageShell } from "@/components/shared/page-shell"
import {
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCommunicationsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <DataTableSkeleton rows={6} columns={5} />
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <DataTableSkeleton rows={5} columns={4} />
        <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </article>
      </div>
    </PageShell>
  )
}
