import Stripe from "stripe"

import { db } from "@/lib/db"
import { getRequiredEnv } from "@/lib/env"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const stripe = getStripe()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 })
  }

  const body = await request.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getRequiredEnv("STRIPE_WEBHOOK_SECRET")
    )
  } catch (error) {
    return new Response(`Webhook Error: ${(error as Error).message}`, { status: 400 })
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object
      const payment = await db.payment.findFirst({
        where: { stripePaymentIntentId: intent.id },
      })

      if (payment && payment.status !== "SUCCEEDED") {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            failureReason: null,
            stripeChargeId:
              typeof intent.latest_charge === "string" ? intent.latest_charge : null,
          },
        })

        await db.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: "PAID",
            paidCents: payment.amountCents,
            stripePaymentIntentId: intent.id,
          },
        })
      } else if (!payment) {
        const invoiceId = intent.metadata?.invoiceId
        const householdId = intent.metadata?.householdId

        if (invoiceId && householdId) {
          const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
          })

          if (invoice) {
            const amountCents = Math.max(invoice.totalCents - invoice.paidCents, 0)

            await db.payment.create({
              data: {
                invoiceId,
                householdId,
                amountCents,
                status: "SUCCEEDED",
                stripePaymentIntentId: intent.id,
                stripeChargeId:
                  typeof intent.latest_charge === "string" ? intent.latest_charge : null,
                paidAt: new Date(),
              },
            })

            await db.invoice.update({
              where: { id: invoiceId },
              data: {
                status: "PAID",
                paidCents: invoice.totalCents,
                stripePaymentIntentId: intent.id,
              },
            })
          }
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object
      const payment = await db.payment.findFirst({
        where: { stripePaymentIntentId: intent.id },
      })

      if (payment && payment.status !== "FAILED") {
        await db.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            failureReason: intent.last_payment_error?.message ?? "Payment failed",
          },
        })

        await db.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: "OPEN",
          },
        })
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id
      if (paymentIntentId) {
        const payment = await db.payment.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
        })

        if (payment) {
          await db.payment.update({
            where: { id: payment.id },
            data: {
              status: "REFUNDED",
              stripeChargeId: charge.id,
            },
          })
          await db.invoice.update({
            where: { id: payment.invoiceId },
            data: {
              status: "PARTIALLY_PAID",
            },
          })
        }
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      }),
      { status: 500 }
    )
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
