import { AdminWaitlistPageView } from "@/components/admin/admin-waitlist-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminWaitlistPage() {
  const { waitlistEntries } = await getAdminPortalData()
  return <AdminWaitlistPageView waitlistEntries={waitlistEntries} />
}
