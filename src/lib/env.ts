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
  stripeSecretKey: readOptionalEnv("STRIPE_SECRET_KEY"),
  stripePublishableKey: readOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripeWebhookSecret: readOptionalEnv("STRIPE_WEBHOOK_SECRET"),
  cronSecret: readOptionalEnv("CRON_SECRET") ?? (isProduction ? null : "local-cron-secret"),
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

export function isStripeConfigured() {
  return Boolean(appEnv.stripeSecretKey && appEnv.stripePublishableKey)
}
