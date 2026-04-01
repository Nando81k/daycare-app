"use server"

import { endOfMonth, startOfMonth } from "date-fns"
import { revalidatePath } from "next/cache"

import {
  buildInvoiceNumber,
  calculateProratedMonthlyAmountCents,
} from "@/lib/billing-calculations"
import { db } from "@/lib/db"
import { requireCurrentUser, requireRole } from "@/lib/dal/auth"
import { getStripe } from "@/lib/stripe"
import {
  runBillingCycleSchema,
  setDefaultPaymentMethodSchema,
} from "@/lib/validators/billing"

export type BillingActionState = {
  error?: string
  success?: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : ""
}

function parseBillingMonth(value?: string) {
  if (!value) {
    return new Date()
  }

  const [year, month] = value.split("-").map(Number)
  return new Date(year, month - 1, 1)
}

async function ensureStripeCustomer(householdId: string) {
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

export async function setDefaultPaymentMethod(
  formData: FormData
): Promise<BillingActionState> {
  const actor = await requireCurrentUser()
  await requireRole("PARENT")

  if (!actor.householdId) {
    return { error: "Parent account is not linked to a household." }
  }

  const parsed = setDefaultPaymentMethodSchema.safeParse({
    paymentMethodId: asString(formData.get("paymentMethodId")),
  })

  if (!parsed.success) {
    return { error: "Invalid Stripe payment method ID." }
  }

  const stripe = getStripe()
  const customerId = await ensureStripeCustomer(actor.householdId)

  await stripe.paymentMethods.attach(parsed.data.paymentMethodId, {
    customer: customerId,
  })

  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: parsed.data.paymentMethodId,
    },
  })

  const paymentMethod = await stripe.paymentMethods.retrieve(parsed.data.paymentMethodId)
  const card = paymentMethod.type === "card" ? paymentMethod.card : null

  await db.$transaction(async (tx) => {
    await tx.paymentMethod.updateMany({
      where: {
        householdId: actor.householdId ?? "",
        isDefault: true,
      },
      data: { isDefault: false },
    })

    await tx.paymentMethod.upsert({
      where: { stripePaymentMethodId: parsed.data.paymentMethodId },
      create: {
        householdId: actor.householdId ?? "",
        createdByUserId: actor.id,
        stripePaymentMethodId: parsed.data.paymentMethodId,
        brand: card?.brand ?? null,
        last4: card?.last4 ?? null,
        expMonth: card?.exp_month ?? null,
        expYear: card?.exp_year ?? null,
        isDefault: true,
      },
      update: {
        createdByUserId: actor.id,
        brand: card?.brand ?? null,
        last4: card?.last4 ?? null,
        expMonth: card?.exp_month ?? null,
        expYear: card?.exp_year ?? null,
        isDefault: true,
      },
    })

    await tx.household.update({
      where: { id: actor.householdId ?? "" },
      data: {
        stripeCustomerId: customerId,
        autopayEnabled: true,
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: "PAYMENT_METHOD_SET_DEFAULT",
        entityType: "Household",
        entityId: actor.householdId ?? "",
        metadata: {
          paymentMethodId: parsed.data.paymentMethodId,
          brand: card?.brand ?? null,
          last4: card?.last4 ?? null,
        },
      },
    })
  })

  revalidatePath("/parent/billing")

  return { success: "Default payment method saved." }
}

