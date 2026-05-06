import { PageShell } from "@/components/shared/page-shell"
import {
  BackLinkSkeleton,
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminAttendanceHistoryLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <BackLinkSkeleton />
      <PageHeaderSkeleton variant="admin" actionCount={1} metricCount={4} />
      <DataTableSkeleton rows={12} columns={5} />
    </PageShell>
  )
}
