import { AdminMessagesPageView } from "@/components/admin/admin-messages-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminMessagesPage() {
  const { messageThreads } = await getAdminPortalData()
  return <AdminMessagesPageView threads={messageThreads} />
}
