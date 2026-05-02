import { ParentAnnouncementsPageView } from "@/components/parent/parent-announcements-page"
import { getParentPortalData } from "@/lib/dal/parent"

export default async function ParentAnnouncementsPage() {
  const data = await getParentPortalData()
  return <ParentAnnouncementsPageView announcements={data.announcements} />
}
