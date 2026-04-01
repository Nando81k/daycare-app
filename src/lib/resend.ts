import "server-only"

import { Resend } from "resend"

import { getOptionalEnv } from "@/lib/env"

let resendClient: Resend | null = null

export function getResend() {
  const apiKey = getOptionalEnv("RESEND_API_KEY")

  if (!apiKey) {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}
