"use client"

import { useActionState } from "react"

import { createDocumentRequest } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminDocumentRequestEditor({
  familyId,
  familyName,
  onClear,
}: {
  familyId: string
  familyName: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(createDocumentRequest, initialState)
  const formKey = `doc-request-${familyId}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="familyId" value={familyId} />
      <AdminActionPanel
        eyebrow="Document request"
        title={familyName}
        description="Request a document from this family. They will see it on their parent portal."
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Cancel
              </Button>
            ) : null}
            <AdminSubmitButton size="sm" idleLabel="Send request" pendingLabel="Sending..." />
          </div>
        }
      >
        <AdminFieldGroup className="gap-4">
          <AdminTextField
            name="title"
            label="Document title"
            placeholder="e.g. Immunization record, Emergency contact form"
            error={state.fieldErrors.title}
          />
          <AdminTextareaField
            name="note"
            label="Note to family"
            placeholder="Optional details about what is needed or when it is due."
            rows={3}
            error={state.fieldErrors.note}
          />
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
