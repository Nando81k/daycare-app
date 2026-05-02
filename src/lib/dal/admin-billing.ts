import "server-only"

import type { InvoiceStatus } from "@prisma/client"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  formatCurrencyFromCents,
  formatMonthDay,
  formatRelativeDateTime,
} from "@/lib/format"
import type { StatusBadgeVariant } from "@/types/app"

export type AdminInvoiceRow = {
  id: string
  label: string
  description: string | null
  amount: string
  amountCents: number
  dueDate: string
  paidAt: string | null
  status:
    | "draft"
    | "open"
    | "paid"
    | "partially-paid"
    | "failed"
    | "refunded"
    | "void"
  statusTone: StatusBadgeVariant
  familyId: string
  familyName: string
  stripePaymentIntentId: string | null
}

export type AdminFailedPaymentRow = {
  id: string
  familyName: string
  invoiceLabel: string
  amount: string
  attemptedAt: string
  failureReason: string | null
  stripePaymentIntentId: string | null
  receiptUrl: string | null
}

export type AdminBillingFamilyOption = {
  id: string
  name: string
  outstandingCents: number
  outstandingLabel: string
}

export type AdminBillingMetrics = {
  outstandingFamilies: number
  outstandingTotalCents: number
  outstandingTotal: string
  draftCount: number
  paidThisMonthCents: number
  paidThisMonth: string
  failedPaymentsCount: number
}

export type AdminBillingData = {
  metrics: AdminBillingMetrics
  invoices: AdminInvoiceRow[]
  failedPayments: AdminFailedPaymentRow[]
  families: AdminBillingFamilyOption[]
}

function mapInvoiceStatus(status: InvoiceStatus): {
  status: AdminInvoiceRow["status"]
  tone: StatusBadgeVariant
} {
  switch (status) {
    case "PAID":
      return { status: "paid", tone: "success" }
    case "OPEN":
      return { status: "open", tone: "warning" }
    case "PARTIALLY_PAID":
      return { status: "partially-paid", tone: "warning" }
    case "FAILED":
      return { status: "failed", tone: "destructive" }
    case "REFUNDED":
      return { status: "refunded", tone: "info" }
    case "VOID":
      return { status: "void", tone: "secondary" }
    case "DRAFT":
      return { status: "draft", tone: "secondary" }
  }
}

export async function getAdminBillingData(): Promise<AdminBillingData> {
  await requireRole("ADMIN")

  const [families, payments] = await Promise.all([
    prisma.family.findMany({
      orderBy: { familyName: "asc" },
      include: {
        invoices: { orderBy: { dueDate: "desc" } },
      },
    }),
    prisma.payment.findMany({
      where: { status: "FAILED" },
      orderBy: { processedAt: "desc" },
      take: 50,
      include: {
        family: { select: { familyName: true } },
        invoice: { select: { label: true } },
      },
    }),
  ])

  const invoices: AdminInvoiceRow[] = families.flatMap((family) =>
    family.invoices.map((invoice) => {
      const mapped = mapInvoiceStatus(invoice.status)
      return {
        id: invoice.id,
        label: invoice.label,
        description: invoice.description,
        amount: formatCurrencyFromCents(invoice.amountCents),
        amountCents: invoice.amountCents,
        dueDate: formatMonthDay(invoice.dueDate),
        paidAt: invoice.paidAt ? formatMonthDay(invoice.paidAt) : null,
        status: mapped.status,
        statusTone: mapped.tone,
        familyId: family.id,
        familyName: family.familyName,
        stripePaymentIntentId: invoice.stripePaymentIntentId,
      }
    })
  )

  const failedPayments: AdminFailedPaymentRow[] = payments.map((payment) => ({
    id: payment.id,
    familyName: payment.family.familyName,
    invoiceLabel: payment.invoice?.label ?? payment.label,
    amount: formatCurrencyFromCents(payment.amountCents),
    attemptedAt: formatRelativeDateTime(payment.processedAt ?? payment.createdAt),
    failureReason: payment.failureReason,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    receiptUrl: payment.receiptUrl,
  }))

  // Build family option list with their outstanding totals (DUE only).
  const familyOptions: AdminBillingFamilyOption[] = families
    .map((family) => {
      const outstandingCents = family.invoices
        .filter((invoice) => invoice.status === "OPEN")
        .reduce((sum, invoice) => sum + invoice.amountCents, 0)
      return {
        id: family.id,
        name: family.familyName,
        outstandingCents,
        outstandingLabel: formatCurrencyFromCents(outstandingCents),
      }
    })
    .sort(
      (a, b) =>
        b.outstandingCents - a.outstandingCents || a.name.localeCompare(b.name)
    )

  // Metrics
  const outstandingTotalCents = familyOptions.reduce(
    (sum, family) => sum + family.outstandingCents,
    0
  )
  const outstandingFamilies = familyOptions.filter(
    (family) => family.outstandingCents > 0
  ).length
  const draftCount = invoices.filter((row) => row.status === "draft").length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const paidThisMonthCents = families
    .flatMap((family) => family.invoices)
    .filter(
      (invoice) =>
        invoice.status === "PAID" &&
        invoice.paidAt &&
        invoice.paidAt >= monthStart
    )
    .reduce((sum, invoice) => sum + invoice.amountCents, 0)

  const metrics: AdminBillingMetrics = {
    outstandingFamilies,
    outstandingTotalCents,
    outstandingTotal: formatCurrencyFromCents(outstandingTotalCents),
    draftCount,
    paidThisMonthCents,
    paidThisMonth: formatCurrencyFromCents(paidThisMonthCents),
    failedPaymentsCount: failedPayments.length,
  }

  return {
    metrics,
    invoices,
    failedPayments,
    families: familyOptions,
  }
}
