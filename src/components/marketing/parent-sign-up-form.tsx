"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import type { AuthMutationActionState } from "@/app/actions/auth"
import { registerParentAccount } from "@/app/actions/auth"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: AuthMutationActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Sign up"}
    </Button>
  )
}

export function ParentSignUpForm() {
  const [state, formAction] = useActionState(registerParentAccount, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <AlertBanner tone="destructive" title="Could not create account" description={state.error} />
      ) : null}

      <FieldGroup>
        <Field invalid={Boolean(state.fieldErrors.parentName)}>
          <FieldLabel htmlFor="signup-parent-name">Parent name</FieldLabel>
          <Input id="signup-parent-name" name="parentName" placeholder="Olivia Harper" required />
          <FieldError>{state.fieldErrors.parentName}</FieldError>
        </Field>

        <Field invalid={Boolean(state.fieldErrors.familyName)}>
          <FieldLabel htmlFor="signup-family-name">Family name</FieldLabel>
          <Input id="signup-family-name" name="familyName" placeholder="Harper Family" required />
          <FieldError>{state.fieldErrors.familyName}</FieldError>
        </Field>

        <Field invalid={Boolean(state.fieldErrors.email)}>
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="m@example.com" required />
          <FieldError>{state.fieldErrors.email}</FieldError>
        </Field>

        <Field invalid={Boolean(state.fieldErrors.phone)}>
          <FieldLabel htmlFor="signup-phone">Phone</FieldLabel>
          <Input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="(617) 555-0174" required />
          <FieldError>{state.fieldErrors.phone}</FieldError>
        </Field>

        <Field invalid={Boolean(state.fieldErrors.password)}>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <Input id="signup-password" name="password" type="password" autoComplete="new-password" required />
          <FieldError>{state.fieldErrors.password}</FieldError>
        </Field>

        <Field invalid={Boolean(state.fieldErrors.confirmPassword)}>
          <FieldLabel htmlFor="signup-confirm-password">Confirm password</FieldLabel>
          <Input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required />
          <FieldError>{state.fieldErrors.confirmPassword}</FieldError>
        </Field>

        <Field>
          <SubmitButton />
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/login/parent" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
