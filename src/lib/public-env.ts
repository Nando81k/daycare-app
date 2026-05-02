/**
 * Browser-safe configuration. Only reads `NEXT_PUBLIC_*` env vars (which are
 * inlined at build time). Use this from client components instead of
 * importing `@/lib/env`, which is server-only.
 */
export const publicAppEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
}
