"use client"

import { useActionState } from "react"

import { submitEnrollmentApplication } from "@/app/actions/parent"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ParentActionState, ParentEnrollmentDraft } from "@/types/app"

const initialState: ParentActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function ParentEnrollmentForm({
  draft,
}: {
  draft: ParentEnrollmentDraft
}) {
  const [state, formAction] = useActionState(submitEnrollmentApplication, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <AlertBanner
          tone="destructive"
          title="Could not submit enrollment"
          description={state.error}
        />
      ) : null}
      {state.success && state.message ? (
        <AlertBanner tone="success" title="Enrollment submitted" description={state.message} />
      ) : null}

      <FieldGroup className="md:grid md:grid-cols-2 md:gap-4">
        <Field invalid={Boolean(state.fieldErrors.familyName)}>
          <FieldLabel htmlFor="enrollment-family-name">Family name</FieldLabel>
          <Input id="enrollment-family-name" name="familyName" defaultValue={draft.familyName} />
          <FieldError>{state.fieldErrors.familyName}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.phone)}>
          <FieldLabel htmlFor="enrollment-phone">Phone number</FieldLabel>
          <Input id="enrollment-phone" name="phone" type="tel" defaultValue={draft.phone} />
          <FieldError>{state.fieldErrors.phone}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.childName)}>
          <FieldLabel htmlFor="enrollment-child-name">Child name</FieldLabel>
          <Input id="enrollment-child-name" name="childName" defaultValue={draft.childName} />
          <FieldError>{state.fieldErrors.childName}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.childAgeLabel)}>
          <FieldLabel>Child age group</FieldLabel>
          <Select name="childAgeLabel" defaultValue={draft.childAgeLabel || undefined}>
            <SelectTrigger aria-invalid={Boolean(state.fieldErrors.childAgeLabel)}>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Infant">Infant</SelectItem>
                <SelectItem value="Toddler">Toddler</SelectItem>
                <SelectItem value="Preschool">Preschool</SelectItem>
                <SelectItem value="Pre-K">Pre-K</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{state.fieldErrors.childAgeLabel}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.requestedStart)}>
          <FieldLabel>Requested start</FieldLabel>
          <Select name="requestedStart" defaultValue={draft.requestedStart || undefined}>
            <SelectTrigger aria-invalid={Boolean(state.fieldErrors.requestedStart)}>
              <SelectValue placeholder="Choose a timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="As soon as possible">As soon as possible</SelectItem>
                <SelectItem value="Within 30 days">Within 30 days</SelectItem>
                <SelectItem value="Within 60 days">Within 60 days</SelectItem>
                <SelectItem value="This summer">This summer</SelectItem>
                <SelectItem value="This fall">This fall</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{state.fieldErrors.requestedStart}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.programInterest)}>
          <FieldLabel>Program interest</FieldLabel>
          <Select name="programInterest" defaultValue={draft.programInterest || undefined}>
            <SelectTrigger aria-invalid={Boolean(state.fieldErrors.programInterest)}>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Infant care">Infant care</SelectItem>
                <SelectItem value="Toddler program">Toddler program</SelectItem>
                <SelectItem value="Preschool program">Preschool program</SelectItem>
                <SelectItem value="Pre-K program">Pre-K program</SelectItem>
                <SelectItem value="Part-time care">Part-time care</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{state.fieldErrors.programInterest}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.scheduleNeed)} className="md:col-span-2">
          <FieldLabel>Schedule need</FieldLabel>
          <Input
            name="scheduleNeed"
            defaultValue={draft.scheduleNeed}
            placeholder="Full time, 3 days per week, mornings only, etc."
          />
          <FieldError>{state.fieldErrors.scheduleNeed}</FieldError>
        </Field>
        <Field invalid={Boolean(state.fieldErrors.note)} className="md:col-span-2">
          <FieldLabel htmlFor="enrollment-note">Anything the center should know?</FieldLabel>
          <Textarea
            id="enrollment-note"
            name="note"
            defaultValue={draft.note}
            placeholder="Optional notes about schedule, timing, or care needs."
            rows={5}
          />
          <FieldError>{state.fieldErrors.note}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">Submit enrollment</Button>
      </div>
    </form>
  )
}
