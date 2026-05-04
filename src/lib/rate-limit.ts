import "server-only"

import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

/**
 * Token-bucket rate limiter with two backends:
 *
 *   • In-memory (default for dev / single-instance) — keyed Map, soft-evicts
 *     when it grows past 5k entries.
 *   • Upstash Redis (production) — used automatically when both
 *     UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, so
 *     buckets stay shared across every Vercel function instance and the
 *     cap actually holds under horizontal scaling.
 *
 * Call sites use `consumeRateLimit({ scope, limit, windowSec }, identifier?)`
 * unchanged regardless of backend.
 */

type Bucket = {
  /** Tokens remaining. */
  tokens: number
  /** Epoch ms when the bucket was last refilled. */
  updatedAt: number
}

interface RateLimitStore {
  get(key: string): Promise<Bucket | undefined>
  set(key: string, value: Bucket, ttlSec: number): Promise<void>
}

class InMemoryStore implements RateLimitStore {
  private map = new Map<string, Bucket>()
  private maxEntries = 5000

  async get(key: string) {
    return this.map.get(key)
  }

  async set(key: string, value: Bucket) {
    if (this.map.size >= this.maxEntries) {
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

class RedisStore implements RateLimitStore {
  constructor(private readonly redis: Redis) {}

  async get(key: string) {
    const stored = await this.redis.get<Bucket>(`rl:${key}`)
    return stored ?? undefined
  }

  async set(key: string, value: Bucket, ttlSec: number) {
    // ex = seconds. Reset on every write so an idle key naturally expires.
    await this.redis.set(`rl:${key}`, value, { ex: Math.max(1, ttlSec) })
  }
}

function buildStore(): RateLimitStore {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (url && token) {
    return new RedisStore(new Redis({ url, token }))
  }
  return new InMemoryStore()
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore__: RateLimitStore | undefined
}
const store: RateLimitStore = globalThis.__rateLimitStore__ ?? buildStore()
if (process.env.NODE_ENV !== "production") {
  globalThis.__rateLimitStore__ = store
}

export function isPersistentRateLimitConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  )
}

export type RateLimitOptions = {
  scope: string
  limit: number
  windowSec: number
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

async function getCallerIdentifier() {
  const h = await headers()
  const forwarded = h.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || ""
  if (ip) return ip
  const ua = h.get("user-agent") ?? "anonymous"
  let hash = 0
  for (let i = 0; i < ua.length; i++) {
    hash = (hash * 31 + ua.charCodeAt(i)) | 0
  }
  return `ua:${hash}`
}

export async function consumeRateLimit(
  options: RateLimitOptions,
  identifier?: string,
): Promise<RateLimitResult> {
  const { scope, limit, windowSec } = options
  const caller = await getCallerIdentifier()
  const key = `${scope}:${caller}${identifier ? `:${identifier.toLowerCase()}` : ""}`
  const now = Date.now()
  const refillRate = limit / (windowSec * 1000) // tokens per ms
  const existing = await store.get(key)

  const elapsed = existing ? now - existing.updatedAt : 0
  const refilled = existing
    ? Math.min(limit, existing.tokens + elapsed * refillRate)
    : limit

  // TTL is the worst-case time to refill from empty back to full, plus a
  // small grace so the key doesn't disappear right as a user tries again.
  const ttlSec = Math.ceil(windowSec + 60)

  if (refilled < 1) {
    const tokensNeeded = 1 - refilled
    const retryAfterMs = tokensNeeded / refillRate
    await store.set(key, { tokens: refilled, updatedAt: now }, ttlSec)
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }

  await store.set(key, { tokens: refilled - 1, updatedAt: now }, ttlSec)
  return {
    ok: true,
    remaining: Math.floor(refilled - 1),
    retryAfterSec: 0,
  }
}
