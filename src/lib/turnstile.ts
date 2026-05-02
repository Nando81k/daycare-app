import "server-only"

import { appEnv, isTurnstileConfigured } from "@/lib/env"

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export type TurnstileVerification = {
  ok: boolean
  /** Reason this verification failed (for debugging / logs). */
  reason?: string
}

/**
 * Verify a Cloudflare Turnstile token submitted from a public form.
 *
 * When Turnstile is not configured (no `TURNSTILE_SECRET_KEY`), this returns
 * `{ ok: true }` so dev environments aren't blocked. In production the env
 * vars MUST be set or every public submission will pass without a check —
 * so confirm `isTurnstileConfigured()` returns true on a deployed instance.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null
): Promise<TurnstileVerification> {
  if (!isTurnstileConfigured()) {
    return { ok: true, reason: "turnstile-disabled" }
  }
  if (!token) {
    return { ok: false, reason: "missing-token" }
  }

  try {
    const body = new URLSearchParams({
      secret: appEnv.turnstileSecretKey ?? "",
      response: token,
    })
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
    })
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] }
    if (json.success) return { ok: true }
    return {
      ok: false,
      reason: json["error-codes"]?.join(",") ?? "verification-failed",
    }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "fetch-failed",
    }
  }
}
