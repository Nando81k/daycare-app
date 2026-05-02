import { AdminCommunicationsPageView } from "@/components/admin/admin-communications-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminCommunicationsPage() {
  const { messageThreads, announcements } = await getAdminPortalData()
  return (
    <AdminCommunicationsPageView
      messageThreads={messageThreads}
      announcements={announcements}
    />
  )
}
