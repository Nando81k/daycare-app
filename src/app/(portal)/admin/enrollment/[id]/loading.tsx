import { PageShell } from "@/components/shared/page-shell"
import {
  BackLinkSkeleton,
  DetailSectionSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEnrollmentDetailLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <BackLinkSkeleton />
      <PageHeaderSkeleton variant="admin" actionCount={3} metricCount={4} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <DetailSectionSkeleton fields={6} />
          <DetailSectionSkeleton fields={4} />
          <DetailSectionSkeleton fields={4} />
        </div>
        <aside className="space-y-4">
          <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-32" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </article>
          <article className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-32" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
              ))}
            </div>
          </article>
        </aside>
      </div>
    </PageShell>
  )
}
