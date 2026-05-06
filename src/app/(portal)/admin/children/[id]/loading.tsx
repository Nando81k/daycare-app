import { PageShell } from "@/components/shared/page-shell"
import {
  BackLinkSkeleton,
  DetailSectionSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminChildDetailLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <BackLinkSkeleton />
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <DetailSectionSkeleton fields={6} columnsClass="md:grid-cols-2 xl:grid-cols-3" />
      <DetailSectionSkeleton fields={4} />
      <DetailSectionSkeleton fields={4} />
    </PageShell>
  )
}
