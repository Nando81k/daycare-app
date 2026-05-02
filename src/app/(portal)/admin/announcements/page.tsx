import { AdminAnnouncementsPageView } from "@/components/admin/admin-announcements-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminAnnouncementsPage() {
  const { announcements } = await getAdminPortalData()
  return <AdminAnnouncementsPageView announcements={announcements} />
}
