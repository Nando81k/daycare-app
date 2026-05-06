import { NextResponse } from "next/server"

import { recordPaystackPayment } from "@/lib/paystack-record"
import { isValidWebhookSignature, verifyTransaction } from "@/lib/paystack"

/**
 * Paystack sends every transaction event here. We don't trust the body —
 * we re-verify by calling `transaction/verify` after confirming the HMAC
 * signature. Returns 200 quickly so Paystack doesn't retry-storm us.
 *
 * https://paystack.com/docs/payments/webhooks/
 */
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!isValidWebhookSignature(rawBody, signature)) {
    return new NextResponse("Invalid signature.", { status: 401 })
  }

  let event: { event?: string; data?: { reference?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new NextResponse("Invalid JSON.", { status: 400 })
  }

  // We only act on charge.success here; other events (charge.failed,
  // refund) can be added later as their flows ship.
  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ ok: true, ignored: event.event })
  }

  try {
    const verified = await verifyTransaction(event.data.reference)
    await recordPaystackPayment(verified)
    return NextResponse.json({ ok: true })
  } catch (error) {
    // Log + return 500 so Paystack retries. The verify call hitting their
    // own API is the safest re-source of truth.
    console.error("Paystack webhook verify failed", error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "verify failed" },
      { status: 500 },
    )
  }
}
