"use client"

import { useActionState } from "react"

import type { AuthMutationActionState } from "@/app/actions/auth"
import { AuthStandalonePage } from "@/components/auth/auth-standalone-page"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialMutationState } from "@/lib/action-state"

export function TokenPasswordPage({
  token,
  title,
  description,
  submitLabel,
  action,
}: {
  token: string
  title: string
  description: string
  submitLabel: string
  action: (
    previousState: AuthMutationActionState,
    formData: FormData
  ) => Promise<AuthMutationActionState>
}) {
  const [state, formAction] = useActionState<AuthMutationActionState, FormData>(action, initialMutationState)

  return (
    <AuthStandalonePage
      title={title}
      description={description}
    >
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="token" value={token} />

        {state.error ? (
          <AlertBanner tone="destructive" title="We could not complete this request" description={state.error} />
        ) : null}

        <FieldGroup>
          <Field invalid={Boolean(state.fieldErrors.password)}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Choose a strong password"
              aria-invalid={Boolean(state.fieldErrors.password)}
            />
            <FieldError>{state.fieldErrors.password}</FieldError>
          </Field>
          <Field invalid={Boolean(state.fieldErrors.confirmPassword)}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
            />
            <FieldError>{state.fieldErrors.confirmPassword}</FieldError>
          </Field>
        </FieldGroup>

        <div>
          <Button type="submit" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </AuthStandalonePage>
  )
}
