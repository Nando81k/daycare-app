/**
 * Browser-side Sentry init. No-op when NEXT_PUBLIC_SENTRY_DSN is unset.
 *
 * Lives at the project root so Next.js auto-loads it for client bundles
 * (Next 16 picks up `instrumentation-client.ts` automatically).
 *
 * Configured per the Sentry Next.js SDK skill:
 * https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md
 */
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,

    sendDefaultPii: true,

    // 100% trace sampling in dev, 10% in prod.
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

    // Session Replay: 10% of all sessions, 100% of sessions with errors.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    enableLogs: true,

    integrations: [Sentry.replayIntegration()],
  })
}

// Hook into App Router navigation transitions so client navigations land in
// the same trace as the server-rendered request that started them.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
