"use client"

import { useActionState } from "react"

import { updateSchoolSettingValue } from "@/app/actions/admin"
import { AdminSubmitButton } from "@/components/admin/admin-action-panel"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminSettingEditor({
  item,
}: {
  item: {
    id: string
    label: string
    value: string
    note?: string
  }
}) {
  const [state, formAction] = useActionState(updateSchoolSettingValue, initialState)
  const formKey = `${item.id}-${item.value}`

  return (
    <form key={formKey} action={formAction} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
      <input type="hidden" name="settingId" value={item.id} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{item.label}</p>
        <AdminSubmitButton size="sm" variant="outline" idleLabel="Save" pendingLabel="Saving..." />
      </div>
      <Field className="mt-4" invalid={Boolean(state.fieldErrors.value)}>
        <FieldLabel htmlFor={`setting-${item.id}`}>Current value</FieldLabel>
        <Textarea
          id={`setting-${item.id}`}
          name="value"
          defaultValue={item.value}
          rows={3}
          aria-invalid={Boolean(state.fieldErrors.value)}
        />
        {item.note ? <FieldDescription>{item.note}</FieldDescription> : null}
        <FieldError>{state.fieldErrors.value}</FieldError>
      </Field>
      {state.error ? (
        <div className="mt-4">
          <AlertBanner tone="destructive" title="Update failed" description={state.error} />
        </div>
      ) : null}
      {state.success && state.message ? (
        <div className="mt-4">
          <AlertBanner tone="success" title="Saved" description={state.message} />
        </div>
      ) : null}
    </form>
  )
}
