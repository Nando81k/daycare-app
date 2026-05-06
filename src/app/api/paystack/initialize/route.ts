import { NextResponse } from "next/server"

import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buildAppUrl, isPaystackConfigured } from "@/lib/env"
import {
  buildInvoiceReference,
  initializeTransaction,
} from "@/lib/paystack"

/**
 * POST /api/paystack/initialize
 * Body: { invoiceId: string }
 *
 * Authenticated parent endpoint. Builds a Paystack hosted-checkout URL for
 * the given invoice and returns it. The browser then sets `location.assign`
 * to the URL.
 */
export async function POST(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured for this environment." },
      { status: 503 },
    )
  }

  const session = await getCurrentSession()
  if (!session || session.user.role !== "PARENT") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { invoiceId?: string }
  if (!body.invoiceId) {
    return NextResponse.json({ error: "Missing invoiceId." }, { status: 400 })
  }

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: { familyId: true },
  })
  if (!profile) {
    return NextResponse.json({ error: "Parent profile not found." }, { status: 403 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: body.invoiceId, familyId: profile.familyId },
    select: {
      id: true,
      amountCents: true,
      status: true,
      label: true,
      family: { select: { id: true, billingProfile: true } },
    },
  })
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
  }
  if (invoice.status === "PAID") {
    return NextResponse.json({ error: "Invoice is already paid." }, { status: 409 })
  }

  // Mint a fresh reference each time the parent clicks Pay so re-attempts
  // don't collide with the previous Paystack transaction.
  const reference = buildInvoiceReference(invoice.id)
  const callbackUrl = buildAppUrl(`/parent/billing/paystack-return?ref=${reference}`)

  const result = await initializeTransaction({
    email: session.user.email,
    // Paystack expects the smallest currency unit (kobo for NGN). Our amounts
    // are stored in kobo already (the column is named `amountCents` for
    // legacy reasons; values are NGN-kobo since the seed/admin path).
    amountKobo: invoice.amountCents,
    reference,
    callbackUrl,
    metadata: {
      invoiceId: invoice.id,
      familyId: invoice.family.id,
      label: invoice.label,
    },
  })

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      paystackReference: reference,
      paystackAccessCode: result.accessCode,
      status: invoice.status === "DRAFT" ? "OPEN" : invoice.status,
    },
  })

  return NextResponse.json({
    url: result.authorizationUrl,
    reference,
  })
}
