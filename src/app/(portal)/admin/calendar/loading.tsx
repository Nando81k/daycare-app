import { PageShell } from "@/components/shared/page-shell"
import {
  CalendarSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminCalendarLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={4} />
      <CalendarSkeleton />
    </PageShell>
  )
}
