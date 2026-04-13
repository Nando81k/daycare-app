import { createHash, randomBytes } from "node:crypto"

export function createOpaqueToken(size = 32) {
  return randomBytes(size).toString("hex")
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function getFutureDate(hoursFromNow: number) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
}
