import "server-only"

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

import { appEnv } from "@/lib/env"

/**
 * Short-lived, signed proof that a user already passed the password (and
 * captcha) step of sign-in. The two-factor step submits only this token plus
 * the six-digit code, so the user doesn't re-type credentials and the
 * single-use captcha token isn't needed a second time.
 */

const CHALLENGE_TTL_MS = 5 * 60 * 1000

type Portal = "parent" | "admin"

function sign(payload: string) {
  return createHmac("sha256", appEnv.sessionSecret)
    .update(`2fa-challenge:${payload}`)
    .digest("base64url")
}

export function createTwoFactorChallenge(userId: string, portal: Portal) {
  const expiresAt = Date.now() + CHALLENGE_TTL_MS
  const nonce = randomBytes(8).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({ u: userId, p: portal, e: expiresAt, n: nonce })
  ).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function readTwoFactorChallenge(
  challenge: string,
  portal: Portal
): { userId: string } | null {
  const [payload, signature] = challenge.split(".")
  if (!payload || !signature) return null

  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      u?: unknown
      p?: unknown
      e?: unknown
    }
    if (typeof data.u !== "string" || data.p !== portal || typeof data.e !== "number") {
      return null
    }
    if (Date.now() > data.e) return null
    return { userId: data.u }
  } catch {
    return null
  }
}
