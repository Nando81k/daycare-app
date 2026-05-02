"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type {
  ParentEnrollmentApplicationDraft,
  ParentEnrollmentHealthChecklist,
} from "@/types/app"

import { Field, FieldsGrid, fieldClasses } from "./step-fields"

export type HealthSafetyStepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
}

const consentItems: Array<{
  key: keyof ParentEnrollmentHealthChecklist
  label: string
}> = [
  {
    key: "immunizationRecords",
    label: "I authorize the administration of basic first aid",
  },
  {
    key: "emergencyContacts",
    label: "I authorize the use of sunscreen and insect repellent",
  },
  { key: "healthChanges", label: "Immunization records are up to date" },
]

export function HealthSafetyStep({ draft, onChange }: HealthSafetyStepProps) {
  function updateChecklist(
    key: keyof ParentEnrollmentHealthChecklist,
    checked: boolean
  ) {
    onChange({
      healthChecklist: { ...draft.healthChecklist, [key]: checked },
    })
  }

  return (
    <div className="space-y-5">
      <FieldsGrid>
        <Field label="Pediatrician name" htmlFor="pediatrician">
          <Input
            id="pediatrician"
            placeholder="e.g. Dr. Chen"
            className={fieldClasses}
            value={draft.pediatricianName}
            onChange={(e) => onChange({ pediatricianName: e.target.value })}
          />
        </Field>
        <Field label="Pediatrician phone" htmlFor="ped-phone">
          <Input
            id="ped-phone"
            type="tel"
            placeholder="+234 801 111 2222"
            className={fieldClasses}
            value={draft.pediatricianPhone}
            onChange={(e) => onChange({ pediatricianPhone: e.target.value })}
          />
        </Field>
      </FieldsGrid>

      <Field label="Medical conditions" htmlFor="medical" optional>
        <Textarea
          id="medical"
          placeholder="Asthma, diabetes, seizure disorders, etc."
          className={fieldClasses}
          value={draft.healthNotes}
          onChange={(e) => onChange({ healthNotes: e.target.value })}
        />
      </Field>

      <Separator className="my-2" />

      <p className="text-sm font-semibold text-slate-700">
        Consent &amp; authorization
      </p>
      <div className="space-y-3">
        {consentItems.map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-3 text-sm text-slate-600"
          >
            <Checkbox
              checked={draft.healthChecklist[item.key]}
              onCheckedChange={(c) => updateChecklist(item.key, c === true)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
