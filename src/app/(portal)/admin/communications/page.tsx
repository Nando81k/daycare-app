import { AdminCommunicationsPageView } from "@/components/admin/admin-communications-page"
import { getAdminPortalData } from "@/lib/dal/admin"

type CommunicationsTab = "inbox" | "broadcasts"

export default async function AdminCommunicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: CommunicationsTab = tab === "broadcasts" ? "broadcasts" : "inbox"
  const { messageThreads, announcements } = await getAdminPortalData()
  return (
    <AdminCommunicationsPageView
      messageThreads={messageThreads}
      announcements={announcements}
      initialTab={initialTab}
    />
  )
}
