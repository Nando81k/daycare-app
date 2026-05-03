"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowRight } from "lucide-react"

import type { AuthMutationActionState } from "@/app/actions/auth"
import { registerParentAccount } from "@/app/actions/auth"
import {
  EditorialError,
  EditorialField,
  EditorialFieldGroup,
  EditorialLabel,
} from "@/components/auth/editorial-field"
import { PasswordChecklist } from "@/components/auth/password-checklist"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const initialState: AuthMutationActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

const editorialInput =
  "h-12 rounded-none border-0 border-b border-border bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-0 focus-visible:ring-offset-0 aria-invalid:border-destructive"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-2 h-12 w-full rounded-none bg-primary px-6 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
    >
      {pending ? "Creating account…" : (
        <>
          Begin enrollment
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function ParentSignUpForm() {
  const [state, formAction] = useActionState(registerParentAccount, initialState)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.error ? (
        <AlertBanner tone="destructive" title="Could not create account" description={state.error} />
      ) : null}

      <EditorialFieldGroup>
        <div className="grid gap-6 sm:grid-cols-2">
          <EditorialField invalid={Boolean(state.fieldErrors.parentName)}>
            <EditorialLabel htmlFor="signup-parent-name">Your name</EditorialLabel>
            <Input
              id="signup-parent-name"
              name="parentName"
              placeholder="Olivia Harper"
              required
              className={cn(editorialInput)}
            />
            <EditorialError>{state.fieldErrors.parentName}</EditorialError>
          </EditorialField>

          <EditorialField invalid={Boolean(state.fieldErrors.familyName)}>
            <EditorialLabel htmlFor="signup-family-name">Family name</EditorialLabel>
            <Input
              id="signup-family-name"
              name="familyName"
              placeholder="Harper"
              required
              className={cn(editorialInput)}
            />
            <EditorialError>{state.fieldErrors.familyName}</EditorialError>
          </EditorialField>
        </div>

        <EditorialField invalid={Boolean(state.fieldErrors.email)}>
          <EditorialLabel htmlFor="signup-email">Email</EditorialLabel>
          <Input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className={cn(editorialInput)}
          />
          <EditorialError>{state.fieldErrors.email}</EditorialError>
        </EditorialField>

        <EditorialField invalid={Boolean(state.fieldErrors.phone)}>
          <EditorialLabel htmlFor="signup-phone">Phone</EditorialLabel>
          <Input
            id="signup-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(617) 555-0174"
            required
            className={cn(editorialInput)}
          />
          <EditorialError>{state.fieldErrors.phone}</EditorialError>
        </EditorialField>

        <div className="grid gap-6 sm:grid-cols-2">
          <EditorialField invalid={Boolean(state.fieldErrors.password)}>
            <EditorialLabel htmlFor="signup-password">Password</EditorialLabel>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={cn(editorialInput)}
            />
            <EditorialError>{state.fieldErrors.password}</EditorialError>
          </EditorialField>

          <EditorialField invalid={Boolean(state.fieldErrors.confirmPassword)}>
            <EditorialLabel htmlFor="signup-confirm-password">Confirm</EditorialLabel>
            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={cn(editorialInput)}
            />
            <EditorialError>{state.fieldErrors.confirmPassword}</EditorialError>
          </EditorialField>
        </div>

        <PasswordChecklist
          password={password}
          confirmPassword={confirmPassword}
        />

        <SubmitButton />
      </EditorialFieldGroup>
    </form>
  )
}
