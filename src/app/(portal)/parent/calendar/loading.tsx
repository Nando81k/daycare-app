import { PageShell } from "@/components/shared/page-shell"
import {
  CalendarSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentCalendarLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={3} />
      <CalendarSkeleton />
    </PageShell>
  )
}
