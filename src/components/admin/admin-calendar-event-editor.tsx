"use client"

import { useActionState, useState } from "react"

import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/app/actions/admin"
import {
  AdminActionPanel,
  AdminSubmitButton,
} from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { AlertBanner } from "@/components/shared/alert-banner"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"
import type {
  AdminActionState,
  AdminCalendarEventPreview,
  CalendarEventTimeKind,
  ClassroomSummaryPreview,
} from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const defaultEvent = {
  title: "",
  description: "",
  category: "family",
  targetScope: "school",
  targetLabel: "All families",
  classroomId: undefined,
  timeKind: "timed",
  startsAtValue: "",
  eventDateValue: "",
} satisfies Pick<
  AdminCalendarEventPreview,
  | "title"
  | "description"
  | "category"
  | "targetScope"
  | "targetLabel"
  | "classroomId"
  | "timeKind"
  | "startsAtValue"
  | "eventDateValue"
>

function DeleteCalendarEventPanel({
  eventId,
  title,
}: {
  eventId: string
  title: string
}) {
  const [state, formAction] = useActionState(deleteCalendarEvent, initialState)

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${title}" from the parent calendar?`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <SurfaceCard tone="muted" density="compact" className="gap-3 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-primary">
              Danger zone
            </p>
            <h3 className="text-base font-semibold text-foreground">Remove this event entirely</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Delete only when this date should disappear from affected parent calendars.
            </p>
          </div>
          <AdminSubmitButton
            variant="destructive"
            size="sm"
            idleLabel="Delete event"
            pendingLabel="Deleting..."
          />
        </div>
        {state.error ? (
          <AlertBanner tone="destructive" title="Delete failed" description={state.error} />
        ) : null}
        {state.success && state.message ? (
          <AlertBanner tone="success" title="Deleted" description={state.message} />
        ) : null}
      </SurfaceCard>
    </form>
  )
}

export function AdminCalendarEventEditor({
  event,
  classrooms,
  onClear,
}: {
  event?: AdminCalendarEventPreview
  classrooms: ClassroomSummaryPreview[]
  onClear?: () => void
}) {
  const action = event ? updateCalendarEvent : createCalendarEvent
  const [state, formAction] = useActionState(action, initialState)
  const content = event ?? defaultEvent
  const [targetScope, setTargetScope] = useState(content.targetScope)
  const [timeKind, setTimeKind] = useState<CalendarEventTimeKind>(content.timeKind)

  return (
    <div className="grid gap-4">
      <form action={formAction}>
        {event ? <input type="hidden" name="eventId" value={event.id} /> : null}
        <AdminActionPanel
          eyebrow={event ? "Calendar editor" : "New calendar event"}
          title={event ? event.title : "Create a new parent calendar event"}
          description={
            event
              ? "Manual event changes update the matching parent calendars immediately."
              : "Create a school-wide or classroom-targeted event for parents."
          }
          state={state}
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {event
                  ? `${event.targetLabel} · ${event.dateLabel} · ${event.timeLabel}`
                  : "Billing reminders are invoice-driven and stay outside the editor."}
              </p>
              <div className="flex items-center gap-2">
                {onClear ? (
                  event ? (
                    <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                      Create new
                    </Button>
                  ) : (
                    <Button type="reset" variant="ghost" size="sm">
                      Reset
                    </Button>
                  )
                ) : null}
                <AdminSubmitButton
                  size="sm"
                  idleLabel={event ? "Save event" : "Create event"}
                  pendingLabel={event ? "Saving..." : "Creating..."}
                />
              </div>
            </div>
          }
        >
          <AdminFieldGroup className="gap-4 xl:grid xl:grid-cols-2">
            <AdminTextField
              name="title"
              label="Event title"
              defaultValue={content.title}
              placeholder="Spring family breakfast"
              error={state.fieldErrors.title}
            />
            <AdminSelectField
              name="category"
              label="Category"
              defaultValue={
                content.category === "classroom"
                  ? "CLASSROOM"
                  : content.category === "closure"
                    ? "CLOSURE"
                    : "FAMILY"
              }
              options={[
                { value: "FAMILY", label: "Family" },
                { value: "CLASSROOM", label: "Classroom" },
                { value: "CLOSURE", label: "Closure" },
              ]}
              error={state.fieldErrors.category}
            />
            <AdminSelectField
              name="targetScope"
              label="Who should see it"
              defaultValue={content.targetScope}
              options={[
                { value: "school", label: "All families" },
                { value: "classroom", label: "One classroom" },
              ]}
              description="School-wide events appear for every family. Classroom events only appear for families tied to that room."
              error={state.fieldErrors.targetScope}
              onChange={(event) => setTargetScope(event.target.value as "school" | "classroom")}
            />
            {targetScope === "classroom" ? (
              <AdminSelectField
                name="classroomId"
                label="Classroom"
                defaultValue={content.classroomId ?? ""}
                options={[
                  { value: "", label: "Choose a classroom" },
                  ...classrooms.map((classroom) => ({
                    value: classroom.id,
                    label: classroom.name,
                  })),
                ]}
                error={state.fieldErrors.classroomId}
              />
            ) : (
              <input type="hidden" name="classroomId" value="" />
            )}
            <AdminSelectField
              name="timeKind"
              label="Timing"
              defaultValue={content.timeKind}
              options={[
                { value: "timed", label: "Timed event" },
                { value: "all-day", label: "All day" },
              ]}
              error={state.fieldErrors.timeKind}
              onChange={(event) => setTimeKind(event.target.value as CalendarEventTimeKind)}
            />
            {timeKind === "timed" ? (
              <>
                <AdminTextField
                  name="startsAt"
                  type="datetime-local"
                  label="Start date and time"
                  defaultValue={content.startsAtValue}
                  error={state.fieldErrors.startsAt}
                />
                <input type="hidden" name="eventDate" value="" />
              </>
            ) : (
              <>
                <AdminTextField
                  name="eventDate"
                  type="date"
                  label="Event date"
                  defaultValue={content.eventDateValue}
                  error={state.fieldErrors.eventDate}
                />
                <input type="hidden" name="startsAt" value="" />
              </>
            )}
            <AdminTextareaField
              name="description"
              label="Description"
              defaultValue={content.description}
              placeholder="What families need to know about this date, schedule, or reminder."
              description="This copy appears directly on the parent calendar and overview surfaces."
              error={state.fieldErrors.description}
              rows={4}
            />
            <div className="xl:col-span-2">
              <p className="text-xs leading-5 text-muted-foreground">
                School-wide events appear for every family. Classroom-targeted events only appear
                for families with a child assigned to that room.
              </p>
            </div>
          </AdminFieldGroup>
        </AdminActionPanel>
      </form>

      {event ? <DeleteCalendarEventPanel eventId={event.id} title={event.title} /> : null}
    </div>
  )
}
