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
  referralSourceOptions,
  scheduleNeedOptions,
} from "@/data/marketing"
import { waitlistSchema } from "@/lib/validators/marketing"
import type { WaitlistFormValues } from "@/types/app"

import {
  MarketingFieldGroup,
  MarketingSelectField,
  MarketingTextareaField,
  MarketingTextField,
} from "./form-fields"
import { SubmissionSuccessPanel } from "./submission-success-panel"

const defaultValues: WaitlistFormValues = {
  parentName: "",
  email: "",
  phone: "",
  childName: "",
  childAgeRange: "",
  programInterest: "",
  scheduleNeed: "",
  preferredStartMonth: "",
  referralSource: "",
  notes: "",
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues,
  })

  async function onSubmit(values: WaitlistFormValues) {
    setSubmissionError(null)

    const response = await fetch("/api/public/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    const payload = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null

    if (!response.ok || !payload?.ok) {
      setSubmissionError(payload?.message ?? "We could not submit your waitlist request. Please try again.")
      return
    }

    setSubmitted(true)
    form.reset(defaultValues)
  }

  if (submitted) {
    return (
      <SubmissionSuccessPanel
        title="Waitlist request received"
        description="Your details are in place. We will use your schedule needs, age range, and timing to shape follow-up realistically."
        nextSteps={[
          "We will confirm the most likely timing window and next contact point.",
          "If direct enrollment makes sense next, we will recommend the right path.",
          "You can still refine your schedule needs as your plans become clearer.",
        ]}
        onReset={() => setSubmitted(false)}
      />
    )
  }

  return (
    <FormSection
      title="Share your timing and classroom needs"
      description="This form helps us keep follow-up organized and parent-friendly, especially for families planning ahead."
      footer={
        <Button
          type="submit"
          form="waitlist-form"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Joining waitlist..." : "Join the waitlist"}
        </Button>
      }
    >
      <form id="waitlist-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {submissionError ? (
          <AlertBanner
            tone="destructive"
            title="Waitlist request failed"
            description={submissionError}
          />
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <MarketingTextField
            form={form}
            name="parentName"
            label="Parent or guardian name"
            placeholder="Jordan Rivera"
            autoComplete="name"
          />
          <MarketingTextField
            form={form}
            name="email"
            label="Email address"
            type="email"
            placeholder="jordan@familymail.com"
            autoComplete="email"
          />
          <MarketingTextField
            form={form}
            name="phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            placeholder="(617) 555-0148"
            autoComplete="tel"
          />
          <MarketingTextField
            form={form}
            name="childName"
            label="Child name"
            placeholder="Elliot Rivera"
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
            label="Program interest"
            placeholder="Choose a program"
            options={toOptions(programInterestOptions)}
          />
          <MarketingSelectField
            form={form}
            name="scheduleNeed"
            label="Schedule need"
            placeholder="Choose a schedule"
            options={toOptions(scheduleNeedOptions)}
          />
          <MarketingTextField
            form={form}
            name="preferredStartMonth"
            label="Preferred start month"
            placeholder="September 2026"
          />
          <MarketingSelectField
            form={form}
            name="referralSource"
            label="How you heard about the school"
            placeholder="Choose one"
            options={toOptions(referralSourceOptions)}
          />
        </div>
        <MarketingFieldGroup>
          <MarketingTextareaField
            form={form}
            name="notes"
            label="Notes"
            placeholder="Share any details about siblings, timing, pickup needs, or what you are hoping to find."
            description="Optional, but helpful if your timing or schedule is nuanced."
          />
        </MarketingFieldGroup>
      </form>
    </FormSection>
  )
}
