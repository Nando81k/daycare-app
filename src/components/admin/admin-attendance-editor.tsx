"use client"

import { useActionState } from "react"

import { upsertAttendanceRecord } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import { AttendanceHistoryStrip } from "@/components/admin/attendance/attendance-history-strip"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AttendanceChildRow } from "@/lib/dal/attendance"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const statusOptions = [
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Scheduled", value: "SCHEDULED" },
]

function toStatusValue(value: AttendanceChildRow["status"]) {
  switch (value) {
    case "present":
      return "PRESENT"
    case "absent":
      return "ABSENT"
    case "scheduled":
      return "SCHEDULED"
  }
}

export function AdminAttendanceEditor({
  child,
  date,
  onClear,
}: {
  child: AttendanceChildRow
  /** ISO YYYY-MM-DD — record will be saved against this day. */
  date: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(upsertAttendanceRecord, initialState)
  const formKey = `${child.id}-${date}-${child.status}-${child.checkInValue ?? ""}-${child.checkOutValue ?? ""}-${child.note}`

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="childId" value={child.id} />
      <input type="hidden" name="date" value={date} />
      <AttendanceHistoryStrip history={child.history} />
      <AdminActionPanel
        eyebrow="Attendance editor"
        title={child.name}
        description={`Update the ${formatDateLabel(date)} attendance record for ${child.classroomName}.`}
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {child.familyName} · Parent route refreshes after save
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {onClear ? (
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                  Close
                </Button>
              ) : null}
              <AdminSubmitButton size="sm" idleLabel="Save attendance" pendingLabel="Saving attendance..." />
            </div>
          </div>
        }
      >
        <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
          {child.note || "No note has been saved for this attendance snapshot yet."}
        </div>
        <AdminFieldGroup className="gap-4">
          <AdminSelectField
            name="status"
            label="Attendance status"
            defaultValue={toStatusValue(child.status)}
            options={statusOptions}
            error={state.fieldErrors.status}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextField
              name="checkInAt"
              type="time"
              label="Check-in time"
              defaultValue={child.checkInValue ?? ""}
              error={state.fieldErrors.checkInAt}
            />
            <AdminTextField
              name="checkOutAt"
              type="time"
              label="Check-out time"
              defaultValue={child.checkOutValue ?? ""}
              error={state.fieldErrors.checkOutAt}
            />
          </div>
          <AdminTextareaField
            name="note"
            label="Attendance note"
            defaultValue={child.note}
            placeholder="Capture the context staff and families need to understand today's status."
            description="Use a short operational note for late arrival, planned absence, or a check-out change."
            error={state.fieldErrors.note}
            rows={4}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map((p) => Number(p))
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
