"use client"

import { useActionState } from "react"

import { updateFamilyStage } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState } from "@/types/app"

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

export function AdminFamilyStageEditor({
  familyId,
  familyName,
  currentStage,
  onClear,
}: {
  familyId: string
  familyName: string
  currentStage: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(updateFamilyStage, initialState)
  const formKey = `stage-${familyId}-${currentStage}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="familyId" value={familyId} />
      <AdminActionPanel
        eyebrow="Enrollment stage"
        title={familyName}
        description="Update the enrollment pipeline stage for this family."
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Cancel
              </Button>
            ) : null}
            <AdminSubmitButton size="sm" idleLabel="Update stage" pendingLabel="Updating..." />
          </div>
        }
      >
        <AdminFieldGroup>
          <AdminSelectField
            name="enrollmentStage"
            label="Stage"
            defaultValue={currentStage}
            options={stageOptions}
            error={state.fieldErrors.enrollmentStage}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
