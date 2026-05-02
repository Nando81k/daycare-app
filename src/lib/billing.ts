import { Prisma } from "@prisma/client"
import Stripe from "stripe"

import { prisma } from "@/lib/db"
import {
  appEnv,
  buildAppUrl,
  getEnabledCheckoutPaymentMethodTypes,
} from "@/lib/env"
import { formatStripePaymentMethodLabel, getStripeClient } from "@/lib/stripe"

function getCardDetails(paymentMethod: Stripe.PaymentMethod | null | undefined) {
  if (!paymentMethod || paymentMethod.type !== "card" || !paymentMethod.card) {
    return {
      brand: null,
      last4: null,
      label: null,
      paymentMethodId: paymentMethod?.id ?? null,
    }
  }

  return {
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    label: formatStripePaymentMethodLabel({
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
    }),
    paymentMethodId: paymentMethod.id,
  }
}

function canReusePaymentIntent(status: Stripe.PaymentIntent.Status) {
  return (
    status === "requires_payment_method" ||
    status === "requires_confirmation" ||
    status === "requires_action"
  )
}

function mapPaymentIntentStatus(status: Stripe.PaymentIntent.Status) {
  if (status === "succeeded") {
    return "PAID" as const
  }

  if (status === "processing") {
    return "PROCESSING" as const
  }

  return "FAILED" as const
}

function getReceiptUrl(latestCharge: string | Stripe.Charge | null | undefined) {
  if (!latestCharge || typeof latestCharge === "string") {
    return null
  }

  return latestCharge.receipt_url ?? null
}

function getPaymentTimestamp(
  paymentIntent: Stripe.PaymentIntent,
  latestCharge: string | Stripe.Charge | null | undefined
) {
  if (latestCharge && typeof latestCharge !== "string") {
    return new Date(latestCharge.created * 1000)
  }

  return new Date(paymentIntent.created * 1000)
}

async function ensureFamilyStripeCustomer(familyId: string) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const family = await prisma.family.findUnique({
    where: {
      id: familyId,
    },
    include: {
      billingProfile: true,
      parents: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!family) {
    throw new Error("Family billing profile could not be found.")
  }

  if (family.billingProfile?.stripeCustomerId) {
    return {
      stripe,
      customerId: family.billingProfile.stripeCustomerId,
      family,
    }
  }

  const primaryParent = family.parents[0]?.user
  const customer = await stripe.customers.create({
    email: primaryParent?.email ?? undefined,
    name: family.familyName,
    metadata: {
      familyId,
    },
  })

  await prisma.familyBillingProfile.upsert({
    where: {
      familyId,
    },
    update: {
      stripeCustomerId: customer.id,
    },
    create: {
      familyId,
      stripeCustomerId: customer.id,
    },
  })

  return {
    stripe,
    customerId: customer.id,
    family,
  }
}

export async function createFamilySetupIntent(familyId: string) {
  const { stripe, customerId } = await ensureFamilyStripeCustomer(familyId)

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    usage: "off_session",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      familyId,
    },
  })

  if (!setupIntent.client_secret) {
    throw new Error("Stripe did not return a setup client secret.")
  }

  return {
    id: setupIntent.id,
    clientSecret: setupIntent.client_secret,
  }
}

