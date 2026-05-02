"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { ParentEnrollmentApplicationDraft } from "@/types/app"

import { Field, FieldsGrid, fieldClasses } from "./step-fields"

export type GuardianStepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
}

export function GuardianStep({ draft, onChange }: GuardianStepProps) {
  return (
    <div className="space-y-5">
      <FieldsGrid>
        <Field label="Guardian full name" htmlFor="guardian-name">
          <Input
            id="guardian-name"
            placeholder="e.g. Sofia Rivera"
            className={fieldClasses}
            value={draft.parentName}
            onChange={(e) => onChange({ parentName: e.target.value })}
          />
        </Field>
        <Field label="Relationship to child" htmlFor="guardian-relationship">
          <Select
            value={draft.relationshipToChild}
            onValueChange={(v) => onChange({ relationshipToChild: v })}
          >
            <SelectTrigger id="guardian-relationship" className={fieldClasses}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="legal-guardian">Legal guardian</SelectItem>
              <SelectItem value="grandparent">Grandparent</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldsGrid>

      <FieldsGrid>
        <Field label="Email address" htmlFor="guardian-email">
          <Input
            id="guardian-email"
            type="email"
            placeholder="sofia@example.com"
            className={fieldClasses}
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Phone number" htmlFor="guardian-phone">
          <Input
            id="guardian-phone"
            type="tel"
            placeholder="+234 801 234 5678"
            className={fieldClasses}
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
      </FieldsGrid>

      <Field label="Home address" htmlFor="guardian-address">
        <Textarea
          id="guardian-address"
          placeholder="Street address, city, state, postal code"
          className={fieldClasses}
          value={draft.homeAddress}
          onChange={(e) => onChange({ homeAddress: e.target.value })}
        />
      </Field>

      <Separator className="my-2" />

      <p className="text-sm font-semibold text-slate-700">Emergency contact</p>

      <FieldsGrid>
        <Field label="Contact name" htmlFor="emergency-name">
          <Input
            id="emergency-name"
            placeholder="e.g. Maria Rivera"
            className={fieldClasses}
            value={draft.emergencyContactName}
            onChange={(e) => onChange({ emergencyContactName: e.target.value })}
          />
        </Field>
        <Field label="Contact phone" htmlFor="emergency-phone">
          <Input
            id="emergency-phone"
            type="tel"
            placeholder="+234 801 987 6543"
            className={fieldClasses}
            value={draft.emergencyContactPhone}
            onChange={(e) =>
              onChange({ emergencyContactPhone: e.target.value })
            }
          />
        </Field>
      </FieldsGrid>
    </div>
  )
}
