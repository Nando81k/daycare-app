const isProduction = process.env.NODE_ENV === "production"

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : null
}

function readRequiredEnv(name: string, fallback?: string) {
  const value = readOptionalEnv(name)

  if (value) {
    return value
  }

  if (!isProduction && fallback) {
    return fallback
  }

  throw new Error(`Missing required environment variable: ${name}`)
}

export const appEnv = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,
  appUrl: readOptionalEnv("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  databaseUrl:
    readOptionalEnv("DATABASE_URL") ??
    "postgresql://nando@localhost:5433/daycare_app?schema=public",
  sessionSecret: readRequiredEnv("SESSION_SECRET", "abassadors-care-local-session-secret"),
  blobReadWriteToken: readOptionalEnv("BLOB_READ_WRITE_TOKEN"),
  resendApiKey: readOptionalEnv("RESEND_API_KEY"),
  resendFromEmail:
    readOptionalEnv("RESEND_FROM_EMAIL") ?? "Ambassadors Care <hello@ambassadorscare.local>",
  /** Paystack secret key (sk_test_... or sk_live_...). */
  paystackSecretKey: readOptionalEnv("PAYSTACK_SECRET_KEY"),
  /** Currency for Paystack transactions — kobo. */
  paystackCurrency: (readOptionalEnv("PAYSTACK_CURRENCY") ?? "NGN").toUpperCase(),
  /** Shared secret for the Vercel cron route. Required outside dev. */
  cronSecret: readOptionalEnv("CRON_SECRET"),
  /** Cloudflare Turnstile keys. When unset, public forms skip CAPTCHA. */
  turnstileSiteKey: readOptionalEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
  turnstileSecretKey: readOptionalEnv("TURNSTILE_SECRET_KEY"),
  /** Sentry DSN. When unset, Sentry is a no-op. */
  sentryDsn: readOptionalEnv("SENTRY_DSN"),
  publicSentryDsn: readOptionalEnv("NEXT_PUBLIC_SENTRY_DSN"),
}

export function buildAppUrl(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return new URL(path, appEnv.appUrl).toString()
}

export function assertFeatureEnv(name: string, value: string | null) {
  if (!value) {
    throw new Error(`${name} is not configured for this environment.`)
  }

  return value
}

export function isBlobConfigured() {
  return Boolean(appEnv.blobReadWriteToken)
}

export function isResendConfigured() {
  return Boolean(appEnv.resendApiKey)
}

export function isPaystackConfigured() {
  return Boolean(appEnv.paystackSecretKey)
}

export function isTurnstileConfigured() {
  return Boolean(appEnv.turnstileSiteKey && appEnv.turnstileSecretKey)
}
