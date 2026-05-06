import { PageShell } from "@/components/shared/page-shell"
import {
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminFamiliesLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <DataTableSkeleton rows={10} columns={6} />
    </PageShell>
  )
}
