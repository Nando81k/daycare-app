import { AdminOverviewPageView } from "@/components/admin/admin-overview-page"
import { adminOverviewPageContent } from "@/data/admin"
import { getAdminPortalData } from "@/lib/dal/admin"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata(adminOverviewPageContent.metadata)

export default async function AdminOverviewPage() {
  const data = await getAdminPortalData()

  return (
    <AdminOverviewPageView
      dashboard={data.dashboard}
      attendanceBoard={data.attendanceBoard}
      balances={data.balances}
      documents={data.documents}
      familyHub={data.familyHub}
      messageThreads={data.messageThreads}
      classrooms={data.classrooms}
      waitlistEntries={data.waitlistEntries}
      staffProfiles={data.staffProfiles}
      enrollmentLeads={data.enrollmentLeads}
    />
  )
}
