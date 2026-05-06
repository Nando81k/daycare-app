import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentAnnouncementsLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={0} />
      <CardGridSkeleton count={4} columnsClass="grid-cols-1" lines={3} />
    </PageShell>
  )
}
