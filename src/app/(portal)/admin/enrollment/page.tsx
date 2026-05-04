import { AdminEnrollmentPageView } from "@/components/admin/admin-enrollment-page"
import { getAdminPortalData } from "@/lib/dal/admin"

type EnrollmentTab = "leads" | "waitlist"

export default async function AdminEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: EnrollmentTab = tab === "waitlist" ? "waitlist" : "leads"
  const { enrollmentLeads, waitlistEntries } = await getAdminPortalData()

  return (
    <AdminEnrollmentPageView
      enrollmentLeads={enrollmentLeads}
      waitlistEntries={waitlistEntries}
      initialTab={initialTab}
    />
  )
}
