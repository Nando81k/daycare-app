import { formatCurrencyFromCents } from "@/lib/format"

export type ProgramOption = {
  id: string
  slug: string
  name: string
  ageRange: string | null
  description: string | null
}

export type ScheduleOption = {
  id: string
  slug: string
  name: string
  daysDescription: string | null
}

export type TuitionRate = {
  rateId: string
  rateCents: number
  billingLabel: string | null
}

export type TuitionQuote = {
  programId: string
  programSlug: string
  programName: string
  scheduleId: string
  scheduleSlug: string
  scheduleName: string
  rateCents: number
  amountFormatted: string
  billingLabel: string
}

export type EnrollmentPricingOptions = {
  programs: ProgramOption[]
  schedules: ScheduleOption[]
  /** Lookup table indexed by program slug → schedule slug → rate. */
  ratesBySlug: Record<string, Record<string, TuitionRate>>
}

export const DEFAULT_BILLING_LABEL = "per month"

/**
 * Resolve a tuition quote from a preloaded options bundle.
 * Pure — safe to import from client components.
 * Returns null if the program/schedule pair has no active rate.
 */
export function resolveTuitionQuote(
  options: EnrollmentPricingOptions,
  params: { programSlug: string; scheduleSlug: string }
): TuitionQuote | null {
  const { programSlug, scheduleSlug } = params

  if (!programSlug || !scheduleSlug) return null

  const program = options.programs.find((p) => p.slug === programSlug)
  const schedule = options.schedules.find((s) => s.slug === scheduleSlug)
  const rate = options.ratesBySlug[programSlug]?.[scheduleSlug]

  if (!program || !schedule || !rate) return null

  return {
    programId: program.id,
    programSlug: program.slug,
    programName: program.name,
    scheduleId: schedule.id,
    scheduleSlug: schedule.slug,
    scheduleName: schedule.name,
    rateCents: rate.rateCents,
    amountFormatted: formatCurrencyFromCents(rate.rateCents),
    billingLabel: rate.billingLabel ?? DEFAULT_BILLING_LABEL,
  }
}