export async function syncSetupIntent(setupIntentId: string) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
    expand: ["payment_method"],
  })

  const familyId = setupIntent.metadata?.familyId

  if (!familyId || setupIntent.status !== "succeeded") {
    return null
  }

  const cardDetails = getCardDetails(setupIntent.payment_method as Stripe.PaymentMethod | null)

  await prisma.familyBillingProfile.upsert({
    where: {
      familyId,
    },
    update: {
      stripeCustomerId: typeof setupIntent.customer === "string" ? setupIntent.customer : null,
      defaultPaymentMethodId: cardDetails.paymentMethodId,
      defaultPaymentMethodBrand: cardDetails.brand,
      defaultPaymentMethodLast4: cardDetails.last4,
      defaultPaymentMethodLabel: cardDetails.label,
      lastPaymentError: null,
    },
    create: {
      familyId,
      stripeCustomerId: typeof setupIntent.customer === "string" ? setupIntent.customer : null,
      defaultPaymentMethodId: cardDetails.paymentMethodId,
      defaultPaymentMethodBrand: cardDetails.brand,
      defaultPaymentMethodLast4: cardDetails.last4,
      defaultPaymentMethodLabel: cardDetails.label,
    },
  })

  if (typeof setupIntent.customer === "string" && cardDetails.paymentMethodId) {
    await stripe.customers.update(setupIntent.customer, {
      invoice_settings: {
        default_payment_method: cardDetails.paymentMethodId,
      },
    })
  }

  return {
    familyId,
    paymentMethodLabel: cardDetails.label,
  }
}

export async function createInvoicePaymentIntent(invoiceId: string) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      family: {
        include: {
          billingProfile: true,
        },
      },
    },
  })

  if (!invoice || invoice.status !== "OPEN") {
    throw new Error("That invoice is not available for payment.")
  }

  if (invoice.stripePaymentIntentId) {
    try {
      const existingIntent = await stripe.paymentIntents.retrieve(invoice.stripePaymentIntentId)

      if (existingIntent.status === "succeeded") {
        await syncPaymentIntent(existingIntent.id)
        throw new Error("This invoice has already been paid.")
      }

      if (existingIntent.status === "processing") {
        throw new Error("This payment is already processing.")
      }

      if (existingIntent.client_secret && canReusePaymentIntent(existingIntent.status)) {
        return {
          id: existingIntent.id,
          clientSecret: existingIntent.client_secret,
        }
      }
    } catch (error) {
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError)) {
        throw error
      }
    }
  }

  const { customerId } = await ensureFamilyStripeCustomer(invoice.familyId)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: invoice.amountCents,
    currency: "ngn",
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      familyId: invoice.familyId,
      invoiceId: invoice.id,
      label: invoice.label,
    },
  })

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a payment client secret.")
  }

  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: {
      stripePaymentIntentId: paymentIntent.id,
    },
  })

  return {
    id: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  }
}

export async function syncPaymentIntent(paymentIntentId: string) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["payment_method", "latest_charge"],
  })
  const invoiceId = paymentIntent.metadata.invoiceId
  const familyId = paymentIntent.metadata.familyId

  if (!invoiceId || !familyId) {
    return null
  }

  const cardDetails = getCardDetails(paymentIntent.payment_method as Stripe.PaymentMethod | null)
  const latestCharge = paymentIntent.latest_charge as string | Stripe.Charge | null | undefined
  const paidAt = getPaymentTimestamp(paymentIntent, latestCharge)
  const mappedStatus = mapPaymentIntentStatus(paymentIntent.status)
  const receiptUrl = getReceiptUrl(latestCharge)

  await prisma.payment.upsert({
    where: {
      stripePaymentIntentId: paymentIntent.id,
    },
    update: {
      familyId,
      invoiceId,
      label: paymentIntent.metadata.label ?? "Invoice payment",
      amountCents: paymentIntent.amount,
      method: cardDetails.label ?? "Stripe payment method",
      status: mappedStatus,
      paidAt,
      processedAt: new Date(),
      stripePaymentMethodId: cardDetails.paymentMethodId,
      receiptUrl,
      failureReason: paymentIntent.last_payment_error?.message ?? null,
    },
    create: {
      familyId,
      invoiceId,
      label: paymentIntent.metadata.label ?? "Invoice payment",
      amountCents: paymentIntent.amount,
      method: cardDetails.label ?? "Stripe payment method",
      status: mappedStatus,
      paidAt,
      processedAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentMethodId: cardDetails.paymentMethodId,
      receiptUrl,
      failureReason: paymentIntent.last_payment_error?.message ?? null,
    },
  })

  if (paymentIntent.status === "succeeded") {
    await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      },
    })
  }

  if (cardDetails.paymentMethodId) {
    await prisma.familyBillingProfile.upsert({
      where: {
        familyId,
      },
      update: {
        defaultPaymentMethodId: cardDetails.paymentMethodId,
        defaultPaymentMethodBrand: cardDetails.brand,
        defaultPaymentMethodLast4: cardDetails.last4,
        defaultPaymentMethodLabel: cardDetails.label,
        lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
      },
      create: {
        familyId,
        defaultPaymentMethodId: cardDetails.paymentMethodId,
        defaultPaymentMethodBrand: cardDetails.brand,
        defaultPaymentMethodLast4: cardDetails.last4,
        defaultPaymentMethodLabel: cardDetails.label,
        lastPaymentError: paymentIntent.last_payment_error?.message ?? null,
      },
    })
  }

  return {
    familyId,
    invoiceId,
    status: paymentIntent.status,
  }
}

