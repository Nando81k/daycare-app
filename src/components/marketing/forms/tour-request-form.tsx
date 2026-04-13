"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { AlertBanner } from "@/components/shared/alert-banner"
import { FormSection } from "@/components/shared/form-section"
import { Button } from "@/components/ui/button"
import {
  ageRangeOptions,
  programInterestOptions,
  startTimeframeOptions,
  tourTimingOptions,
} from "@/data/marketing"
import { tourRequestSchema } from "@/lib/validators/marketing"
import type { TourRequestFormValues } from "@/types/app"

import {
  MarketingFieldGroup,
  MarketingSelectField,
  MarketingTextareaField,
  MarketingTextField,
} from "./form-fields"
import { SubmissionSuccessPanel } from "./submission-success-panel"

const defaultValues: TourRequestFormValues = {
  parentName: "",
  email: "",
  phone: "",
  childAgeRange: "",
  programInterest: "",
  startTimeframe: "",
  tourTiming: "",
  notes: "",
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

export function TourRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const form = useForm<TourRequestFormValues>({
    resolver: zodResolver(tourRequestSchema),
    defaultValues,
  })

  async function onSubmit(values: TourRequestFormValues) {
    setSubmissionError(null)

    const response = await fetch("/api/public/tour", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    const payload = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null

    if (!response.ok || !payload?.ok) {
      setSubmissionError(payload?.message ?? "We could not submit your tour request. Please try again.")
      return
    }

    setSubmitted(true)
    form.reset(defaultValues)
  }

  if (submitted) {
    return (
      <SubmissionSuccessPanel
        title="Tour request received"
        description="We will review your child’s age range, timing, and program interests, then follow up with the best next step for a visit."
        nextSteps={[
          "Expect a follow-up within one business day.",
          "We will confirm likely availability and the best classroom fit to tour.",
          "If timing is tight, we can suggest a waitlist path alongside the tour conversation.",
        ]}
        onReset={() => setSubmitted(false)}
      />
    )
  }

  return (
    <FormSection
      title="Tell us about your family"
      description="A short request is enough to start. Share the basics and we will coordinate the most useful next step."
      footer={
        <Button
          type="submit"
          form="tour-request-form"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Requesting tour..." : "Request tour"}
        </Button>
      }
    >
      <form id="tour-request-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {submissionError ? (
          <AlertBanner
            tone="destructive"
            title="Tour request failed"
            description={submissionError}
          />
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <MarketingTextField
            form={form}
            name="parentName"
            label="Parent or guardian name"
            placeholder="Alex Morgan"
            autoComplete="name"
          />
          <MarketingTextField
            form={form}
            name="email"
            label="Email address"
            type="email"
            placeholder="alex@familymail.com"
            autoComplete="email"
          />
          <MarketingTextField
            form={form}
            name="phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            placeholder="(617) 555-0126"
            autoComplete="tel"
          />
          <MarketingSelectField
            form={form}
            name="childAgeRange"
            label="Child age range"
            placeholder="Select an age range"
            options={toOptions(ageRangeOptions)}
          />
          <MarketingSelectField
            form={form}
            name="programInterest"
            label="Interested program"
            placeholder="Choose a program"
            options={toOptions(programInterestOptions)}
          />
          <MarketingSelectField
            form={form}
            name="startTimeframe"
            label="Preferred start timeframe"
            placeholder="Choose a timeframe"
            options={toOptions(startTimeframeOptions)}
          />
        </div>
        <MarketingFieldGroup>
          <MarketingSelectField
            form={form}
            name="tourTiming"
            label="Preferred tour timing"
            placeholder="Choose a tour window"
            options={toOptions(tourTimingOptions)}
          />
          <MarketingTextareaField
            form={form}
            name="notes"
            label="Questions or notes"
            placeholder="Tell us anything that would make the visit more useful for your family."
            description="Optional, but helpful if you already know your schedule needs or concerns."
          />
        </MarketingFieldGroup>
      </form>
    </FormSection>
  )
}
