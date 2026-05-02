import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enableLogs: false,
    // Send a friendly release tag if available; otherwise let Sentry infer.
    release: process.env.NEXT_PUBLIC_APP_URL,
  })
}
