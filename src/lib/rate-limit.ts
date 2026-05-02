import "server-only"

import { headers } from "next/headers"

/**
 * Lightweight in-memory rate limiter.
 *
 * Use as a baseline for /login/* and public-form endpoints. The store is a
 * Map keyed by a short scope + identifier, suitable for a single-instance
 * deployment. For multi-instance or multi-region deployments, swap the
 * `RateLimitStore` implementation for Upstash Redis or Vercel KV without
 * touching call sites.
 */

type Bucket = {
  /** Number of tokens currently available. */
  tokens: number
  /** Epoch ms when the bucket was last refilled. */
  updatedAt: number
}

interface RateLimitStore {
  get(key: string): Bucket | undefined
  set(key: string, value: Bucket): void
}

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, Bucket>()
  private maxEntries = 5000

  get(key: string) {
    return this.map.get(key)
  }

  set(key: string, value: Bucket) {
    // Soft cap to prevent unbounded growth.
    if (this.map.size >= this.maxEntries) {
      // Drop the oldest 10% of entries.
      const evictCount = Math.floor(this.maxEntries / 10)
      let i = 0
      for (const k of this.map.keys()) {
        if (i++ >= evictCount) break
        this.map.delete(k)
      }
    }
    this.map.set(key, value)
  }
}

// Global singleton — survives hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore__: RateLimitStore | undefined
}
const store: RateLimitStore =
  globalThis.__rateLimitStore__ ?? new InMemoryStore()
if (process.env.NODE_ENV !== "production") {
  globalThis.__rateLimitStore__ = store
}

export type RateLimitOptions = {
  /** Logical bucket name (e.g. "login", "waitlist", "contact"). */
  scope: string
  /** Max requests allowed within the window. */
  limit: number
  /** Window length in seconds. */
  windowSec: number
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  /** Seconds until the next refill (for friendly "try again in N seconds" copy). */
  retryAfterSec: number
}

/**
 * Identify a caller by their first forwarded IP, falling back to the user-agent
 * hash so requests without a public IP still get bucketed (instead of all
 * sharing the same anonymous bucket).
 */
async function getCallerIdentifier() {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || ""
  if (ip) return ip
  const ua = h.get("user-agent") ?? "anonymous"
  // Cheap deterministic hash so we don't write the full UA into the key.
  let hash = 0
  for (let i = 0; i < ua.length; i++) {
    hash = (hash * 31 + ua.charCodeAt(i)) | 0
  }
  return `ua:${hash}`
}

/**
 * Token-bucket consume. Returns `{ ok: false }` when the caller is over limit.
 * Use the `identifier` override (e.g. an email being attempted) on top of the
 * IP key for endpoints that should also throttle per-account, not just per-IP.
 */
export async function consumeRateLimit(
  options: RateLimitOptions,
  identifier?: string
): Promise<RateLimitResult> {
  const { scope, limit, windowSec } = options
  const caller = await getCallerIdentifier()
  const key = `${scope}:${caller}${identifier ? `:${identifier.toLowerCase()}` : ""}`
  const now = Date.now()
  const refillRate = limit / (windowSec * 1000) // tokens per ms
  const existing = store.get(key)

  const elapsed = existing ? now - existing.updatedAt : 0
  const refilled = existing
    ? Math.min(limit, existing.tokens + elapsed * refillRate)
    : limit

  if (refilled < 1) {
    const tokensNeeded = 1 - refilled
    const retryAfterMs = tokensNeeded / refillRate
    store.set(key, { tokens: refilled, updatedAt: now })
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  store.set(key, { tokens: refilled - 1, updatedAt: now })
  return {
    ok: true,
    remaining: Math.floor(refilled - 1),
    retryAfterSec: 0,
  }
}
