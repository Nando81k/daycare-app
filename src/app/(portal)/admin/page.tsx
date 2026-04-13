import { AdminSimpleEnrollmentPageView } from "@/components/admin/admin-simple-enrollment-page"
import { simpleAdminDashboardPageContent } from "@/data/minimal-portal"
import { getSimpleAdminEnrollmentData } from "@/lib/dal/minimal-portal"
import { createPageMetadata } from "@/lib/metadata"

const page = simpleAdminDashboardPageContent

export const metadata = createPageMetadata(page.metadata)

export default async function AdminOverviewPage() {
  const data = await getSimpleAdminEnrollmentData()

  return <AdminSimpleEnrollmentPageView enrollments={data} />
}
