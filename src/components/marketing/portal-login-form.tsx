"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import type { LoginActionState } from "@/app/actions/auth"
import { signInToPortal } from "@/app/actions/auth"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: LoginActionState = {
  error: null,
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Login"}
    </Button>
  )
}

export function PortalLoginForm({ portalRole }: { portalRole: "parent" | "admin" }) {
  const [state, formAction] = useActionState(signInToPortal.bind(null, portalRole), initialState)

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error ? (
        <AlertBanner tone="destructive" title="Unable to sign in" description={state.error} />
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${portalRole}-email`}>Email</FieldLabel>
          <Input
            id={`${portalRole}-email`}
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor={`${portalRole}-password`}>Password</FieldLabel>
            <Link
              href="/reset-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id={`${portalRole}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field>
          <SubmitButton />
        </Field>

        {portalRole === "parent" ? (
          <Field>
            <FieldDescription className="text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup/parent" className="underline underline-offset-4">
                Sign up
              </Link>
            </FieldDescription>
          </Field>
        ) : null}
      </FieldGroup>
    </form>
  )
}
