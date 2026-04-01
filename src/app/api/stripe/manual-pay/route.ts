import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getRequiredEnv } from "@/lib/env"
import { getStripe } from "@/lib/stripe"

async function ensureCustomer(householdId: string) {
  const household = await db.household.findUnique({
    where: { id: householdId },
  })

  if (!household) {
    throw new Error("Household not found.")
  }

  if (household.stripeCustomerId) {
    return household.stripeCustomerId
  }

  const stripe = getStripe()
  const customer = await stripe.customers.create({
    name: household.name,
    email: household.billingEmail ?? undefined,
    phone: household.phone ?? undefined,
    metadata: {
      householdId,
    },
  })

  await db.household.update({
    where: { id: householdId },
    data: {
      stripeCustomerId: customer.id,
    },
  })

  return customer.id
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PARENT" || !session.user.householdId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const formData = await request.formData()
  const invoiceId = String(formData.get("invoiceId") ?? "")

  const invoice = await db.invoice.findFirst({
    where: {
      id: invoiceId,
      householdId: session.user.householdId,
    },
  })

  if (!invoice) {
    return new Response("Invoice not found", { status: 404 })
  }

  const amountDue = Math.max(invoice.totalCents - invoice.paidCents, 0)
  if (amountDue <= 0) {
    redirect("/parent/billing")
  }

  const stripe = getStripe()
  const customerId = await ensureCustomer(session.user.householdId)
  const appUrl = getRequiredEnv("NEXT_PUBLIC_APP_URL")

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: "Manual payment fallback for parent billing.",
          },
          unit_amount: amountDue,
        },
      },
    ],
    payment_intent_data: {
      metadata: {
        invoiceId: invoice.id,
        householdId: invoice.householdId,
      },
    },
    success_url: `${appUrl}/parent/billing?paid=1`,
    cancel_url: `${appUrl}/parent/billing?canceled=1`,
  })

  if (!checkout.url) {
    return new Response("Failed to create checkout session", { status: 500 })
  }

  redirect(checkout.url)
}
