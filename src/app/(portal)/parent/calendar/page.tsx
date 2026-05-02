import { ParentCalendarPageView } from "@/components/parent/parent-calendar-page"
import { getParentPortalData } from "@/lib/dal/parent"

export default async function ParentCalendarPage() {
  const data = await getParentPortalData()
  return (
    <ParentCalendarPageView
      events={data.upcomingEvents}
      announcements={data.announcements}
    />
  )
}
