import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { getStripe } from "@/lib/stripe"

async function ensureCustomerForHousehold(householdId: string) {
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

export async function POST() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "PARENT" || !session.user.householdId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stripe = getStripe()
  const customerId = await ensureCustomerForHousehold(session.user.householdId)

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
    usage: "off_session",
    metadata: {
      householdId: session.user.householdId,
      userId: session.user.id,
    },
  })

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
    customerId,
  })
}
