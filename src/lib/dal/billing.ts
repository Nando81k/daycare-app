import "server-only"

import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"
import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"

export async function getParentBillingSnapshot(householdId: string) {
  const invoices = await db.invoice.findMany({
    where: { householdId },
    orderBy: { dueDate: "desc" },
    take: 24,
  })

  const nextDraft = invoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.status !== "VOID")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]

  const paidTotal = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.totalCents, 0)

  const openBalance = invoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.status !== "VOID")
    .reduce((sum, invoice) => sum + Math.max(invoice.totalCents - invoice.paidCents, 0), 0)

  return {
    invoices,
    stats: {
      nextDraftAmountCents: nextDraft?.totalCents ?? 0,
      nextDraftDate: nextDraft?.dueDate ?? null,
      openBalanceCents: openBalance,
      paidTotalCents: paidTotal,
      invoiceCount: invoices.length,
    },
  }
}

export async function getAdminRevenueSnapshot() {
  const now = new Date()
  const sixMonths = Array.from({ length: 6 }).map((_, index) => {
    const date = subMonths(now, 5 - index)
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, "MMM"),
    }
  })

  const monthly = await Promise.all(
    sixMonths.map(async ({ start, end, label }) => {
      const records = await db.invoice.findMany({
        where: {
          issueDate: {
            gte: start,
            lte: end,
          },
        },
        select: {
          totalCents: true,
          paidCents: true,
          status: true,
        },
      })

      const collected = records.reduce((sum, row) => sum + row.paidCents, 0)
      const total = records.reduce((sum, row) => sum + row.totalCents, 0)
      return {
        month: label,
        collected: Math.round(collected / 100),
        outstanding: Math.max(Math.round((total - collected) / 100), 0),
      }
    })
  )

  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)

  const overview = await db.invoice.aggregate({
    where: {
      issueDate: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
    _sum: {
      totalCents: true,
      paidCents: true,
    },
    _count: {
      _all: true,
    },
  })

  const failedPayments = await db.payment.count({
    where: {
      status: "FAILED",
      createdAt: {
        gte: currentMonthStart,
        lte: currentMonthEnd,
      },
    },
  })

  return {
    monthly,
    overview: {
      invoiceCount: overview._count._all,
      totalCents: overview._sum.totalCents ?? 0,
      paidCents: overview._sum.paidCents ?? 0,
      failedPayments,
    },
  }
}

export async function getBillingRecordsTable() {
  const invoices = await db.invoice.findMany({
    orderBy: { dueDate: "desc" },
    include: {
      household: {
        select: {
          name: true,
        },
      },
    },
    take: 100,
  })

  return invoices.map((invoice) => ({
    id: invoice.id,
    family: invoice.household.name,
    amount: Math.round(invoice.totalCents / 100),
    method: invoice.stripePaymentIntentId ? "Stripe" : "Manual",
    status: invoice.status,
    dueDate: format(invoice.dueDate, "MMM d, yyyy"),
  }))
}

export async function listPaymentMethodsByHousehold(householdId: string) {
  return db.paymentMethod.findMany({
    where: { householdId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
}

export async function getNextInvoiceSequence(issueDate: Date) {
  const monthStart = startOfMonth(issueDate)
  const monthEnd = endOfMonth(issueDate)

  const existingCount = await db.invoice.count({
    where: {
      issueDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  })

  return existingCount + 1
}

export function formatInvoiceStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

export const invoiceSelection = Prisma.validator<Prisma.InvoiceSelect>()({
  id: true,
  invoiceNumber: true,
  dueDate: true,
  totalCents: true,
  paidCents: true,
  status: true,
  currency: true,
})
