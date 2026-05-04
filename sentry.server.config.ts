/**
 * Node.js server runtime Sentry init. No-op when SENTRY_DSN is unset.
 *
 * Loaded by `instrumentation.ts` when NEXT_RUNTIME === "nodejs". Configured
 * per the Sentry Next.js SDK skill.
 */
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,

    sendDefaultPii: true,

    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Attach local variable values to stack frames — useful for debugging
    // server actions and API route failures.
    includeLocalVariables: true,

    enableLogs: true,
  })
}
