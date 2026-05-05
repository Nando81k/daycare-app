"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

import { signStaffPolicy } from "@/app/actions/staff-onboarding"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { initialMutationState } from "@/lib/action-state"
import { STAFF_POLICY_KEYS, type StaffPolicyKey } from "@/lib/validators/staff-onboarding"
import type { StaffPolicySignature } from "@/lib/dal/staff-onboarding"
import { STAFF_POLICIES } from "@/components/staff/onboarding/staff-policy-content"

export function StepPolicies({
  acknowledgments,
}: {
  acknowledgments: Record<string, StaffPolicySignature | undefined>
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-7 text-muted-foreground">
        Read each policy and type your full name to acknowledge it. Your signature is
        recorded with a timestamp and stored on file.
      </p>
      {STAFF_POLICY_KEYS.map((key) => (
        <PolicyCard
          key={key}
          policyKey={key}
          existingSignature={acknowledgments[key]}
        />
      ))}
    </div>
  )
}

function PolicyCard({
  policyKey,
  existingSignature,
}: {
  policyKey: StaffPolicyKey
  existingSignature?: StaffPolicySignature
}) {
  const router = useRouter()
  const policy = STAFF_POLICIES[policyKey]
  const [state, formAction, isPending] = useActionState(
    signStaffPolicy,
    initialMutationState,
  )
  const [pendingName, setPendingName] = useState("")
  // Once the action has succeeded once, that result is durable for this
  // mount; combine with any existing signature loaded from the server.
  const signed = Boolean(existingSignature) || state.success
  const signatureSnapshot: StaffPolicySignature | null = existingSignature
    ? existingSignature
    : state.success
      ? {
          signedName: pendingName,
          signedAt: new Date().toISOString(),
          signedIp: null,
        }
      : null
  const refreshedRef = useRef(false)
  useEffect(() => {
    if (state.success && !refreshedRef.current) {
      refreshedRef.current = true
      router.refresh()
    }
  }, [state.success, router])

  return (
    <div className="rounded-2xl border border-border/65 bg-card p-5 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{policy.title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{policy.summary}</p>
        </div>
        {signed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" /> Signed
          </span>
        ) : null}
      </div>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
        {policy.body.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {signed && signatureSnapshot ? (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Signed by{" "}
          <strong className="text-foreground">{signatureSnapshot.signedName}</strong>
          {signatureSnapshot.signedAt
            ? ` on ${new Date(signatureSnapshot.signedAt).toLocaleString()}`
            : null}
          .
        </p>
      ) : (
        <form action={formAction} className="mt-5 flex flex-col gap-3">
          {state.error ? (
            <AlertBanner tone="destructive" title="Could not sign" description={state.error} />
          ) : null}
          <input type="hidden" name="policyKey" value={policyKey} />
          <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field invalid={Boolean(state.fieldErrors.signerName)}>
              <FieldLabel htmlFor={`${policyKey}-name`}>Type your full name</FieldLabel>
              <Input
                id={`${policyKey}-name`}
                name="signerName"
                placeholder="As it appears on your ID"
                aria-invalid={Boolean(state.fieldErrors.signerName)}
                required
                onChange={(event) => setPendingName(event.target.value)}
              />
              <FieldError>{state.fieldErrors.signerName}</FieldError>
            </Field>
            <label className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
              <input
                type="checkbox"
                name="acknowledged"
                value="on"
                required
                className="size-4 rounded border-border/70 text-primary"
              />
              I have read and understand this policy.
            </label>
          </FieldGroup>
          <FieldError>{state.fieldErrors.acknowledged}</FieldError>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
            >
              {isPending ? "Signing…" : `Sign ${policy.title.toLowerCase()}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
