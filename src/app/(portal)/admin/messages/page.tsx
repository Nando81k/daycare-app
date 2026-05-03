import { AdminMessagesPageView } from "@/components/admin/admin-messages-page"
import { getAdminMessagesData } from "@/lib/dal/admin"

export default async function AdminMessagesPage() {
  const data = await getAdminMessagesData()
  return (
    <AdminMessagesPageView
      adminName={data.adminName}
      threads={data.threads}
      families={data.families}
    />
  )
}
