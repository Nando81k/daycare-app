import { AdminCalendarPageView } from "@/components/admin/admin-calendar-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminCalendarPage() {
  const { calendarEvents, billingReminders, classrooms } =
    await getAdminPortalData()
  return (
    <AdminCalendarPageView
      events={calendarEvents}
      billingReminders={billingReminders}
      classrooms={classrooms}
    />
  )
}
