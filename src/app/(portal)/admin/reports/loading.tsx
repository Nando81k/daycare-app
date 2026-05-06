import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminReportsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <section className="space-y-4">
        <header className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </header>
        <CardGridSkeleton
          count={6}
          columnsClass="lg:grid-cols-2 xl:grid-cols-3"
          lines={4}
        />
      </section>
    </PageShell>
  )
}
