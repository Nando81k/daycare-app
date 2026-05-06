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
  paystackReference: string | null
}

export type AdminFailedPaymentRow = {
  id: string
  familyName: string
  invoiceLabel: string
  amount: string
  attemptedAt: string
  failureReason: string | null
  paystackReference: string | null
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
        paystackReference: invoice.paystackReference,
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
    paystackReference: payment.paystackReference,
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

// ─── Tuition plans ───────────────────────────────────────────────────────

export type AdminTuitionPlanRow = {
  id: string
  familyId: string
  familyName: string
  childId: string
  childName: string
  programName: string
  scheduleName: string
  rateLabel: string
  rateCents: number
  startDate: string
  endDate: string | null
  invoiceDay: number
  dueDayOffset: number
  status: "ACTIVE" | "PAUSED" | "ENDED"
  note: string | null
  /** Cached count of invoices already generated for this plan. */
  invoiceCount: number
}

export type AdminTuitionFamilyOption = {
  id: string
  name: string
  children: Array<{ id: string; name: string }>
}

export type AdminProgramRateOption = {
  id: string
  programName: string
  scheduleName: string
  rateLabel: string
  rateCents: number
  billingLabel: string | null
}

export type AdminTuitionPlansData = {
  rows: AdminTuitionPlanRow[]
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
}

export async function getAdminTuitionPlansData(): Promise<AdminTuitionPlansData> {
  await requireRole("ADMIN")

  const [plans, families, programRates] = await Promise.all([
    prisma.tuitionPlan.findMany({
      orderBy: [{ status: "asc" }, { startDate: "desc" }],
      include: {
        family: { select: { familyName: true } },
        child: { select: { firstName: true, lastName: true } },
        programRate: {
          select: {
            rateCents: true,
            billingLabel: true,
            program: { select: { name: true } },
            schedule: { select: { name: true } },
          },
        },
        _count: { select: { invoices: true } },
      },
    }),
    prisma.family.findMany({
      orderBy: { familyName: "asc" },
      include: {
        children: {
          orderBy: { firstName: "asc" },
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
    prisma.programRate.findMany({
      where: { isActive: true },
      orderBy: [{ program: { sortOrder: "asc" } }, { schedule: { sortOrder: "asc" } }],
      include: {
        program: { select: { name: true } },
        schedule: { select: { name: true } },
      },
    }),
  ])

  const rows: AdminTuitionPlanRow[] = plans.map((plan) => ({
    id: plan.id,
    familyId: plan.familyId,
    familyName: plan.family.familyName,
    childId: plan.childId,
    childName: `${plan.child.firstName} ${plan.child.lastName}`.trim(),
    programName: plan.programRate.program.name,
    scheduleName: plan.programRate.schedule.name,
    rateLabel: formatCurrencyFromCents(plan.programRate.rateCents),
    rateCents: plan.programRate.rateCents,
    startDate: plan.startDate.toISOString().slice(0, 10),
    endDate: plan.endDate ? plan.endDate.toISOString().slice(0, 10) : null,
    invoiceDay: plan.invoiceDay,
    dueDayOffset: plan.dueDayOffset,
    status: plan.status,
    note: plan.note,
    invoiceCount: plan._count.invoices,
  }))

  const familyOptions: AdminTuitionFamilyOption[] = families.map((family) => ({
    id: family.id,
    name: family.familyName,
    children: family.children.map((child) => ({
      id: child.id,
      name: `${child.firstName} ${child.lastName}`.trim(),
    })),
  }))

  const rateOptions: AdminProgramRateOption[] = programRates.map((rate) => ({
    id: rate.id,
    programName: rate.program.name,
    scheduleName: rate.schedule.name,
    rateLabel: formatCurrencyFromCents(rate.rateCents),
    rateCents: rate.rateCents,
    billingLabel: rate.billingLabel,
  }))

  return { rows, families: familyOptions, programRates: rateOptions }
}

// ─── Reports ─────────────────────────────────────────────────────────────

export type AdminReportsKpis = {
  mtdRevenueCents: number
  mtdRevenueLabel: string
  ytdRevenueCents: number
  ytdRevenueLabel: string
  outstandingTotalCents: number
  outstandingTotalLabel: string
  outstandingFamilies: number
  projectedMrrCents: number
  projectedMrrLabel: string
  activePlansCount: number
  collectionRatePercent: number
  collectionRateLabel: string
  failedPaymentsCount: number
}

export type AdminReportsFamilyInvoice = {
  id: string
  label: string
  amount: string
  dueDate: string
  paidAt: string | null
  status: "paid" | "open" | "partially-paid" | "failed" | "refunded" | "void" | "draft"
  statusTone: StatusBadgeVariant
  daysPastDue: number
}

export type AdminReportsFamilyPayment = {
  id: string
  label: string
  amount: string
  paidAt: string
  channelLabel: string | null
  status: "succeeded" | "failed"
  failureReason: string | null
}

export type AdminReportsFamilyRow = {
  familyId: string
  familyName: string
  childrenCount: number
  activePlanCount: number
  mtdPaidCents: number
  mtdPaidLabel: string
  ytdPaidCents: number
  ytdPaidLabel: string
  lifetimePaidCents: number
  lifetimePaidLabel: string
  outstandingCents: number
  outstandingLabel: string
  /** Monthly recurring revenue from this family's active tuition plans. */
  monthlyPlanCents: number
  monthlyPlanLabel: string
  invoiceCount: number
  paidInvoiceCount: number
  failedPaymentCount: number
  lastPaymentAt: string | null
  hasFailedPayment: boolean
  /** Last 6 months of collected revenue, oldest first. */
  trend: AdminReportsRevenueMonth[]
  /** Per-family aging buckets. */
  aging: AdminReportsAgingBucket[]
  /** All invoices, newest first. */
  invoices: AdminReportsFamilyInvoice[]
  /** All payment attempts (succeeded + failed), newest first. */
  payments: AdminReportsFamilyPayment[]
}

export type AdminReportsAgingBucket = {
  key: "current" | "0-30" | "31-60" | "60+"
  label: string
  countInvoices: number
  amountCents: number
  amountLabel: string
}

export type AdminReportsRevenueMonth = {
  monthIso: string
  monthLabel: string
  amountCents: number
  amountLabel: string
}

export type AdminReportsRecentPayment = {
  id: string
  familyName: string
  invoiceLabel: string
  amount: string
  amountCents: number
  paidAt: string
  channelLabel: string | null
  status: "succeeded" | "failed"
}

export type AdminReportsData = {
  kpis: AdminReportsKpis
  familyRows: AdminReportsFamilyRow[]
  aging: AdminReportsAgingBucket[]
  revenueTrend: AdminReportsRevenueMonth[]
  recentPayments: AdminReportsRecentPayment[]
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1)
}

function diffDays(from: Date, to: Date) {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

export async function getAdminReportsData(): Promise<AdminReportsData> {
  await requireRole("ADMIN")

  const now = new Date()
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)
  const [families, recentPaymentRows, activePlans] = await Promise.all([
    prisma.family.findMany({
      orderBy: { familyName: "asc" },
      include: {
        invoices: {
          orderBy: { dueDate: "desc" },
          select: {
            id: true,
            label: true,
            status: true,
            amountCents: true,
            dueDate: true,
            paidAt: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
          select: {
            id: true,
            label: true,
            amountCents: true,
            paidAt: true,
            channelLabel: true,
            status: true,
            failureReason: true,
          },
        },
        children: { select: { id: true } },
        tuitionPlans: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            programRate: { select: { rateCents: true } },
          },
        },
        _count: { select: { payments: { where: { status: "FAILED" } } } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 10,
      where: { status: { in: ["PAID", "FAILED"] } },
      include: {
        family: { select: { familyName: true } },
        invoice: { select: { label: true } },
      },
    }),
    prisma.tuitionPlan.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        programRate: { select: { rateCents: true } },
      },
    }),
  ])

  // Build the 6-month bucket keys once.
  const trendKeys: Array<{ key: string; date: Date; label: string }> = []
  for (let i = 0; i < 6; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
    trendKeys.push({
      key,
      date: month,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(month),
    })
  }

  // Per-family rows
  const familyRows: AdminReportsFamilyRow[] = families.map((family) => {
    let mtdPaidCents = 0
    let ytdPaidCents = 0
    let lifetimePaidCents = 0
    let lastPaymentAt: Date | null = null

    const familyTrend = new Map<string, number>(
      trendKeys.map((entry) => [entry.key, 0])
    )

    for (const payment of family.payments) {
      if (payment.status !== "PAID") continue
      lifetimePaidCents += payment.amountCents
      if (payment.paidAt >= yearStart) ytdPaidCents += payment.amountCents
      if (payment.paidAt >= monthStart) mtdPaidCents += payment.amountCents
      if (!lastPaymentAt || payment.paidAt > lastPaymentAt) {
        lastPaymentAt = payment.paidAt
      }
      const key = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, "0")}`
      if (familyTrend.has(key)) {
        familyTrend.set(key, (familyTrend.get(key) ?? 0) + payment.amountCents)
      }
    }

    const outstandingCents = family.invoices
      .filter(
        (invoice) =>
          invoice.status === "OPEN" || invoice.status === "PARTIALLY_PAID"
      )
      .reduce((sum, invoice) => sum + invoice.amountCents, 0)

    const monthlyPlanCents = family.tuitionPlans.reduce(
      (sum, plan) => sum + plan.programRate.rateCents,
      0
    )

    const paidInvoiceCount = family.invoices.filter(
      (invoice) => invoice.status === "PAID"
    ).length

    const trend: AdminReportsRevenueMonth[] = trendKeys.map((entry) => {
      const cents = familyTrend.get(entry.key) ?? 0
      return {
        monthIso: entry.key,
        monthLabel: entry.label,
        amountCents: cents,
        amountLabel: formatCurrencyFromCents(cents),
      }
    })

    // Per-family aging buckets
    const familyBuckets: Record<
      AdminReportsAgingBucket["key"],
      { count: number; cents: number }
    > = {
      current: { count: 0, cents: 0 },
      "0-30": { count: 0, cents: 0 },
      "31-60": { count: 0, cents: 0 },
      "60+": { count: 0, cents: 0 },
    }
    for (const invoice of family.invoices) {
      if (invoice.status !== "OPEN" && invoice.status !== "PARTIALLY_PAID") {
        continue
      }
      const overdueDays = diffDays(invoice.dueDate, now)
      let key: AdminReportsAgingBucket["key"]
      if (overdueDays <= 0) key = "current"
      else if (overdueDays <= 30) key = "0-30"
      else if (overdueDays <= 60) key = "31-60"
      else key = "60+"
      familyBuckets[key].count += 1
      familyBuckets[key].cents += invoice.amountCents
    }
    const familyAging: AdminReportsAgingBucket[] = (
      [
        { key: "current", label: "Not yet due" },
        { key: "0-30", label: "1–30 days late" },
        { key: "31-60", label: "31–60 days late" },
        { key: "60+", label: "60+ days late" },
      ] as const
    ).map((entry) => {
      const { count, cents } = familyBuckets[entry.key]
      return {
        key: entry.key,
        label: entry.label,
        countInvoices: count,
        amountCents: cents,
        amountLabel: formatCurrencyFromCents(cents),
      }
    })

    const invoices: AdminReportsFamilyInvoice[] = family.invoices.map(
      (invoice) => {
        const mapped = mapInvoiceStatus(invoice.status)
        return {
          id: invoice.id,
          label: invoice.label,
          amount: formatCurrencyFromCents(invoice.amountCents),
          dueDate: formatMonthDay(invoice.dueDate),
          paidAt: invoice.paidAt ? formatMonthDay(invoice.paidAt) : null,
          status: mapped.status,
          statusTone: mapped.tone,
          daysPastDue:
            invoice.status === "OPEN" || invoice.status === "PARTIALLY_PAID"
              ? Math.max(0, diffDays(invoice.dueDate, now))
              : 0,
        }
      }
    )

    const payments: AdminReportsFamilyPayment[] = family.payments.map(
      (payment) => ({
        id: payment.id,
        label: payment.label,
        amount: formatCurrencyFromCents(payment.amountCents),
        paidAt: formatRelativeDateTime(payment.paidAt),
        channelLabel: payment.channelLabel,
        status: payment.status === "PAID" ? "succeeded" : "failed",
        failureReason: payment.failureReason,
      })
    )

    return {
      familyId: family.id,
      familyName: family.familyName,
      childrenCount: family.children.length,
      activePlanCount: family.tuitionPlans.length,
      mtdPaidCents,
      mtdPaidLabel: formatCurrencyFromCents(mtdPaidCents),
      ytdPaidCents,
      ytdPaidLabel: formatCurrencyFromCents(ytdPaidCents),
      lifetimePaidCents,
      lifetimePaidLabel: formatCurrencyFromCents(lifetimePaidCents),
      outstandingCents,
      outstandingLabel: formatCurrencyFromCents(outstandingCents),
      monthlyPlanCents,
      monthlyPlanLabel: formatCurrencyFromCents(monthlyPlanCents),
      invoiceCount: family.invoices.length,
      paidInvoiceCount,
      failedPaymentCount: family._count.payments,
      lastPaymentAt: lastPaymentAt
        ? formatRelativeDateTime(lastPaymentAt)
        : null,
      hasFailedPayment: family._count.payments > 0,
      trend,
      aging: familyAging,
      invoices,
      payments,
    }
  })

  familyRows.sort(
    (a, b) =>
      b.outstandingCents - a.outstandingCents ||
      b.ytdPaidCents - a.ytdPaidCents ||
      a.familyName.localeCompare(b.familyName)
  )

  // Aging buckets
  const buckets: Record<
    AdminReportsAgingBucket["key"],
    { count: number; cents: number }
  > = {
    current: { count: 0, cents: 0 },
    "0-30": { count: 0, cents: 0 },
    "31-60": { count: 0, cents: 0 },
    "60+": { count: 0, cents: 0 },
  }

  for (const family of families) {
    for (const invoice of family.invoices) {
      if (invoice.status !== "OPEN" && invoice.status !== "PARTIALLY_PAID") {
        continue
      }
      const overdueDays = diffDays(invoice.dueDate, now)
      let key: AdminReportsAgingBucket["key"]
      if (overdueDays <= 0) key = "current"
      else if (overdueDays <= 30) key = "0-30"
      else if (overdueDays <= 60) key = "31-60"
      else key = "60+"
      buckets[key].count += 1
      buckets[key].cents += invoice.amountCents
    }
  }

  const aging: AdminReportsAgingBucket[] = [
    { key: "current", label: "Not yet due" },
    { key: "0-30", label: "1–30 days late" },
    { key: "31-60", label: "31–60 days late" },
    { key: "60+", label: "60+ days late" },
  ].map((entry) => {
    const { count, cents } = buckets[entry.key as AdminReportsAgingBucket["key"]]
    return {
      key: entry.key as AdminReportsAgingBucket["key"],
      label: entry.label,
      countInvoices: count,
      amountCents: cents,
      amountLabel: formatCurrencyFromCents(cents),
    }
  })

  // Revenue trend — sum each family's monthly trend.
  const revenueTrend: AdminReportsRevenueMonth[] = trendKeys.map((entry) => {
    const cents = familyRows.reduce((sum, row) => {
      const month = row.trend.find((m) => m.monthIso === entry.key)
      return sum + (month?.amountCents ?? 0)
    }, 0)
    return {
      monthIso: entry.key,
      monthLabel: entry.label,
      amountCents: cents,
      amountLabel: formatCurrencyFromCents(cents),
    }
  })

  // KPIs
  const mtdRevenueCents = familyRows.reduce(
    (sum, row) => sum + row.mtdPaidCents,
    0
  )
  const ytdRevenueCents = familyRows.reduce(
    (sum, row) => sum + row.ytdPaidCents,
    0
  )
  const outstandingTotalCents = familyRows.reduce(
    (sum, row) => sum + row.outstandingCents,
    0
  )
  const outstandingFamilies = familyRows.filter(
    (row) => row.outstandingCents > 0
  ).length
  const projectedMrrCents = activePlans.reduce(
    (sum, plan) => sum + plan.programRate.rateCents,
    0
  )

  // Collection rate this month: paid invoices due this month vs total amount due this month
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  let billedThisMonthCents = 0
  let collectedThisMonthCents = 0
  for (const family of families) {
    for (const invoice of family.invoices) {
      if (invoice.dueDate < monthStart || invoice.dueDate >= monthEnd) continue
      if (invoice.status === "VOID" || invoice.status === "DRAFT") continue
      billedThisMonthCents += invoice.amountCents
      if (invoice.status === "PAID") {
        collectedThisMonthCents += invoice.amountCents
      }
    }
  }
  const collectionRatePercent =
    billedThisMonthCents > 0
      ? Math.round((collectedThisMonthCents / billedThisMonthCents) * 100)
      : 0

  const failedPaymentsCount = familyRows.filter(
    (row) => row.hasFailedPayment
  ).length

  const kpis: AdminReportsKpis = {
    mtdRevenueCents,
    mtdRevenueLabel: formatCurrencyFromCents(mtdRevenueCents),
    ytdRevenueCents,
    ytdRevenueLabel: formatCurrencyFromCents(ytdRevenueCents),
    outstandingTotalCents,
    outstandingTotalLabel: formatCurrencyFromCents(outstandingTotalCents),
    outstandingFamilies,
    projectedMrrCents,
    projectedMrrLabel: formatCurrencyFromCents(projectedMrrCents),
    activePlansCount: activePlans.length,
    collectionRatePercent,
    collectionRateLabel: `${collectionRatePercent}%`,
    failedPaymentsCount,
  }

  // Recent payments
  const recentPayments: AdminReportsRecentPayment[] = recentPaymentRows.map(
    (payment) => ({
      id: payment.id,
      familyName: payment.family.familyName,
      invoiceLabel: payment.invoice?.label ?? payment.label,
      amount: formatCurrencyFromCents(payment.amountCents),
      amountCents: payment.amountCents,
      paidAt: formatRelativeDateTime(payment.paidAt),
      channelLabel: payment.channelLabel,
      status: payment.status === "PAID" ? "succeeded" : "failed",
    })
  )

  return {
    kpis,
    familyRows,
    aging,
    revenueTrend,
    recentPayments,
  }
}
