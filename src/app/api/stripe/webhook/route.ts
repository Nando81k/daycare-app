import { Prisma } from "@prisma/client"
import Stripe from "stripe"

import { syncPaymentIntent, syncSetupIntent } from "@/lib/billing"
import { prisma } from "@/lib/db"
import { sendDunningEmail } from "@/lib/email"
import { appEnv } from "@/lib/env"
import { getStripeClient } from "@/lib/stripe"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const stripe = getStripeClient()

  if (!stripe || !appEnv.stripeWebhookSecret) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 })
  }

  const body = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, appEnv.stripeWebhookSecret)
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Invalid webhook signature.",
      },
      { status: 400 }
    )
  }

  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        eventId: event.id,
        eventType: event.type,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ received: true, duplicate: true })
    }
    throw error
  }

  try {
    switch (event.type) {
      case "setup_intent.succeeded":
        await syncSetupIntent(event.data.object.id)
        break
      case "payment_intent.succeeded":
      case "payment_intent.processing":
        await syncPaymentIntent(event.data.object.id)
        break
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        await syncPaymentIntent(paymentIntent.id)
        const familyId = paymentIntent.metadata?.familyId
        const invoiceLabel = paymentIntent.metadata?.label ?? "your invoice"
        if (familyId) {
          await sendDunningEmail({
            familyId,
            amountCents: paymentIntent.amount,
            invoiceLabel,
            failureReason: paymentIntent.last_payment_error?.message ?? null,
          })
        }
        break
      }
      default:
        break
    }

    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: { processedAt: new Date() },
    })
  } catch (error) {
    await prisma.stripeWebhookEvent
      .delete({ where: { eventId: event.id } })
      .catch(() => null)
    throw error
  }

  return Response.json({ received: true })
}

export async function GET() {
  return Response.json({
    ok: true,
    note: "Stripe webhook endpoint is active.",
  })
}
