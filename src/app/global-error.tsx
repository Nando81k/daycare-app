"use client"

import * as Sentry from "@sentry/nextjs"
import NextError from "next/error"
import { useEffect } from "react"

/**
 * Last-resort error boundary for App Router. Catches errors thrown from the
 * root layout itself (which `error.tsx` boundaries can't reach). Reports the
 * error to Sentry then renders Next's default error page.
 *
 * Required by the Sentry Next.js SDK skill — without it, root-layout failures
 * never reach Sentry.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
