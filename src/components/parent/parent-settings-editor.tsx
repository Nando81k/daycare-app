"use client"

import { useActionState } from "react"

import { updateParentSettings } from "@/app/actions/parent"
import { ParentActionPanel, ParentSubmitButton } from "@/components/parent/parent-action-panel"
import { ParentFieldGroup, ParentTextField } from "@/components/parent/parent-form-fields"
import { FieldDescription, FieldLabel } from "@/components/ui/field"
import type { ParentSettingsPreview } from "@/types/app"
import { initialMutationState } from "@/lib/action-state"

export function ParentSettingsEditor({
  settings,
}: {
  settings: ParentSettingsPreview
}) {
  const [state, formAction] = useActionState(updateParentSettings, initialMutationState)

  return (
    <ParentActionPanel
      eyebrow="Family account"
      title="Update contact preferences"
      description="Keep the family phone, billing contact, and notification cadence accurate without turning this screen into a dense account settings panel."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        <ParentFieldGroup>
          <ParentTextField
            name="phone"
            label="Family phone"
            defaultValue={settings.phone}
            inputMode="tel"
            error={state.fieldErrors.phone}
          />
          <ParentTextField
            name="billingContact"
            label="Billing contact"
            defaultValue={settings.billingContact}
            error={state.fieldErrors.billingContact}
          />
        </ParentFieldGroup>

        <div className="rounded-3xl border border-border/60 bg-background/82 px-4 py-4">
          <FieldLabel asChild>
            <p>Notification preferences</p>
          </FieldLabel>
          <FieldDescription className="mt-1">
            Choose which updates should reach the family account by default.
          </FieldDescription>
          <div className="mt-4 grid gap-3">
            {settings.notificationPreferences.map((preference) => (
              <label
                key={preference.id}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/55 px-4 py-4"
              >
                <input
                  type="checkbox"
                  name="notificationPreferenceIds"
                  value={preference.id}
                  defaultChecked={preference.enabled}
                  className="mt-1 size-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{preference.label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{preference.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ParentSubmitButton idleLabel="Save settings" pendingLabel="Saving..." />
        </div>
      </form>
    </ParentActionPanel>
  )
}
