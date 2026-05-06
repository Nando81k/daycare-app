import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"

import { appEnv, assertFeatureEnv } from "@/lib/env"

const PAYSTACK_BASE = "https://api.paystack.co"

function authHeaders() {
  const key = assertFeatureEnv("PAYSTACK_SECRET_KEY", appEnv.paystackSecretKey)
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  }
}

export type PaystackInitializeResponse = {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export type PaystackVerifyResponse = {
  status: "success" | "failed" | "abandoned" | "pending" | "reversed"
  reference: string
  amountKobo: number
  paidAt: string | null
  channel: string
  currency: string
  customerCode: string | null
  customerEmail: string
  authorization: PaystackAuthorization | null
  fees: number
  raw: Record<string, unknown>
}

export type PaystackAuthorization = {
  authorizationCode: string
  bin: string | null
  last4: string | null
  expMonth: string | null
  expYear: string | null
  channel: string | null
  cardType: string | null
  bank: string | null
  countryCode: string | null
  brand: string | null
  reusable: boolean
  signature: string | null
  accountName: string | null
}

/**
 * Initialize a Paystack transaction. Returns the hosted-checkout URL and a
 * unique reference that we persist on the Invoice for later verification.
 *
 * https://paystack.com/docs/api/transaction/#initialize
 */
export async function initializeTransaction(params: {
  email: string
  amountKobo: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
  channels?: Array<"card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer">
  authorizationCode?: string
}): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    cache: "no-store",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      channels: params.channels,
      authorization_code: params.authorizationCode,
      currency: appEnv.paystackCurrency,
    }),
  })
  const json = (await res.json()) as {
    status: boolean
    message: string
    data?: { authorization_url: string; access_code: string; reference: string }
  }
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack initialize failed")
  }
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  }
}

/**
 * Charge a saved authorization without sending the parent through the hosted
 * checkout (one-tap re-pay). Used when an Invoice's family already has a
 * reusable authorization on file.
 *
 * https://paystack.com/docs/api/transaction/#charge-authorization
 */
export async function chargeAuthorization(params: {
  email: string
  amountKobo: number
  authorizationCode: string
  reference?: string
  metadata?: Record<string, unknown>
}): Promise<PaystackVerifyResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/charge_authorization`, {
    method: "POST",
    headers: authHeaders(),
    cache: "no-store",
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      authorization_code: params.authorizationCode,
      reference: params.reference,
      metadata: params.metadata,
      currency: appEnv.paystackCurrency,
    }),
  })
  const json = await res.json()
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack charge_authorization failed")
  }
  return parseVerifyResponse(json.data as Record<string, unknown>)
}

/**
 * Server-side verification of a transaction. Always called before we mark an
 * Invoice as paid, even when the client returns from the hosted checkout —
 * the redirect alone is not authoritative.
 *
 * https://paystack.com/docs/api/transaction/#verify
 */
export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: authHeaders(),
    cache: "no-store",
  })
  const json = await res.json()
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message || "Paystack verify failed")
  }
  return parseVerifyResponse(json.data as Record<string, unknown>)
}

function parseVerifyResponse(data: Record<string, unknown>): PaystackVerifyResponse {
  const customer = (data.customer as Record<string, unknown> | undefined) ?? null
  const auth = (data.authorization as Record<string, unknown> | undefined) ?? null
  return {
    status: (data.status as PaystackVerifyResponse["status"]) ?? "pending",
    reference: String(data.reference ?? ""),
    amountKobo: Number(data.amount ?? 0),
    paidAt: data.paid_at ? String(data.paid_at) : null,
    channel: String(data.channel ?? ""),
    currency: String(data.currency ?? appEnv.paystackCurrency),
    customerCode: customer ? (customer.customer_code as string | null) ?? null : null,
    customerEmail: customer ? String(customer.email ?? "") : "",
    authorization: auth
      ? {
          authorizationCode: String(auth.authorization_code ?? ""),
          bin: (auth.bin as string | null) ?? null,
          last4: (auth.last4 as string | null) ?? null,
          expMonth: (auth.exp_month as string | null) ?? null,
          expYear: (auth.exp_year as string | null) ?? null,
          channel: (auth.channel as string | null) ?? null,
          cardType: (auth.card_type as string | null) ?? null,
          bank: (auth.bank as string | null) ?? null,
          countryCode: (auth.country_code as string | null) ?? null,
          brand: (auth.brand as string | null) ?? null,
          reusable: Boolean(auth.reusable),
          signature: (auth.signature as string | null) ?? null,
          accountName: (auth.account_name as string | null) ?? null,
        }
      : null,
    fees: Number(data.fees ?? 0),
    raw: data,
  }
}

/**
 * Validate a webhook payload by comparing the HMAC-SHA512 of the raw request
 * body against the `x-paystack-signature` header. Paystack signs every event
 * with the account's secret key.
 */
export function isValidWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader || !appEnv.paystackSecretKey) return false
  const expected = createHmac("sha512", appEnv.paystackSecretKey)
    .update(rawBody)
    .digest("hex")
  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(signatureHeader, "hex")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Build a unique invoice-tied reference. Paystack accepts arbitrary strings
 * but we prefix to make admin debugging easier.
 */
export function buildInvoiceReference(invoiceId: string) {
  const random = Math.random().toString(36).slice(2, 8)
  return `inv-${invoiceId}-${Date.now().toString(36)}-${random}`
}
