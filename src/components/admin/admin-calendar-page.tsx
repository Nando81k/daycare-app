"use client"

import Link from "next/link"
import { CalendarDaysIcon } from "lucide-react"
import { useState } from "react"

import { AdminCalendarEventEditor } from "@/components/admin/admin-calendar-event-editor"
import { AdminCalendarWorkspace } from "@/components/admin/admin-calendar-workspace"
import {
  formatAdminLabel,
  getBillingReminderVariant,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  ClassroomSummaryPreview,
} from "@/types/app"

type EditorMode =
  | { kind: "create" }
  | { kind: "edit"; eventId: string }

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
  const [editorMode, setEditorMode] = useState<EditorMode | null>(null)
  const editingEvent =
    editorMode?.kind === "edit"
      ? events.find((event) => event.id === editorMode.eventId) ?? null
      : null
  const isEditorOpen = editorMode !== null

  const schoolWideCount = events.filter((event) => event.targetScope === "school").length
  const classroomCount = events.filter((event) => event.targetScope === "classroom").length

  function handleEditEvent(eventId: string) {
    setEditorMode({ kind: "edit", eventId })
  }

  function handleCreateEvent() {
    setEditorMode({ kind: "create" })
  }

  function handleCloseEditor() {
    setEditorMode(null)
  }

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
            <Button type="button" onClick={handleCreateEvent}>
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

      <Tabs defaultValue="calendar" className="gap-5">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-[1rem] bg-muted/40 p-1.5">
          <TabsTrigger value="calendar" className="min-w-32 flex-none px-3 py-2">
            <CalendarDaysIcon data-icon="inline-start" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="billing" className="min-w-32 flex-none px-3 py-2">
            Billing reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="pt-1">
          <AdminCalendarWorkspace
            events={events}
            onEditEvent={handleEditEvent}
            onCreateEvent={handleCreateEvent}
          />
        </TabsContent>

        <TabsContent value="billing" className="pt-1">
          <BillingReminderPanel reminders={billingReminders} />
        </TabsContent>
      </Tabs>

      <Sheet
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseEditor()
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          <SheetHeader className="gap-1 border-b border-border/60 bg-muted/20 px-5 pb-4 pt-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Calendar event
            </p>
            <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
              {editingEvent ? editingEvent.title : "Create new event"}
            </SheetTitle>
            <SheetDescription>
              {editingEvent
                ? `Editing ${editingEvent.title}. Changes go live immediately for ${editingEvent.targetLabel}.`
                : "Manual events publish live to parent calendars in the targeted scope."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {isEditorOpen && (
              <AdminCalendarEventEditor
                key={editingEvent?.id ?? "new-calendar-event"}
                event={editingEvent ?? undefined}
                classrooms={classrooms}
                onClear={handleCloseEditor}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
