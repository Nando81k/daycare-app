"use client"

import { useActionState } from "react"

import { createInvoice } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminTextField,
} from "@/components/admin/admin-form-fields"
import { Button } from "@/components/ui/button"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminInvoiceEditor({
  familyId,
  familyName,
  onClear,
}: {
  familyId: string
  familyName: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(createInvoice, initialState)
  const formKey = `invoice-${familyId}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="familyId" value={familyId} />
      <AdminActionPanel
        eyebrow="New invoice"
        title={familyName}
        description="Create a draft invoice for this family."
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Cancel
              </Button>
            ) : null}
            <AdminSubmitButton size="sm" idleLabel="Create draft" pendingLabel="Creating..." />
          </div>
        }
      >
        <AdminFieldGroup className="gap-4">
          <AdminTextField
            name="description"
            label="Description"
            placeholder="e.g. March tuition, Late pickup fee"
            error={state.fieldErrors.description}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextField
              name="amountCents"
              label="Amount (cents)"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 15000 for $150.00"
              error={state.fieldErrors.amountCents}
            />
            <AdminTextField
              name="dueDate"
              label="Due date"
              type="date"
              error={state.fieldErrors.dueDate}
            />
          </div>
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