export async function runMonthlyBillingCycle(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("ADMIN")

  const parsed = runBillingCycleSchema.safeParse({
    billingMonth: asString(formData.get("billingMonth")) || undefined,
  })

  if (!parsed.success) {
    throw new Error("Billing month is invalid.")
  }

  const monthDate = parseBillingMonth(parsed.data.billingMonth)
  const periodStart = startOfMonth(monthDate)
  const periodEnd = endOfMonth(monthDate)

  const enrollments = await db.enrollment.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    include: {
      child: true,
      household: true,
      tuitionPlan: true,
    },
  })

  if (!enrollments.length) {
    return
  }

  const grouped = new Map<string, typeof enrollments>()
  for (const enrollment of enrollments) {
    const list = grouped.get(enrollment.householdId) ?? []
    list.push(enrollment)
    grouped.set(enrollment.householdId, list)
  }

  let createdCount = 0

  for (const [householdId, householdEnrollments] of grouped.entries()) {
    const existing = await db.invoice.findFirst({
      where: {
        householdId,
        periodStart,
        periodEnd,
        isDeposit: false,
      },
    })

    if (existing) {
      continue
    }

    const lineItems = householdEnrollments.map((enrollment) => {
      const totalCents = calculateProratedMonthlyAmountCents({
        monthlyRateCents: enrollment.monthlyRateCents,
        startDate: enrollment.startDate,
        periodStart,
        periodEnd,
      })

      return {
        enrollmentId: enrollment.id,
        tuitionPlanId: enrollment.tuitionPlanId,
        description: `${enrollment.child.firstName} ${enrollment.child.lastName} tuition`,
        quantity: 1,
        unitAmountCents: totalCents,
        totalCents,
        serviceStartDate: periodStart,
        serviceEndDate: periodEnd,
      }
    })

    const subtotalCents = lineItems.reduce((sum, item) => sum + item.totalCents, 0)
    if (subtotalCents <= 0) {
      continue
    }

    const monthlyCount = await db.invoice.count({
      where: {
        issueDate: {
          gte: startOfMonth(monthDate),
          lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
        },
      },
    })

    const invoiceNumber = buildInvoiceNumber({
      sequence: monthlyCount + createdCount + 1,
      issueDate: monthDate,
    })

    const dueDate = new Date(periodStart)
    dueDate.setDate(dueDate.getDate() + 5)

    const invoice = await db.invoice.create({
      data: {
        householdId,
        createdByUserId: actor.id,
        invoiceNumber,
        status: "OPEN",
        issueDate: monthDate,
        dueDate,
        periodStart,
        periodEnd,
        subtotalCents,
        taxCents: 0,
        totalCents: subtotalCents,
        paidCents: 0,
        isDeposit: false,
      },
    })

    await db.invoiceLineItem.createMany({
      data: lineItems.map((item) => ({
        ...item,
        invoiceId: invoice.id,
      })),
    })

    const defaultMethod = await db.paymentMethod.findFirst({
      where: {
        householdId,
        isDefault: true,
      },
    })

    if (defaultMethod) {
      try {
        const customerId = await ensureStripeCustomer(householdId)
        const stripe = getStripe()

        const intent = await stripe.paymentIntents.create({
          amount: subtotalCents,
          currency: "usd",
          customer: customerId,
          payment_method: defaultMethod.stripePaymentMethodId,
          off_session: true,
          confirm: true,
          metadata: {
            invoiceId: invoice.id,
            householdId,
          },
        })

        const success = intent.status === "succeeded"

        await db.payment.create({
          data: {
            invoiceId: invoice.id,
            householdId,
            paymentMethodId: defaultMethod.id,
            createdByUserId: actor.id,
            amountCents: subtotalCents,
            status: success ? "SUCCEEDED" : "PENDING",
            stripePaymentIntentId: intent.id,
            paidAt: success ? new Date() : null,
          },
        })

        if (success) {
          await db.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PAID",
              paidCents: subtotalCents,
              stripePaymentIntentId: intent.id,
            },
          })
        } else {
          await db.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PROCESSING",
              stripePaymentIntentId: intent.id,
            },
          })
        }
      } catch (error) {
        await db.payment.create({
          data: {
            invoiceId: invoice.id,
            householdId,
            paymentMethodId: defaultMethod.id,
            createdByUserId: actor.id,
            amountCents: subtotalCents,
            status: "FAILED",
            failureReason: error instanceof Error ? error.message : "Autopay failed",
          },
        })
      }
    }

    createdCount += 1
  }

  await db.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: "MONTHLY_BILLING_RUN",
      entityType: "InvoiceBatch",
      entityId: `${periodStart.toISOString()}-${periodEnd.toISOString()}`,
      metadata: {
        createdCount,
      },
    },
  })

  revalidatePath("/admin/billing")
  revalidatePath("/admin/reports")
  revalidatePath("/parent/billing")
}
