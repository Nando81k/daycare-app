"use client"

import { useActionState } from "react"

import { updateEnrollmentLead } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState, EnrollmentLeadPreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const stageOptions = [
  { label: "Tour requested", value: "TOUR_REQUESTED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Tour scheduled", value: "TOUR_SCHEDULED" },
  { label: "Application sent", value: "APPLICATION_SENT" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Denied", value: "DENIED" },
]

const priorityOptions = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Normal", value: "NORMAL" },
  { label: "Low", value: "LOW" },
]

function toStageValue(value: EnrollmentLeadPreview["stage"]) {
  switch (value) {
    case "tour-requested":
      return "TOUR_REQUESTED"
    case "contacted":
      return "CONTACTED"
    case "tour-scheduled":
      return "TOUR_SCHEDULED"
    case "application-sent":
      return "APPLICATION_SENT"
    case "accepted":
      return "ACCEPTED"
    case "denied":
      return "DENIED"
  }
}

function toPriorityValue(value: EnrollmentLeadPreview["priority"]) {
  switch (value) {
    case "high":
      return "HIGH"
    case "medium":
      return "MEDIUM"
    case "normal":
      return "NORMAL"
    case "low":
      return "LOW"
  }
}

export function AdminEnrollmentEditor({
  lead,
  onClear,
}: {
  lead: EnrollmentLeadPreview
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(updateEnrollmentLead, initialState)
  const formKey = `${lead.id}-${lead.stage}-${lead.priority}-${lead.assignedTo}-${lead.note}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="leadId" value={lead.id} />
      <AdminActionPanel
        eyebrow="Lead editor"
        title={lead.familyName}
        description={`Update follow-up ownership and the next step for ${lead.childName}.`}
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Submitted {lead.submittedAt} · {lead.programInterest}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {onClear ? (
                <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                  Close
                </Button>
              ) : null}
              <AdminSubmitButton size="sm" idleLabel="Save lead" pendingLabel="Saving lead..." />
            </div>
          </div>
        }
      >
        <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
          {lead.note}
        </div>
        <AdminFieldGroup className="gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminSelectField
              name="stage"
              label="Lead stage"
              defaultValue={toStageValue(lead.stage)}
              options={stageOptions}
              error={state.fieldErrors.stage}
            />
            <AdminSelectField
              name="priority"
              label="Priority"
              defaultValue={toPriorityValue(lead.priority)}
              options={priorityOptions}
              error={state.fieldErrors.priority}
            />
          </div>
          <AdminTextField
            name="assignedTo"
            label="Assigned owner"
            defaultValue={lead.assignedTo}
            placeholder="Director or front office owner"
            error={state.fieldErrors.assignedTo}
          />
          <AdminTextareaField
            name="note"
            label="Internal note"
            defaultValue={lead.note}
            placeholder="Capture the clearest next step or concern for this family."
            description="Keep the note actionable so the next follow-up does not depend on memory."
            error={state.fieldErrors.note}
            rows={5}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
