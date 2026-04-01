import { endOfMonth, format, startOfMonth } from "date-fns"

export function getMonthlyPeriod(date = new Date()) {
  const periodStart = startOfMonth(date)
  const periodEnd = endOfMonth(date)

  return {
    periodStart,
    periodEnd,
  }
}

export function calculateProratedMonthlyAmountCents({
  monthlyRateCents,
  startDate,
  periodStart,
  periodEnd,
}: {
  monthlyRateCents: number
  startDate: Date
  periodStart: Date
  periodEnd: Date
}) {
  const msPerDay = 1000 * 60 * 60 * 24
  const normalizedStart = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())
  )
  const normalizedPeriodStart = new Date(
    Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), periodStart.getUTCDate())
  )
  const normalizedPeriodEnd = new Date(
    Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth(), periodEnd.getUTCDate())
  )

  const effectiveStart =
    normalizedStart > normalizedPeriodStart ? normalizedStart : normalizedPeriodStart

  if (effectiveStart > normalizedPeriodEnd) {
    return 0
  }

  const totalDays =
    Math.floor((normalizedPeriodEnd.getTime() - normalizedPeriodStart.getTime()) / msPerDay) + 1
  const billableDays =
    Math.floor((normalizedPeriodEnd.getTime() - effectiveStart.getTime()) / msPerDay) + 1

  return Math.round(monthlyRateCents * (billableDays / totalDays))
}

export function calculateDepositCents({
  weeklyRateCents,
  depositWeeks,
}: {
  weeklyRateCents: number
  depositWeeks: number
}) {
  return weeklyRateCents * depositWeeks
}

export function buildInvoiceNumber({
  sequence,
  issueDate,
}: {
  sequence: number
  issueDate: Date
}) {
  return `INV-${format(issueDate, "yyyyMM")}-${String(sequence).padStart(4, "0")}`
}
