/**
 * Next.js instrumentation entry point.
 *
 * Loads the matching Sentry config for the runtime that's executing.
 * Both configs no-op when SENTRY_DSN is not set, so this file is safe to
 * commit and ship without keys.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config")
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config")
  }
}

// Re-export Sentry's request error capture when available. The export name
// has shifted between Sentry versions, so we resolve it dynamically and
// fall back to a no-op so this file never blocks the build.
import * as Sentry from "@sentry/nextjs"

type CaptureFn = (
  err: unknown,
  request: Request,
  context: {
    routerKind: "Pages Router" | "App Router"
    routePath: string
    routeType: "render" | "route" | "action" | "middleware"
  }
) => void

const sentryAny = Sentry as unknown as {
  captureRequestError?: CaptureFn
  onRequestError?: CaptureFn
}

export const onRequestError: CaptureFn =
  sentryAny.captureRequestError ?? sentryAny.onRequestError ?? (() => {})
