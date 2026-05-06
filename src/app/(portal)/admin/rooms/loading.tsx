import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  TwoColumnCardsSkeleton,
} from "@/components/shared/skeletons"

export default function AdminRoomsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <CardGridSkeleton
        count={6}
        columnsClass="md:grid-cols-2 xl:grid-cols-3"
        lines={4}
      />
      <TwoColumnCardsSkeleton
        layoutClass="xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        itemsPerColumn={3}
      />
    </PageShell>
  )
}
