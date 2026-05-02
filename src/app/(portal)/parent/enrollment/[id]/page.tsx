import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatMonthDay } from "@/lib/format"
import { parseDashboardApplicationNote } from "@/lib/parent-enrollment"
import { getTuitionQuote } from "@/lib/pricing-server"
import type { StatusBadgeVariant } from "@/types/app"

type ApplicationStatusInfo = {
  label: string
  tone: StatusBadgeVariant
  detail: string
}

function getApplicationStatusInfo(stage: string | null | undefined): ApplicationStatusInfo {
  switch (stage) {
    case "ACCEPTED":
      return {
        label: "Approved",
        tone: "success",
        detail: "Your enrollment has been approved.",
      }
    case "DENIED":
      return {
        label: "Not approved",
        tone: "destructive",
        detail: "The center has marked this application as not approved.",
      }
    case "APPLICATION_SENT":
      return {
        label: "Submitted",
        tone: "info",
        detail: "Submitted to the center — under review.",
      }
    case "CONTACTED":
      return {
        label: "Draft saved",
        tone: "secondary",
        detail: "Your draft is saved. Continue any time.",
      }
    default:
      return {
        label: "Not started",
        tone: "secondary",
        detail: "Complete the enrollment form to move forward.",
      }
  }
}

export default async function ParentEnrollmentApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    select: { familyId: true },
  })

  if (!profile) notFound()

  const lead = await prisma.enrollmentLead.findFirst({
    where: { id, familyId: profile.familyId },
  })

  if (!lead) notFound()

  const status = getApplicationStatusInfo(lead.stage)
  const { parsed, freeformNote } = parseDashboardApplicationNote(lead.note)
  const childName = lead.childName.trim() || "—"
  const quote = await getTuitionQuote({
    programSlug: lead.programInterest,
    scheduleSlug: lead.scheduleNeed,
  })

  const isEditable = lead.stage === "CONTACTED" || lead.stage === "APPLICATION_SENT"

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/parent/billing"
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to billing
        </Link>
        {isEditable && (
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/parent/enrollment">
              <Pencil className="h-3.5 w-3.5" />
              Continue editing
            </Link>
          </Button>
        )}
      </div>

      <SurfaceCard className="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Enrollment application
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {childName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted {formatMonthDay(lead.createdAt)} · last updated{" "}
              {formatMonthDay(lead.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge variant={status.tone}>{status.label}</StatusBadge>
            <p className="max-w-xs text-right text-xs text-slate-500">
              {status.detail}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="space-y-3 p-6">
          <SectionHeader title="Child" />
          <SummaryRow label="Name" value={childName} />
          <SummaryRow label="Age label" value={lead.childAgeLabel || "—"} />
          <SummaryRow
            label="Date of birth"
            value={parsed?.dateOfBirth || "—"}
          />
          <SummaryRow
            label="Primary language"
            value={parsed?.primaryLanguage || "—"}
          />
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-6">
          <SectionHeader title="Guardian" />
          <SummaryRow label="Name" value={lead.parentName || "—"} />
          <SummaryRow
            label="Relationship"
            value={parsed?.relationshipToChild || "—"}
          />
          <SummaryRow label="Email" value={lead.email || "—"} />
          <SummaryRow label="Phone" value={lead.phone || "—"} />
          <SummaryRow
            label="Home address"
            value={parsed?.homeAddress || "—"}
          />
          <SummaryRow
            label="Emergency contact"
            value={
              parsed?.emergencyContactName
                ? `${parsed.emergencyContactName}${
                    parsed.emergencyContactPhone
                      ? ` · ${parsed.emergencyContactPhone}`
                      : ""
                  }`
                : "—"
            }
          />
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-6">
          <SectionHeader title="Program & schedule" />
          <SummaryRow label="Program" value={quote?.programName || lead.programInterest || "—"} />
          <SummaryRow label="Schedule" value={quote?.scheduleName || lead.scheduleNeed || "—"} />
          <SummaryRow
            label="Start date"
            value={parsed?.preferredStartDate || lead.requestedStart || "—"}
          />
          <SummaryRow
            label="Estimated tuition"
            value={
              quote ? `${quote.amountFormatted} · ${quote.billingLabel}` : "—"
            }
          />
        </SurfaceCard>

        <SurfaceCard className="space-y-3 p-6">
          <SectionHeader title="Health & safety" />
          <SummaryRow
            label="Pediatrician"
            value={parsed?.pediatricianName || "—"}
          />
          <SummaryRow
            label="Pediatrician phone"
            value={parsed?.pediatricianPhone || "—"}
          />
          <SummaryRow
            label="Health notes"
            value={parsed?.healthNotes || "—"}
          />
        </SurfaceCard>
      </div>

      {freeformNote && (
        <SurfaceCard className="space-y-2 p-6">
          <SectionHeader title="Notes" />
          <p className="whitespace-pre-line text-sm text-slate-700">
            {freeformNote}
          </p>
        </SurfaceCard>
      )}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
      {title}
    </h2>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  )
}

