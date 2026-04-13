import { ParentEnrollmentDashboardPageView } from "@/components/parent/parent-enrollment-dashboard-page"
import type { SimpleParentPortalPreview } from "@/types/app"

export function ParentSimpleEnrollmentPageView({
  data,
}: {
  data: SimpleParentPortalPreview
}) {
  return <ParentEnrollmentDashboardPageView data={data} />
}
