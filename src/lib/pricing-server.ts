import "server-only"

import { prisma } from "@/lib/db"
import { formatCurrencyFromCents } from "@/lib/format"

import {
  DEFAULT_BILLING_LABEL,
  type EnrollmentPricingOptions,
  type TuitionQuote,
} from "@/lib/pricing"

export {
  resolveTuitionQuote,
  type EnrollmentPricingOptions,
  type ProgramOption,
  type ScheduleOption,
  type TuitionRate,
  type TuitionQuote,
} from "@/lib/pricing"

/**
 * Server-side fetch of all active programs, schedules, and rates as a
 * lookup table the wizard can use for live tuition pricing.
 */
export async function getEnrollmentPricingOptions(): Promise<EnrollmentPricingOptions> {
  const [programs, schedules, rates] = await Promise.all([
    prisma.program.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.schedule.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.programRate.findMany({
      where: { isActive: true },
      include: {
        program: { select: { slug: true } },
        schedule: { select: { slug: true } },
      },
    }),
  ])

  const ratesBySlug: Record<string, Record<string, EnrollmentPricingOptions["ratesBySlug"][string][string]>> = {}

  for (const rate of rates) {
    const programSlug = rate.program.slug
    const scheduleSlug = rate.schedule.slug
    ratesBySlug[programSlug] ??= {}
    ratesBySlug[programSlug][scheduleSlug] = {
      rateId: rate.id,
      rateCents: rate.rateCents,
      billingLabel: rate.billingLabel,
    }
  }

  return {
    programs: programs.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      ageRange: p.ageRange,
      description: p.description,
    })),
    schedules: schedules.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      daysDescription: s.daysDescription,
    })),
    ratesBySlug,
  }
}

/**
 * Direct DB lookup variant — for server-side flows (invoice creation, etc.)
 * that don't already have an options bundle in hand.
 */
export async function getTuitionQuote(params: {
  programSlug?: string | null
  scheduleSlug?: string | null
  programId?: string | null
  scheduleId?: string | null
}): Promise<TuitionQuote | null> {
  const where = (() => {
    if (params.programId && params.scheduleId) {
      return { programId: params.programId, scheduleId: params.scheduleId }
    }
    if (params.programSlug && params.scheduleSlug) {
      return {
        program: { slug: params.programSlug },
        schedule: { slug: params.scheduleSlug },
      }
    }
    return null
  })()

  if (!where) return null

  const rate = await prisma.programRate.findFirst({
    where: { ...where, isActive: true },
    include: {
      program: { select: { id: true, slug: true, name: true } },
      schedule: { select: { id: true, slug: true, name: true } },
    },
  })

  if (!rate) return null

  return {
    programId: rate.program.id,
    programSlug: rate.program.slug,
    programName: rate.program.name,
    scheduleId: rate.schedule.id,
    scheduleSlug: rate.schedule.slug,
    scheduleName: rate.schedule.name,
    rateCents: rate.rateCents,
    amountFormatted: formatCurrencyFromCents(rate.rateCents),
    billingLabel: rate.billingLabel ?? DEFAULT_BILLING_LABEL,
  }
}
