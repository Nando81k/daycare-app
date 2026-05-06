import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"
import { appEnv } from "@/lib/env"

/**
 * GET /api/cron/generate-tuition-invoices
 *
 * Vercel Cron hits this daily at 06:00 UTC (07:00 WAT). For every ACTIVE
 * TuitionPlan whose `invoiceDay` matches today's calendar day, we emit a
 * fresh Invoice for the upcoming month — but only if no invoice for this
 * (plan, year, month) already exists. Idempotent.
 *
 * Auth: Vercel Cron sets `Authorization: Bearer ${CRON_SECRET}` automatically
 * when CRON_SECRET is configured as an env var. We refuse without it.
 */
export async function GET(request: Request) {
  // Auth — accept Vercel cron bearer or our own CRON_SECRET fallback for
  // manual admin triggers.
  const authHeader = request.headers.get("authorization") ?? ""
  const expected = appEnv.cronSecret ? `Bearer ${appEnv.cronSecret}` : null
  if (expected && authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  if (!appEnv.cronSecret && appEnv.isProduction) {
    return new NextResponse("CRON_SECRET not configured", { status: 503 })
  }

  const now = new Date()
  const today = now.getUTCDate()
  const month = now.getUTCMonth() // 0-11
  const year = now.getUTCFullYear()

  // Plans due to invoice today that haven't ended yet.
  const plans = await prisma.tuitionPlan.findMany({
    where: {
      status: "ACTIVE",
      invoiceDay: today,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    include: {
      programRate: { select: { rateCents: true, billingLabel: true } },
      child: { select: { firstName: true } },
    },
  })

  let generated = 0
  let skipped = 0
  const errors: Array<{ planId: string; error: string }> = []

  for (const plan of plans) {
    try {
      // Compute the invoice's "billing month" label so duplicates are easy
      // to detect. Format: "Tuition · {Month YYYY} · {Child}".
      const monthName = new Date(year, month, 1).toLocaleString("en-US", {
        month: "long",
      })
      const label = `Tuition · ${monthName} ${year} · ${plan.child.firstName}`

      // Skip if we've already emitted this month's invoice for this plan.
      const existing = await prisma.invoice.findFirst({
        where: { tuitionPlanId: plan.id, label },
        select: { id: true },
      })
      if (existing) {
        skipped += 1
        continue
      }

      const dueDate = new Date(year, month, today + plan.dueDayOffset)

      await prisma.invoice.create({
        data: {
          familyId: plan.familyId,
          tuitionPlanId: plan.id,
          label,
          description: plan.programRate.billingLabel ?? "Monthly tuition",
          amountCents: plan.programRate.rateCents,
          dueDate,
          status: "OPEN",
        },
      })

      generated += 1
    } catch (error) {
      errors.push({
        planId: plan.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  await prisma.auditLog.create({
    data: {
      action: "cron.tuition.generate",
      subjectType: "TuitionPlan",
      subjectId: null,
      details: {
        date: now.toISOString(),
        plansEvaluated: plans.length,
        generated,
        skipped,
        errors,
      },
    },
  })

  return NextResponse.json({
    ok: true,
    date: now.toISOString(),
    plansEvaluated: plans.length,
    generated,
    skipped,
    errors,
  })
}
