"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ParentEnrollmentApplicationDraft } from "@/types/app"

import { Field, FieldsGrid, fieldClasses } from "./step-fields"

export type ChildDetailsStepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
}

export function ChildDetailsStep({ draft, onChange }: ChildDetailsStepProps) {
  return (
    <div className="space-y-5">
      <FieldsGrid>
        <Field label="First name" htmlFor="child-first">
          <Input
            id="child-first"
            placeholder="e.g. Emma"
            className={fieldClasses}
            value={draft.childFirstName}
            onChange={(e) => onChange({ childFirstName: e.target.value })}
          />
        </Field>
        <Field label="Last name" htmlFor="child-last">
          <Input
            id="child-last"
            placeholder="e.g. Rivera"
            className={fieldClasses}
            value={draft.childLastName}
            onChange={(e) => onChange({ childLastName: e.target.value })}
          />
        </Field>
      </FieldsGrid>

      <FieldsGrid>
        <Field label="Date of birth" htmlFor="child-dob">
          <Input
            id="child-dob"
            type="date"
            className={fieldClasses}
            value={draft.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
          />
        </Field>
        <Field label="Gender" htmlFor="child-gender">
          <Select
            value={draft.childAgeLabel}
            onValueChange={(v) => onChange({ childAgeLabel: v })}
          >
            <SelectTrigger id="child-gender" className={fieldClasses}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldsGrid>

      <Field label="Allergies / dietary needs" htmlFor="allergies" optional>
        <Textarea
          id="allergies"
          placeholder="List any allergies, dietary restrictions, or food sensitivities…"
          className={fieldClasses}
          value={draft.healthNotes}
          onChange={(e) => onChange({ healthNotes: e.target.value })}
        />
      </Field>

      <Field label="Primary language" htmlFor="language" optional>
        <Input
          id="language"
          placeholder="e.g. English, Spanish"
          className={fieldClasses}
          value={draft.primaryLanguage}
          onChange={(e) => onChange({ primaryLanguage: e.target.value })}
        />
      </Field>
    </div>
  )
}
