import { ParentMessagesPageView } from "@/components/parent/parent-messages-page"
import { getParentPortalData } from "@/lib/dal/parent"

export default async function ParentMessagesPage() {
  const data = await getParentPortalData()
  return (
    <ParentMessagesPageView
      childId={data.childProfile.id}
      initialThreads={data.threads}
      announcements={data.announcements}
    />
  )
}
