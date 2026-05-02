/**
 * Browser-side Sentry init. No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
 *
 * Lives at the project root so Next.js auto-loads it for client bundles
 * (Next 16 picks up `instrumentation-client.ts` automatically).
 */
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  })
}
