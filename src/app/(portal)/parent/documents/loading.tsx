import { PageShell } from "@/components/shared/page-shell"
import {
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParentDocumentsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={3} />
      <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60 md:p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-1/2" />
        <Skeleton className="mt-2 h-3 w-3/4 max-w-full" />
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </article>
      <DataTableSkeleton rows={6} columns={4} />
    </PageShell>
  )
}
