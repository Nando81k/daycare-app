import "server-only"

import { generateSecret, generateURI, verifySync } from "otplib"
import qrcode from "qrcode"

const ISSUER = "Ambassadors Care"

export function generateTotpSecret() {
  return generateSecret()
}

export function buildOtpAuthUrl(email: string, secret: string) {
  return generateURI({
    strategy: "totp",
    issuer: ISSUER,
    label: email,
    secret,
    digits: 6,
    period: 30,
  })
}

export async function buildOtpAuthQrCodeDataUrl(email: string, secret: string) {
  const otpauth = buildOtpAuthUrl(email, secret)
  return qrcode.toDataURL(otpauth, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
  })
}

export function verifyTotpCode(token: string, secret: string) {
  const trimmed = token.replace(/\s+/g, "")
  if (!/^\d{6}$/.test(trimmed)) return false
  try {
    const result = verifySync({
      strategy: "totp",
      token: trimmed,
      secret,
      digits: 6,
      period: 30,
      counterTolerance: 1,
    })
    return result.valid === true
  } catch {
    return false
  }
}
