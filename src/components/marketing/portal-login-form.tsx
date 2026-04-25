"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ArrowRight } from "lucide-react"

import type { LoginActionState } from "@/app/actions/auth"
import { signInToPortal } from "@/app/actions/auth"
import {
  EditorialField,
  EditorialFieldGroup,
  EditorialLabel,
} from "@/components/auth/editorial-field"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const initialState: LoginActionState = {
  error: null,
}

const editorialInput =
  "h-12 rounded-none border-0 border-b border-border bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:ring-0 focus-visible:ring-offset-0"

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-2 h-12 w-full rounded-none bg-primary px-6 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
    >
      {pending ? "Signing in…" : (
        <>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function PortalLoginForm({ portalRole }: { portalRole: "parent" | "admin" }) {
  const [state, formAction] = useActionState(signInToPortal.bind(null, portalRole), initialState)
  const buttonLabel = portalRole === "admin" ? "Enter staff portal" : "Sign in"

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.error ? (
        <AlertBanner tone="destructive" title="Unable to sign in" description={state.error} />
      ) : null}

      <EditorialFieldGroup>
        <EditorialField>
          <EditorialLabel htmlFor={`${portalRole}-email`}>Email</EditorialLabel>
          <Input
            id={`${portalRole}-email`}
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={cn(editorialInput)}
          />
        </EditorialField>

        <EditorialField>
          <EditorialLabel
            htmlFor={`${portalRole}-password`}
            hint={
              <Link
                href="/reset-password"
                className="uppercase tracking-[0.18em] underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot?
              </Link>
            }
          >
            Password
          </EditorialLabel>
          <Input
            id={`${portalRole}-password`}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={cn(editorialInput)}
          />
        </EditorialField>

        <SubmitButton label={buttonLabel} />
      </EditorialFieldGroup>
    </form>
  )
}
