"use client"

import Link from "next/link"
import { useActionState } from "react"

import { type AuthMutationActionState, requestPasswordReset } from "@/app/actions/auth"
import { AuthStandalonePage } from "@/components/auth/auth-standalone-page"
import { AlertBanner } from "@/components/shared/alert-banner"
import { TurnstileWidget } from "@/components/shared/turnstile-widget"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialMutationState } from "@/lib/action-state"
import { publicAppEnv } from "@/lib/public-env"

export function PasswordResetRequestPage() {
  const [state, formAction] = useActionState<AuthMutationActionState, FormData>(
    requestPasswordReset,
    initialMutationState
  )

  return (
    <AuthStandalonePage
      title="Reset your password"
      description="Enter your email and we’ll send a reset link if an account exists."
    >
      <form action={formAction} className="flex flex-col gap-6">
        {state.error ? (
          <AlertBanner tone="destructive" title="Unable to send reset link" description={state.error} />
        ) : null}
        {state.success && state.message ? (
          <AlertBanner tone="success" title="Check your inbox" description={state.message} />
        ) : null}

        <FieldGroup>
          <Field invalid={Boolean(state.fieldErrors.email)}>
            <FieldLabel htmlFor="reset-email">Email</FieldLabel>
            <Input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="m@example.com"
              aria-invalid={Boolean(state.fieldErrors.email)}
            />
            <FieldError>{state.fieldErrors.email}</FieldError>
          </Field>
        </FieldGroup>

        <TurnstileWidget sitekey={publicAppEnv.turnstileSiteKey} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="w-full sm:w-auto">
            Send reset link
          </Button>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthStandalonePage>
  )
}
