"use client"

import { motion } from "motion/react"
import { CalendarDays, GraduationCap, ReceiptText, Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EnrollmentPricingOptions, TuitionQuote } from "@/lib/pricing"
import { resolveTuitionQuote } from "@/lib/pricing"

export type TuitionSummaryCardProps = {
  options: EnrollmentPricingOptions
  programSlug: string
  scheduleSlug: string
  preferredStartDate?: string
}

/**
 * Live tuition summary that updates as the parent picks program + schedule.
 * Shown as the wizard sidebar on the program/schedule step.
 */
export function TuitionSummaryCard({
  options,
  programSlug,
  scheduleSlug,
  preferredStartDate,
}: TuitionSummaryCardProps) {
  const quote = resolveTuitionQuote(options, { programSlug, scheduleSlug })

  return (
    <Card className="overflow-hidden border-emerald-100/70 bg-gradient-to-b from-white via-emerald-50/40 to-white shadow-md shadow-emerald-900/[.04]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <ReceiptText className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">
            Estimated tuition
          </span>
        </div>
        <CardTitle className="mt-2 text-base font-semibold text-slate-900">
          Pricing updates as you choose
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {quote ? (
          <ResolvedQuote quote={quote} preferredStartDate={preferredStartDate} />
        ) : (
          <EmptyQuote programSlug={programSlug} scheduleSlug={scheduleSlug} />
        )}

        <div className="rounded-xl border border-emerald-100 bg-white/80 p-3 text-xs leading-5 text-emerald-900/80">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>
              Final tuition is confirmed once your application is reviewed. A
              one-time registration fee is invoiced on approval.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ResolvedQuote({
  quote,
  preferredStartDate,
}: {
  quote: TuitionQuote
  preferredStartDate?: string
}) {
  return (
    <motion.div
      key={`${quote.programSlug}-${quote.scheduleSlug}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-4"
    >
      <div>
        <p className="text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {quote.amountFormatted}
        </p>
        <p className="text-sm text-slate-500">{quote.billingLabel}</p>
      </div>

      <div className="space-y-2 text-sm">
        <SummaryRow
          icon={GraduationCap}
          label="Program"
          value={quote.programName}
        />
        <SummaryRow icon={CalendarDays} label="Schedule" value={quote.scheduleName} />
        {preferredStartDate && (
          <SummaryRow
            icon={CalendarDays}
            label="Start date"
            value={preferredStartDate}
          />
        )}
      </div>
    </motion.div>
  )
}

function EmptyQuote({
  programSlug,
  scheduleSlug,
}: {
  programSlug: string
  scheduleSlug: string
}) {
  const message =
    !programSlug && !scheduleSlug
      ? "Choose a program and schedule to see tuition."
      : !programSlug
        ? "Choose a program to see tuition."
        : !scheduleSlug
          ? "Choose a schedule to see tuition."
          : "No active rate is set for this combination yet — our team will follow up."

  return (
    <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 p-4 text-sm text-slate-500">
      {message}
    </div>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  )
}
