"use client"

import { BadgeCheck, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { EnrollmentPricingOptions } from "@/lib/pricing"
import { resolveTuitionQuote } from "@/lib/pricing"
import type { ParentEnrollmentApplicationDraft } from "@/types/app"
import { combineChildName } from "@/lib/parent-enrollment"

export type ReviewStepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
  options: EnrollmentPricingOptions
  onJumpToStep: (step: number) => void
}

const STEP_INDEX = {
  child: 1,
  guardian: 2,
  programSchedule: 3,
  health: 4,
} as const

export function ReviewStep({
  draft,
  onChange,
  options,
  onJumpToStep,
}: ReviewStepProps) {
  const childName = combineChildName(draft.childFirstName, draft.childLastName) || "—"
  const quote = resolveTuitionQuote(options, {
    programSlug: draft.programInterest,
    scheduleSlug: draft.scheduleNeed,
  })

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white">
        <CardContent className="space-y-5 p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Application summary
              </p>
              <h3 className="mt-1.5 text-xl font-semibold text-slate-900">
                Review everything before you submit
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                You can jump back to any section to make changes — your draft is
                always saved.
              </p>
            </div>
            <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:flex">
              <BadgeCheck className="h-5 w-5" />
            </span>
          </header>

          <Separator />

          <SectionRow
            title="Child"
            onEdit={() => onJumpToStep(STEP_INDEX.child)}
            rows={[
              ["Name", childName],
              ["Date of birth", draft.dateOfBirth || "—"],
              ["Gender", formatLabel(draft.childAgeLabel) || "—"],
              ["Primary language", draft.primaryLanguage || "—"],
            ]}
          />

          <SectionRow
            title="Guardian"
            onEdit={() => onJumpToStep(STEP_INDEX.guardian)}
            rows={[
              ["Name", draft.parentName || "—"],
              ["Relationship", formatLabel(draft.relationshipToChild) || "—"],
              ["Email", draft.email || "—"],
              ["Phone", draft.phone || "—"],
              ["Home address", draft.homeAddress || "—"],
              [
                "Emergency contact",
                draft.emergencyContactName
                  ? `${draft.emergencyContactName}${
                      draft.emergencyContactPhone
                        ? ` · ${draft.emergencyContactPhone}`
                        : ""
                    }`
                  : "—",
              ],
            ]}
          />

          <SectionRow
            title="Program & schedule"
            onEdit={() => onJumpToStep(STEP_INDEX.programSchedule)}
            rows={[
              ["Program", quote?.programName || "—"],
              ["Schedule", quote?.scheduleName || "—"],
              ["Start date", draft.preferredStartDate || "—"],
              [
                "Estimated tuition",
                quote ? `${quote.amountFormatted} · ${quote.billingLabel}` : "—",
              ],
            ]}
          />

          <SectionRow
            title="Health & safety"
            onEdit={() => onJumpToStep(STEP_INDEX.health)}
            rows={[
              ["Pediatrician", draft.pediatricianName || "—"],
              ["Pediatrician phone", draft.pediatricianPhone || "—"],
              ["Health notes", draft.healthNotes || "—"],
            ]}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Final agreements
        </p>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.accepted}
            onCheckedChange={(c) => onChange({ accepted: c === true })}
          />
          <span>
            I certify that the information provided is true and accurate to the
            best of my knowledge.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.healthChecklist.authorizedPickups}
            onCheckedChange={(c) =>
              onChange({
                healthChecklist: {
                  ...draft.healthChecklist,
                  authorizedPickups: c === true,
                },
              })
            }
          />
          <span>
            I have read and agree to the daycare&apos;s policies, including
            pickup authorization, health protocols, and tuition terms.
          </span>
        </label>
      </div>
    </div>
  )
}

function SectionRow({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: Array<[string, string]>
  onEdit: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-sky-700 hover:bg-sky-50"
          onClick={onEdit}
          type="button"
        >
          Edit <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 sm:block">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-800 sm:text-left">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function formatLabel(value: string) {
  if (!value) return ""
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
