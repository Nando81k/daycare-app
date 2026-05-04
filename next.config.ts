import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
}

export default withSentryConfig(nextConfig, {
  org: "athene-ea",
  project: "javascript-nextjs",

  // Source map upload — reads SENTRY_AUTH_TOKEN from CI env or
  // .env.sentry-build-plugin (gitignored). Without it, builds still succeed
  // but Sentry stack traces show minified line numbers.
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload a wider set of client source files so client-side stack frames
  // resolve back to readable source.
  widenClientFileUpload: true,

  // Proxy Sentry traffic through this app to bypass ad-blockers.
  tunnelRoute: "/monitoring",

  // Quiet plugin output unless we're in CI.
  silent: !process.env.CI,
})
