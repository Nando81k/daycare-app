import { AdminReportsPageView } from "@/components/admin/admin-reports-page"
import { getAdminReportsData } from "@/lib/dal/admin-billing"

export default async function AdminReportsPage() {
  const reports = await getAdminReportsData()
  return <AdminReportsPageView reports={reports} />
}
