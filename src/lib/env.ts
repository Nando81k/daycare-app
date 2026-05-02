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
  stripeCheckoutEnabled: readOptionalEnv("STRIPE_CHECKOUT_ENABLED") !== "false",
  /**
   * Comma-separated list of Stripe payment methods to allow on Checkout (e.g. "card,ng_card").
   * Defaults to undefined → Stripe Checkout decides automatically based on account eligibility.
   * Keep NG-specific methods like `ng_card` / `ng_bank_transfer` behind this opt-in flag because
   * not every Stripe account is enrolled in those previews.
   */
  stripeCheckoutPaymentMethods: readOptionalEnv("STRIPE_CHECKOUT_PAYMENT_METHODS"),
  /** Currency Stripe Checkout sessions and PaymentIntents are created in. */
  stripeCurrency: (readOptionalEnv("STRIPE_CURRENCY") ?? "ngn").toLowerCase(),
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

export function isStripeConfigured() {
  return Boolean(appEnv.stripeSecretKey && appEnv.stripePublishableKey)
}

export function isTurnstileConfigured() {
  return Boolean(appEnv.turnstileSiteKey && appEnv.turnstileSecretKey)
}

export function isStripeCheckoutEnabled() {
  return isStripeConfigured() && appEnv.stripeCheckoutEnabled
}

/**
 * Resolve the list of payment_method_types to allow on Checkout sessions.
 * Returns null when no override is set so Stripe can auto-resolve based on account eligibility.
 */
export function getEnabledCheckoutPaymentMethodTypes(): string[] | null {
  if (!appEnv.stripeCheckoutPaymentMethods) return null
  return appEnv.stripeCheckoutPaymentMethods
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
}
