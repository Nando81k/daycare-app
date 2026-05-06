import "server-only"

import { prisma } from "@/lib/db"
import type { PaystackVerifyResponse } from "@/lib/paystack"

export type RecordResult = {
  invoiceId: string
  paymentId: string
  alreadyRecorded: boolean
}

/**
 * Idempotently materialise a verified Paystack transaction:
 *   - Find the Invoice by `paystackReference`
 *   - If the matching Payment row already exists, return early (idempotent)
 *   - Otherwise create a Payment, mark the Invoice PAID, and stash the
 *     reusable authorization on the family's billing profile for one-tap
 *     re-pay on future invoices.
 */
export async function recordPaystackPayment(
  verified: PaystackVerifyResponse,
): Promise<RecordResult | null> {
  if (verified.status !== "success") return null

  const invoice = await prisma.invoice.findUnique({
    where: { paystackReference: verified.reference },
    select: { id: true, familyId: true, status: true, amountCents: true },
  })
  if (!invoice) return null

  // Already-recorded path: webhook + verify route both call this; whichever
  // wins second should be a no-op.
  const existing = await prisma.payment.findUnique({
    where: { paystackReference: verified.reference },
    select: { id: true },
  })
  if (existing) {
    return {
      invoiceId: invoice.id,
      paymentId: existing.id,
      alreadyRecorded: true,
    }
  }

  const auth = verified.authorization
  const paidAt = verified.paidAt ? new Date(verified.paidAt) : new Date()
  const channelLabel = auth
    ? [auth.brand, auth.bank].filter(Boolean).join(" · ") || auth.cardType || verified.channel
    : verified.channel

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        familyId: invoice.familyId,
        invoiceId: invoice.id,
        label: `Paystack · ${verified.reference}`,
        amountCents: verified.amountKobo,
        method: verified.channel || "paystack",
        status: "PAID",
        paidAt,
        processedAt: new Date(),
        paystackReference: verified.reference,
        authorizationCode: auth?.reusable ? auth.authorizationCode : null,
        channelLabel,
        channelLast4: auth?.last4 ?? null,
      },
    })

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt,
      },
    })

    // Save a reusable authorization on the family billing profile so the
    // next invoice can use one-tap charge_authorization.
    if (auth?.reusable) {
      await tx.familyBillingProfile.upsert({
        where: { familyId: invoice.familyId },
        create: {
          familyId: invoice.familyId,
          paystackCustomerCode: verified.customerCode ?? null,
          paystackAuthorizationCode: auth.authorizationCode,
          defaultPaymentMethodBrand: auth.brand ?? auth.cardType ?? null,
          defaultPaymentMethodLast4: auth.last4 ?? null,
          defaultPaymentMethodLabel: channelLabel,
        },
        update: {
          paystackCustomerCode: verified.customerCode ?? undefined,
          paystackAuthorizationCode: auth.authorizationCode,
          defaultPaymentMethodBrand: auth.brand ?? auth.cardType ?? null,
          defaultPaymentMethodLast4: auth.last4 ?? null,
          defaultPaymentMethodLabel: channelLabel,
          lastPaymentError: null,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        action: "billing.payment.recorded",
        subjectType: "Invoice",
        subjectId: invoice.id,
        details: {
          paystackReference: verified.reference,
          amountKobo: verified.amountKobo,
          channel: verified.channel,
        },
      },
    })

    return payment
  })

  return {
    invoiceId: invoice.id,
    paymentId: result.id,
    alreadyRecorded: false,
  }
}
