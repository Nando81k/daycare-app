import Stripe from "stripe"

import {
  deleteStripeSubscriptionMapping,
  syncCheckoutSession,
  syncPaymentIntent,
  syncSetupIntent,
  syncStripeSubscription,
} from "@/lib/billing"
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

  switch (event.type) {
    case "setup_intent.succeeded":
      await syncSetupIntent(event.data.object.id)
      break
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
      await syncCheckoutSession(event.data.object.id)
      break
    case "payment_intent.succeeded":
    case "payment_intent.processing":
    case "payment_intent.payment_failed":
      await syncPaymentIntent(event.data.object.id)
      break
    case "invoice.paid":
    case "invoice.payment_failed":
      // Forward-compat for Stripe Subscription invoices. We don't currently
      // create Stripe-managed invoices ourselves, so this is a logging no-op
      // until subscriptions ship; the handler is here so events don't 4xx.
      console.info(`[stripe-webhook] received ${event.type}`)
      break
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await syncStripeSubscription(event.data.object.id)
      break
    case "customer.subscription.deleted":
      await deleteStripeSubscriptionMapping(event.data.object.id)
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
