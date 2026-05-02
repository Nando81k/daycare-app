"use client"

import Image from "next/image"
import { useActionState, useState, useTransition } from "react"
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react"

import {
  confirmTwoFactorEnrollment,
  disableTwoFactor,
  startTwoFactorEnrollment,
  type TwoFactorEnrollmentResult,
} from "@/app/actions/two-factor"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialMutationState } from "@/lib/action-state"

type Props = {
  isEnabled: boolean
  hasPendingSecret: boolean
  enabledAtIso: string | null
}

function formatEnabledAt(iso: string | null) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export function AdminSecurityPage({ isEnabled, enabledAtIso }: Props) {
  const enabledAt = formatEnabledAt(enabledAtIso)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Security
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two-factor authentication adds a one-time code to your sign in. We strongly
          recommend it for every admin account.
        </p>
      </header>

      {isEnabled ? (
        <DisableTwoFactor enabledAt={enabledAt} />
      ) : (
        <EnableTwoFactor />
      )}
    </div>
  )
}

function EnableTwoFactor() {
  const [enrollment, setEnrollment] = useState<TwoFactorEnrollmentResult | null>(
    null
  )
  const [startError, setStartError] = useState<string | null>(null)
  const [isStarting, startTransition] = useTransition()

  const [confirmState, confirmAction, isConfirming] = useActionState(
    confirmTwoFactorEnrollment,
    initialMutationState
  )

  const handleStart = () => {
    setStartError(null)
    startTransition(async () => {
      const result = await startTwoFactorEnrollment()
      setEnrollment(result)
      if (!result.ok) {
        setStartError(result.error)
      }
    })
  }

  if (confirmState.success) {
    return (
      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Two-factor authentication enabled
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{confirmState.message}</p>
      </Card>
    )
  }

  return (
    <Card className="space-y-5 p-6">
      <div className="flex items-center gap-2">
        <ShieldOff className="h-5 w-5 text-amber-700" />
        <h2 className="text-lg font-semibold text-foreground">
          Two-factor is off
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Use Google Authenticator, 1Password, Authy, or any TOTP app. Once enabled,
        you&apos;ll enter a six-digit code right after your password on every sign in.
      </p>

      {!enrollment || !enrollment.ok ? (
        <>
          {startError ? (
            <AlertBanner tone="destructive" title="Couldn't start" description={startError} />
          ) : null}
          <Button onClick={handleStart} disabled={isStarting}>
            {isStarting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Begin enrollment
          </Button>
        </>
      ) : (
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex justify-center md:justify-start">
              <Image
                src={enrollment.qrCodeDataUrl}
                alt="Authenticator QR code"
                width={220}
                height={220}
                unoptimized
                className="rounded-md border border-border/50 bg-white"
              />
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Scan this QR code with your authenticator app. If you can&apos;t
                scan, enter this secret manually:
              </p>
              <code className="block break-all rounded-md bg-background px-3 py-2 text-xs">
                {enrollment.secret}
              </code>
              <p className="text-muted-foreground">
                Then enter the six-digit code shown by the app to confirm.
              </p>
            </div>
          </div>

          <form action={confirmAction} className="space-y-3">
            {confirmState.error ? (
              <AlertBanner
                tone="destructive"
                title="Couldn't enable"
                description={confirmState.error}
              />
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="totp-confirm-code">Authenticator code</Label>
              <Input
                id="totp-confirm-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="\d{6}"
                required
                className="tracking-[0.4em]"
              />
            </div>
            <Button type="submit" disabled={isConfirming}>
              {isConfirming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify and enable
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}

function DisableTwoFactor({ enabledAt }: { enabledAt: string | null }) {
  const [state, action, isPending] = useActionState(
    disableTwoFactor,
    initialMutationState
  )

  if (state.success) {
    return (
      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-amber-700">
          <ShieldOff className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Two-factor turned off
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </Card>
    )
  }

  return (
    <Card className="space-y-5 p-6">
      <div className="flex items-center gap-2 text-emerald-700">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="text-lg font-semibold text-foreground">
          Two-factor is on
        </h2>
      </div>
      {enabledAt ? (
        <p className="text-sm text-muted-foreground">Enabled {enabledAt}.</p>
      ) : null}

      <form action={action} className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Enter your password to turn off two-factor authentication.
        </p>
        {state.error ? (
          <AlertBanner
            tone="destructive"
            title="Couldn't disable"
            description={state.error}
          />
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="totp-disable-password">Password</Label>
          <Input
            id="totp-disable-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Turn off two-factor
        </Button>
      </form>
    </Card>
  )
}
