"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { AlertBanner } from "@/components/shared/alert-banner"
import { FormSection } from "@/components/shared/form-section"
import { TurnstileWidget } from "@/components/shared/turnstile-widget"
import { Button } from "@/components/ui/button"
import { contactTopicOptions } from "@/data/marketing"
import { publicAppEnv } from "@/lib/public-env"
import { contactFormSchema } from "@/lib/validators/marketing"
import type { ContactFormValues } from "@/types/app"

import {
  MarketingSelectField,
  MarketingTextareaField,
  MarketingTextField,
} from "./form-fields"
import { SubmissionSuccessPanel } from "./submission-success-panel"

const defaultValues: ContactFormValues = {
  parentName: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
}

function toOptions(values: string[]) {
  return values.map((value) => ({ label: value, value }))
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState("")
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  })

  async function onSubmit(values: ContactFormValues) {
    setSubmissionError(null)

    if (publicAppEnv.turnstileSiteKey && !turnstileToken) {
      setSubmissionError("Please complete the security check before sending.")
      return
    }

    const response = await fetch("/api/public/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values, turnstileToken }),
    })

    const payload = (await response.json().catch(() => null)) as { message?: string; ok?: boolean } | null

    if (!response.ok || !payload?.ok) {
      setSubmissionError(payload?.message ?? "We could not send your message. Please try again.")
      return
    }

    setSubmitted(true)
    form.reset(defaultValues)
  }

  if (submitted) {
    return (
      <SubmissionSuccessPanel
        title="Message sent"
        description="Thanks for reaching out. We will respond with the right next step instead of sending a generic form reply."
        nextSteps={[
          "Expect a response within one business day.",
          "If your question is time-sensitive, calling the school is still the fastest path.",
          "If you are deciding between the waitlist and direct enrollment, we can point you to the better starting point.",
        ]}
        onReset={() => setSubmitted(false)}
      />
    )
  }

  return (
    <FormSection
      title="Send a question"
      description="Use the form for program questions, enrollment follow-up, or general support. We will route it to the right person."
      footer={
        <Button
          type="submit"
          form="contact-form"
          disabled={form.formState.isSubmitting}
          className="w-full sm:w-auto"
        >
          {form.formState.isSubmitting ? "Sending..." : "Send message"}
        </Button>
      }
    >
      <form id="contact-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {submissionError ? (
          <AlertBanner
            tone="destructive"
            title="Message failed"
            description={submissionError}
          />
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <MarketingTextField
            form={form}
            name="parentName"
            label="Your name"
            placeholder="Taylor Brooks"
            autoComplete="name"
          />
          <MarketingTextField
            form={form}
            name="email"
            label="Email address"
            type="email"
            placeholder="taylor@familymail.com"
            autoComplete="email"
          />
          <MarketingTextField
            form={form}
            name="phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            placeholder="Optional"
            autoComplete="tel"
            description="Optional, but helpful if you would prefer a call back."
          />
          <MarketingSelectField
            form={form}
            name="topic"
            label="Topic"
            placeholder="Choose a topic"
            options={toOptions(contactTopicOptions)}
          />
        </div>
        <MarketingTextareaField
          form={form}
          name="message"
          label="How can we help?"
          placeholder="Tell us what you are looking for and we will respond with the most useful next step."
          rows={6}
        />
        {publicAppEnv.turnstileSiteKey && (
          <TurnstileWidget
            sitekey={publicAppEnv.turnstileSiteKey}
            onToken={setTurnstileToken}
          />
        )}
      </form>
    </FormSection>
  )
}
