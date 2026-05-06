import { PageShell } from "@/components/shared/page-shell"
import {
  DataTableSkeleton,
  FilterTabsSkeleton,
  PageHeaderSkeleton,
  TwoColumnCardsSkeleton,
} from "@/components/shared/skeletons"

export default function AdminStaffLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <div className="space-y-3">
        <FilterTabsSkeleton tabs={4} />
        <DataTableSkeleton rows={8} columns={5} />
      </div>
      <TwoColumnCardsSkeleton itemsPerColumn={3} />
    </PageShell>
  )
}
