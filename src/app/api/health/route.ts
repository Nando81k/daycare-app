import { prisma } from "@/lib/db"
import {
  isPaystackConfigured,
  isResendConfigured,
  isTurnstileConfigured,
} from "@/lib/env"
import { isPersistentRateLimitConfigured } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lightweight health probe for uptime monitors.
 *
 * Returns 200 + JSON when Postgres round-trips, 503 + JSON when it doesn't.
 * The `services` block reports which optional integrations are configured
 * (resend, paystack, turnstile, persistent rate-limit, sentry). It only
 * exposes the truthy/falsy state — no secrets.
 *
 * Intentionally cheap — a single `SELECT 1` so it can be hit every minute.
 */
export async function GET() {
  const startedAt = Date.now()
  let dbOk = false
  let dbError: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Unknown DB error"
  }

  const body = {
    status: dbOk ? "ok" : "error",
    timestamp: new Date().toISOString(),
    uptimeMs: Math.round(process.uptime() * 1000),
    db: dbOk
      ? { status: "ok", latencyMs: Date.now() - startedAt }
      : { status: "down", error: dbError },
    services: {
      resend: isResendConfigured(),
      paystack: isPaystackConfigured(),
      turnstile: isTurnstileConfigured(),
      rateLimit: isPersistentRateLimitConfigured() ? "persistent" : "in-memory",
      sentry: Boolean(process.env.SENTRY_DSN),
    },
  }

  return Response.json(body, {
    status: dbOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  })
}
