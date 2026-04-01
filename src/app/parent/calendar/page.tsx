import { parentEvents } from "@/data/parent"
import { EventsCalendar } from "@/components/shared/events-calendar"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"

export default function ParentCalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Calendar"
        title="Upcoming classroom and family events."
        description="Event scheduling stays tied to the same portal where messages, forms, and billing already live."
      />
      <EventsCalendar
        events={parentEvents}
        title="Family calendar"
        description="Highlighted dates mark classroom events, conferences, and family gatherings."
      />
    </div>
  )
}
