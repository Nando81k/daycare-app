// Sends a test event directly to Sentry's ingest endpoint via raw HTTP.
// Used to verify production wiring without spinning up a full Next.js context.

const dsn = "https://9dae7471a11470f496bab4cdaf1fe59e@o4511332621877248.ingest.us.sentry.io/4511332780146688"

const url = new URL(dsn)
const publicKey = url.username
const projectId = url.pathname.replace(/^\//, "")
const ingestHost = url.host
const endpoint = `https://${ingestHost}/api/${projectId}/store/`

const eventId = crypto.randomUUID().replace(/-/g, "")
const payload = {
  event_id: eventId,
  timestamp: new Date().toISOString(),
  platform: "javascript",
  level: "error",
  environment: "production",
  release: "smoke-test-2026-05-04",
  message: "Sentry smoke test from agent — production wiring check",
  exception: {
    values: [
      {
        type: "Error",
        value: "Sentry smoke test from agent — production wiring check",
      },
    ],
  },
}

const auth = [
  "Sentry sentry_version=7",
  `sentry_client=smoke-test/1.0`,
  `sentry_key=${publicKey}`,
].join(", ")

const res = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Sentry-Auth": auth,
  },
  body: JSON.stringify(payload),
})

const text = await res.text()
console.log("Status:", res.status)
console.log("Body:", text)
console.log("Event ID:", eventId)
