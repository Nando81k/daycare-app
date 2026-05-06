import { PageShell } from "@/components/shared/page-shell"
import {
  BackLinkSkeleton,
  DetailSectionSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentEnrollmentDetailLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <BackLinkSkeleton />
      <PageHeaderSkeleton variant="parent" actionCount={2} metricCount={3} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailSectionSkeleton fields={4} />
        <DetailSectionSkeleton fields={4} />
      </div>
      <DetailSectionSkeleton fields={6} />
    </PageShell>
  )
}