/* ------------------------------------------------------------------ */
/*  Stripe Checkout (hosted)                                          */
/* ------------------------------------------------------------------ */

const CHECKOUT_RETURN_PATH = "/parent/billing/checkout/return"
const CHECKOUT_CANCEL_PATH = "/parent/billing/checkout/cancel"


export type InvoiceCheckoutSession = {
  id: string
  url: string
}

/**
 * Create a hosted Stripe Checkout session for an invoice.
 * NGN, minor units, mode: payment. The PaymentIntent created underneath the
 * session carries the same `metadata.invoiceId` / `metadata.familyId` shape we
 * already use, so the existing `syncPaymentIntent` flow handles the result.
 */
export async function createCheckoutSessionForInvoice(
  invoiceId: string
): Promise<InvoiceCheckoutSession> {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      family: { include: { billingProfile: true } },
    },
  })

  if (!invoice) {
    throw new Error("That invoice could not be found.")
  }

  if (invoice.status === "PAID") {
    throw new Error("This invoice has already been paid.")
  }

  if (invoice.status !== "OPEN") {
    throw new Error("That invoice is not available for payment yet.")
  }

  const { customerId } = await ensureFamilyStripeCustomer(invoice.familyId)
  const paymentMethodTypes = getEnabledCheckoutPaymentMethodTypes()
  const successUrl = `${buildAppUrl(CHECKOUT_RETURN_PATH)}?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = buildAppUrl(`${CHECKOUT_CANCEL_PATH}?invoice_id=${invoice.id}`)

  const baseParams = {
    mode: "payment",
    customer: customerId,
    client_reference_id: invoice.id,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: appEnv.stripeCurrency,
          unit_amount: invoice.amountCents,
          product_data: {
            name: invoice.label,
            ...(invoice.description ? { description: invoice.description } : {}),
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: {
        familyId: invoice.familyId,
        invoiceId: invoice.id,
        label: invoice.label,
      },
    },
    metadata: {
      familyId: invoice.familyId,
      invoiceId: invoice.id,
    },
  } satisfies Parameters<typeof stripe.checkout.sessions.create>[0]

  const params = paymentMethodTypes
    ? ({
        ...baseParams,
        payment_method_types: paymentMethodTypes,
      } as Parameters<typeof stripe.checkout.sessions.create>[0])
    : baseParams

  const session = await stripe.checkout.sessions.create(params)

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.")
  }

  return { id: session.id, url: session.url }
}

/**
 * Webhook + return-page handler for completed Checkout sessions.
 * Pulls the underlying PaymentIntent and runs it through the existing sync
 * pipeline so Invoice + Payment + FamilyBillingProfile all stay consistent.
 */
export async function syncCheckoutSession(sessionId: string) {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  // Persist the session id on the invoice for traceability.
  if (session.client_reference_id) {
    try {
      await prisma.invoice.update({
        where: { id: session.client_reference_id },
        data: { stripeCheckoutSessionId: session.id },
      })
    } catch {
      // Invoice may already have been removed; non-fatal.
    }
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  if (!paymentIntentId) {
    return null
  }

  return syncPaymentIntent(paymentIntentId)
}

/* ------------------------------------------------------------------ */
/*  Refunds                                                            */
/* ------------------------------------------------------------------ */

export type RefundResult = {
  invoiceId: string
  refundId: string
  amountCents: number
}

/**
 * Refund an invoice's underlying PaymentIntent through Stripe and reflect the
 * change locally. Creates a negative Payment row, transitions the invoice to
 * REFUNDED, and writes an audit log.
 */
export async function refundInvoice(
  invoiceId: string,
  options?: { reason?: string; amountCents?: number; actorUserId?: string }
): Promise<RefundResult> {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: {
        where: { status: "PAID" },
        orderBy: { paidAt: "desc" },
        take: 1,
      },
    },
  })

  if (!invoice) {
    throw new Error("That invoice could not be found.")
  }

  if (invoice.status !== "PAID" && invoice.status !== "PARTIALLY_PAID") {
    throw new Error("Only paid invoices can be refunded.")
  }

  const successfulPayment = invoice.payments[0]
  const paymentIntentId =
    invoice.stripePaymentIntentId ?? successfulPayment?.stripePaymentIntentId

  if (!paymentIntentId) {
    throw new Error("No Stripe payment was found for this invoice.")
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(options?.amountCents ? { amount: options.amountCents } : {}),
    metadata: {
      invoiceId: invoice.id,
      familyId: invoice.familyId,
      reason: options?.reason ?? "",
    },
  })

  const refundedAmount = options?.amountCents ?? invoice.amountCents

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        familyId: invoice.familyId,
        invoiceId: invoice.id,
        label: `Refund · ${invoice.label}`,
        amountCents: -refundedAmount,
        method: successfulPayment?.method ?? "Stripe refund",
        status: "PAID",
        paidAt: new Date(),
        processedAt: new Date(),
        stripePaymentIntentId: null,
        stripePaymentMethodId: successfulPayment?.stripePaymentMethodId ?? null,
        receiptUrl: null,
        failureReason: null,
      },
    }),
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "REFUNDED" },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: options?.actorUserId ?? null,
        action: "billing.invoice.refund",
        subjectType: "Invoice",
        subjectId: invoice.id,
        details: {
          stripeRefundId: refund.id,
          amountCents: refundedAmount,
          reason: options?.reason ?? null,
        },
      },
    }),
  ])

  return { invoiceId: invoice.id, refundId: refund.id, amountCents: refundedAmount }
}

/* ------------------------------------------------------------------ */
/*  Subscription syncing (forward-compat seam)                          */
/* ------------------------------------------------------------------ */

export async function syncStripeSubscription(subscriptionId: string) {
  const stripe = getStripeClient()
  if (!stripe) return null

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const familyId =
    typeof subscription.metadata?.familyId === "string"
      ? subscription.metadata.familyId
      : null

  if (!familyId) return null

  // Stripe v22 typings expose `current_period_end` only on items[]; fall back to top-level if present.
  const periodEnd =
    subscription.items.data[0]?.current_period_end ?? null
  const productLabel =
    subscription.items.data[0]?.price?.nickname ??
    subscription.items.data[0]?.price?.id ??
    null
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id

  return prisma.stripeSubscriptionMapping.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      productLabel,
      stripeCustomerId,
      metadata: (subscription.metadata as Record<string, string> | null) ?? Prisma.JsonNull,
    },
    create: {
      familyId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      productLabel,
      stripeCustomerId,
      metadata: (subscription.metadata as Record<string, string> | null) ?? Prisma.JsonNull,
    },
  })
}

export async function deleteStripeSubscriptionMapping(subscriptionId: string) {
  return prisma.stripeSubscriptionMapping
    .delete({ where: { stripeSubscriptionId: subscriptionId } })
    .catch(() => null)
}
