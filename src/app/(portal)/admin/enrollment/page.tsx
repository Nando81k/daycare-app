import { AdminEnrollmentPageView } from "@/components/admin/admin-enrollment-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminEnrollmentPage() {
  const { enrollmentLeads, waitlistEntries } = await getAdminPortalData()

  return (
    <AdminEnrollmentPageView
      enrollmentLeads={enrollmentLeads}
      waitlistEntries={waitlistEntries}
    />
  )
}
