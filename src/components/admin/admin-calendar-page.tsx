"use client"

import Link from "next/link"
import { CalendarDaysIcon } from "lucide-react"
import { useState } from "react"

import { AdminCalendarEventEditor } from "@/components/admin/admin-calendar-event-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import {
  formatAdminLabel,
  getBillingReminderVariant,
  getCalendarEventVariant,
} from "@/components/admin/admin-status"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminBillingReminders,
  adminCalendarEvents,
  adminCalendarPageContent,
  adminClassrooms,
} from "@/data/admin"
import type {
  AdminBillingReminderPreview,
  AdminCalendarEventPreview,
  AdminTableColumn,
  AdminTableRow,
  ClassroomSummaryPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "event", header: "Event" },
  { key: "target", header: "Target" },
  { key: "date", header: "Date" },
  { key: "category", header: "Category" },
  { key: "actions", header: "Actions", align: "end" },
]

function getRows(
  events: AdminCalendarEventPreview[],
  selectedEventId: string | null,
  onSelectEvent: (eventId: string | null) => void
): AdminTableRow[] {
  return events.map((event) => ({
    event: {
      primary: event.title,
      secondary:
        event.description.length > 88 ? `${event.description.slice(0, 85).trimEnd()}...` : event.description,
    },
    target: {
      primary: event.targetLabel,
      secondary: event.targetScope === "classroom" ? "Classroom-targeted" : undefined,
    },
    date: {
      primary: event.dateLabel,
      secondary: event.timeLabel,
    },
    category: {
      label: formatAdminLabel(event.category),
      variant: getCalendarEventVariant(event.category),
    },
    actions: {
      type: "custom",
      searchValue: selectedEventId === event.id ? "Editing" : `Edit ${event.title}`,
      content: (
        <button
          type="button"
          onClick={() => onSelectEvent(event.id)}
          className={buttonVariants({
            variant: selectedEventId === event.id ? "secondary" : "outline",
            size: "sm",
          })}
        >
          {selectedEventId === event.id ? "Editing" : "Edit"}
        </button>
      ),
    },
  }))
}

function BillingReminderPanel({
  reminders,
}: {
  reminders: AdminBillingReminderPreview[]
}) {
  const dueCount = reminders.filter((reminder) => reminder.status === "due").length
  const overdueCount = reminders.length - dueCount

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_18.5rem]">
      <Card className="gap-4 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Billing reminders
            </p>
            <h2 className="text-xl text-foreground">System-generated invoice dates</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              These entries come from due invoices automatically, so there is nothing to edit here.
            </p>
          </div>
          <Link href="/admin/billing" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Open billing
          </Link>
        </div>

        {reminders.length ? (
          <div className="overflow-hidden rounded-[1.1rem] border border-border/60">
            {reminders.map((reminder, index) => (
              <div key={reminder.id}>
                <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{reminder.label}</p>
                      <StatusBadge variant={getBillingReminderVariant(reminder.status)}>
                        {formatAdminLabel(reminder.status)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{reminder.familyName}</p>
                  </div>
                  <div className="flex items-start gap-5 sm:text-right">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{reminder.amount}</p>
                      <p className="text-sm text-muted-foreground">{reminder.dueDate}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{reminder.timeLabel}</p>
                  </div>
                </div>
                {index < reminders.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active billing reminders"
            description="When invoices are due, parent-facing billing reminders will appear here automatically."
            icon={CalendarDaysIcon}
          />
        )}
      </Card>

      <Card className="gap-4 px-5 py-5">
        <div className="space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
            Reminder summary
          </p>
          <h3 className="text-lg text-foreground">How these reach families</h3>
        </div>
        <div className="grid gap-3">
          <div className="surface-panel-quiet rounded-[1rem] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Due soon</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{dueCount}</p>
          </div>
          <div className="surface-panel-quiet rounded-[1rem] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Overdue</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{overdueCount}</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Billing reminders are generated from the invoice queue and appear only for the matching
          family. Update invoice status in billing to change what parents see.
        </p>
      </Card>
    </div>
  )
}

export function AdminCalendarPageView({
  events = adminCalendarEvents,
  billingReminders = adminBillingReminders,
  classrooms = adminClassrooms,
}: {
  events?: AdminCalendarEventPreview[]
  billingReminders?: AdminBillingReminderPreview[]
  classrooms?: ClassroomSummaryPreview[]
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id ?? null)
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null
  const rows = getRows(events, selectedEventId, setSelectedEventId)
  const schoolWideCount = events.filter((event) => event.targetScope === "school").length
  const classroomCount = events.filter((event) => event.targetScope === "classroom").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminCalendarPageContent.eyebrow}
          </p>
          <CardTitle>{adminCalendarPageContent.title}</CardTitle>
          <CardDescription>{adminCalendarPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/billing" className={buttonVariants({ variant: "outline" })}>
              Review billing
            </Link>
            <Button type="button" onClick={() => setSelectedEventId(null)}>
              New event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Manual events</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{events.length}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">School-wide</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{schoolWideCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Classroom-targeted</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{classroomCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Billing reminders</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{billingReminders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="gap-4">
        <Card className="gap-4 px-5 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <p className="text-sm leading-6 text-muted-foreground">
              {selectedEvent
                ? `Editing ${selectedEvent.title}. Changes go live immediately for ${selectedEvent.targetLabel}.`
                : "Manual events publish live to parent calendars. Use the billing tab only for invoice-derived reminders."}
            </p>
            <TabsList variant="line" className="self-start">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="billing">Billing reminders</TabsTrigger>
            </TabsList>
          </div>
        </Card>

        <TabsContent value="events" className="mt-0">
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.08fr)_23.5rem]">
            <AdminDataTable
              title="Manual parent calendar events"
              description="Search title, target, date, or category. Use the table to pick an event, then update details in the side editor."
              columns={columns}
              rows={rows}
              searchPlaceholder="Search title, target, or category"
              searchKeys={["event", "target", "date", "category", "actions"]}
            />

            <AdminCalendarEventEditor
              key={selectedEvent?.id ?? "new-calendar-event"}
              event={selectedEvent ?? undefined}
              classrooms={classrooms}
              onClear={() => setSelectedEventId(null)}
            />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="mt-0">
          <BillingReminderPanel reminders={billingReminders} />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
