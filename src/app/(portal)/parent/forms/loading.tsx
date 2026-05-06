import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParentFormsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={3} />
      <CardGridSkeleton count={3} columnsClass="md:grid-cols-3" lines={2} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]">
        <DataTableSkeleton rows={5} columns={4} />
        <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </article>
      </div>
    </PageShell>
  )
}
