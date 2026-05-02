import { AdminReportsPageView } from "@/components/admin/admin-reports-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminReportsPage() {
  const { metrics, reportBars } = await getAdminPortalData()
  return <AdminReportsPageView metrics={metrics} reportBars={reportBars} />
}
