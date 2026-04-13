"use client"

import { useActionState } from "react"

import { upsertAttendanceRecord } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState, AdminChildRecordPreview } from "@/types/app"

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

function toStatusValue(value: AdminChildRecordPreview["attendanceStatus"]) {
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
  onClear,
}: {
  child: AdminChildRecordPreview
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(upsertAttendanceRecord, initialState)
  const formKey = `${child.id}-${child.attendanceStatus}-${child.checkInTime ?? ""}-${child.checkOutTime ?? ""}-${child.attendanceNote}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="childId" value={child.id} />
      <AdminActionPanel
        eyebrow="Attendance editor"
        title={child.name}
        description={`Update today's attendance record for ${child.classroom}.`}
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
          {child.attendanceNote || "No note has been saved for this attendance snapshot yet."}
        </div>
        <AdminFieldGroup className="gap-4">
          <AdminSelectField
            name="status"
            label="Attendance status"
            defaultValue={toStatusValue(child.attendanceStatus)}
            options={statusOptions}
            error={state.fieldErrors.status}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextField
              name="checkInAt"
              type="time"
              label="Check-in time"
              defaultValue={child.checkInTime}
              error={state.fieldErrors.checkInAt}
            />
            <AdminTextField
              name="checkOutAt"
              type="time"
              label="Check-out time"
              defaultValue={child.checkOutTime}
              error={state.fieldErrors.checkOutAt}
            />
          </div>
          <AdminTextareaField
            name="note"
            label="Attendance note"
            defaultValue={child.attendanceNote}
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
