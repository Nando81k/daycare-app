"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import type { AuthMutationActionState } from "@/app/actions/auth"
import { AuthStandalonePage } from "@/components/auth/auth-standalone-page"
import { PasswordChecklist } from "@/components/auth/password-checklist"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialMutationState } from "@/lib/action-state"

export function TokenPasswordPage({
  token,
  title,
  description,
  submitLabel,
  action,
  showBackToLogin = true,
}: {
  token: string
  title: string
  description: string
  submitLabel: string
  action: (
    previousState: AuthMutationActionState,
    formData: FormData
  ) => Promise<AuthMutationActionState>
  /** Show the "Back to sign in" link beneath the form. Default true for the
   * reset path; invite-acceptance can hide it since the recipient has no
   * existing password to sign in with. */
  showBackToLogin?: boolean
}) {
  const [state, formAction] = useActionState<AuthMutationActionState, FormData>(action, initialMutationState)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <FieldError>{state.fieldErrors.confirmPassword}</FieldError>
          </Field>
        </FieldGroup>

        <PasswordChecklist password={password} confirmPassword={confirmPassword} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="w-full sm:w-auto">
            {submitLabel}
          </Button>
          {showBackToLogin ? (
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Back to sign in
            </Link>
          ) : null}
        </div>
      </form>
    </AuthStandalonePage>
  )
}
