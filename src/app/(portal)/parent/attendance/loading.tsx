import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentAttendanceLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={3} />
      <CardGridSkeleton count={3} columnsClass="md:grid-cols-3" lines={3} />
      <DataTableSkeleton rows={8} columns={4} />
    </PageShell>
  )
}
