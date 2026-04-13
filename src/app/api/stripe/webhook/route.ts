import Stripe from "stripe"

import { syncPaymentIntent, syncSetupIntent } from "@/lib/billing"
import { appEnv } from "@/lib/env"
import { getStripeClient } from "@/lib/stripe"

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

  switch (event.type) {
    case "setup_intent.succeeded":
      await syncSetupIntent(event.data.object.id)
      break
    case "payment_intent.succeeded":
    case "payment_intent.processing":
    case "payment_intent.payment_failed":
      await syncPaymentIntent(event.data.object.id)
      break
    default:
      break
  }

  return Response.json({ received: true })
}

export async function GET() {
  return Response.json({
    ok: true,
    note: "Stripe webhook endpoint is active.",
  })
}
