import { NextResponse } from "next/server"

import { recordPaystackPayment } from "@/lib/paystack-record"
import { isPaystackConfigured } from "@/lib/env"
import { verifyTransaction } from "@/lib/paystack"

/**
 * GET /api/paystack/verify?reference=...
 *
 * Called by the parent's browser after the hosted checkout redirects back.
 * Idempotent: safe to call repeatedly. The webhook also calls
 * `recordPaystackPayment()` so this is the belt-and-suspenders path.
 */
export async function GET(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 503 },
    )
  }

  const url = new URL(request.url)
  const reference = url.searchParams.get("reference")?.trim()
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 })
  }

  try {
    const verified = await verifyTransaction(reference)
    const result = await recordPaystackPayment(verified)
    return NextResponse.json({
      status: verified.status,
      invoiceId: result?.invoiceId ?? null,
      message:
        verified.status === "success"
          ? "Payment verified."
          : `Payment status: ${verified.status}.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not verify payment.",
      },
      { status: 502 },
    )
  }
}
