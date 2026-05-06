import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminClassroomsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <CardGridSkeleton
        count={6}
        columnsClass="md:grid-cols-2 xl:grid-cols-3"
        lines={4}
      />
    </PageShell>
  )
}
