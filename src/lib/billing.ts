import Stripe from "stripe"

import { prisma } from "@/lib/db"
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

  if (!invoice || invoice.status !== "DUE") {
    throw new Error("That invoice is not available for payment.")
  }

  const { customerId } = await ensureFamilyStripeCustomer(invoice.familyId)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: invoice.amountCents,
    currency: "usd",
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
    expand: ["payment_method"],
  })
  const invoiceId = paymentIntent.metadata.invoiceId
  const familyId = paymentIntent.metadata.familyId

  if (!invoiceId || !familyId) {
    return null
  }

  const cardDetails = getCardDetails(paymentIntent.payment_method as Stripe.PaymentMethod | null)

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
      status:
        paymentIntent.status === "succeeded"
          ? "PAID"
          : paymentIntent.status === "processing"
            ? "PROCESSING"
            : "FAILED",
      paidAt: new Date(paymentIntent.created * 1000),
      processedAt: new Date(),
      stripePaymentMethodId: cardDetails.paymentMethodId,
      receiptUrl: paymentIntent.latest_charge && typeof paymentIntent.latest_charge === "string"
        ? null
        : null,
      failureReason: paymentIntent.last_payment_error?.message ?? null,
    },
    create: {
      familyId,
      invoiceId,
      label: paymentIntent.metadata.label ?? "Invoice payment",
      amountCents: paymentIntent.amount,
      method: cardDetails.label ?? "Stripe payment method",
      status:
        paymentIntent.status === "succeeded"
          ? "PAID"
          : paymentIntent.status === "processing"
            ? "PROCESSING"
            : "FAILED",
      paidAt: new Date(paymentIntent.created * 1000),
      processedAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
      stripePaymentMethodId: cardDetails.paymentMethodId,
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

export async function runAutopaySweep() {
  const stripe = getStripeClient()

  if (!stripe) {
    throw new Error("Stripe is not configured for this environment.")
  }

  const dueInvoices = await prisma.invoice.findMany({
    where: {
      status: "DUE",
      family: {
        billingProfile: {
          autopayEnabled: true,
          defaultPaymentMethodId: {
            not: null,
          },
          stripeCustomerId: {
            not: null,
          },
        },
      },
    },
    include: {
      family: {
        include: {
          billingProfile: true,
        },
      },
    },
  })

  const results: Array<{ invoiceId: string; status: string }> = []

  for (const invoice of dueInvoices) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: invoice.amountCents,
        currency: "usd",
        customer: invoice.family.billingProfile?.stripeCustomerId ?? undefined,
        payment_method: invoice.family.billingProfile?.defaultPaymentMethodId ?? undefined,
        confirm: true,
        off_session: true,
        metadata: {
          familyId: invoice.familyId,
          invoiceId: invoice.id,
          label: invoice.label,
        },
      })

      await syncPaymentIntent(paymentIntent.id)
      results.push({
        invoiceId: invoice.id,
        status: paymentIntent.status,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Autopay failed."

      await prisma.familyBillingProfile.update({
        where: {
          familyId: invoice.familyId,
        },
        data: {
          lastPaymentError: message,
        },
      })

      await prisma.payment.create({
        data: {
          familyId: invoice.familyId,
          invoiceId: invoice.id,
          label: invoice.label,
          amountCents: invoice.amountCents,
          method: "Autopay on file",
          status: "FAILED",
          paidAt: new Date(),
          processedAt: new Date(),
          failureReason: message,
        },
      })

      results.push({
        invoiceId: invoice.id,
        status: "failed",
      })
    }
  }

  return results
}
