"use client"

import { useActionState } from "react"

import { updateWaitlistEntry } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState, WaitlistEntryPreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const statusOptions = [
  { label: "Review", value: "REVIEW" },
  { label: "Tour pending", value: "TOUR_PENDING" },
  { label: "Offer ready", value: "OFFER_READY" },
  { label: "Long range", value: "LONG_RANGE" },
]

const priorityOptions = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
]

function toStatusValue(value: WaitlistEntryPreview["status"]) {
  switch (value) {
    case "review":
      return "REVIEW"
    case "tour-pending":
      return "TOUR_PENDING"
    case "offer-ready":
      return "OFFER_READY"
    case "long-range":
      return "LONG_RANGE"
  }
}

function toPriorityValue(value: WaitlistEntryPreview["priority"]) {
  switch (value) {
    case "high":
      return "HIGH"
    case "medium":
      return "MEDIUM"
    case "low":
      return "LOW"
  }
}

export function AdminWaitlistEditor({
  entry,
  onClear,
}: {
  entry: WaitlistEntryPreview
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(updateWaitlistEntry, initialState)
  const formKey = `${entry.id}-${entry.status}-${entry.priority}-${entry.assignedTo}-${entry.note}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="leadId" value={entry.id} />
      <AdminActionPanel
        eyebrow="Waitlist editor"
        title={entry.familyName}
        description={`Adjust placement readiness and internal follow-up for ${entry.childName}.`}
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {entry.requestedStart} · {entry.scheduleNeed}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {onClear ? (
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                  Close
                </Button>
              ) : null}
              <AdminSubmitButton size="sm" idleLabel="Save entry" pendingLabel="Saving entry..." />
            </div>
          </div>
        }
      >
        <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
          {entry.note}
        </div>
        <AdminFieldGroup className="gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminSelectField
              name="waitlistStatus"
              label="Waitlist status"
              defaultValue={toStatusValue(entry.status)}
              options={statusOptions}
              error={state.fieldErrors.waitlistStatus}
            />
            <AdminSelectField
              name="priority"
              label="Priority"
              defaultValue={toPriorityValue(entry.priority)}
              options={priorityOptions}
              error={state.fieldErrors.priority}
            />
          </div>
          <AdminTextField
            name="assignedTo"
            label="Assigned owner"
            defaultValue={entry.assignedTo}
            placeholder="Director or front office owner"
            error={state.fieldErrors.assignedTo}
          />
          <AdminTextareaField
            name="note"
            label="Internal note"
            defaultValue={entry.note}
            placeholder="Capture the clearest decision point for this family."
            description="Keep placement logic legible so capacity decisions stay consistent."
            error={state.fieldErrors.note}
            rows={5}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
