import { PageShell } from "@/components/shared/page-shell"
import {
  CardGridSkeleton,
  DataTableSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminAttendanceLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <DataTableSkeleton rows={8} columns={5} />
      <CardGridSkeleton
        count={3}
        columnsClass="xl:grid-cols-3"
        lines={3}
      />
    </PageShell>
  )
}
