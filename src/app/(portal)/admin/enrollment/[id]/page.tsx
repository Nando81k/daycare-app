import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { EnrollmentActionPanel } from "@/components/admin/enrollment/enrollment-action-panel"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatMonthDay } from "@/lib/format"
import { parseDashboardApplicationNote } from "@/lib/parent-enrollment"
import { getTuitionQuote } from "@/lib/pricing-server"
import type { StatusBadgeVariant } from "@/types/app"

function stageInfo(
  stage: string | null | undefined
): { label: string; tone: StatusBadgeVariant } {
  switch (stage) {
    case "ACCEPTED":
      return { label: "Approved", tone: "success" }
    case "DENIED":
      return { label: "Rejected", tone: "destructive" }
    case "APPLICATION_SENT":
      return { label: "Submitted", tone: "info" }
    case "CONTACTED":
      return { label: "Draft", tone: "secondary" }
    default:
      return { label: "Unknown", tone: "secondary" }
  }
}

function priorityTone(priority: string): StatusBadgeVariant {
  switch (priority) {
    case "HIGH":
      return "destructive"
    case "MEDIUM":
      return "warning"
    case "NORMAL":
      return "secondary"
    case "LOW":
      return "outline"
    default:
      return "secondary"
  }
}

export default async function AdminEnrollmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireRole("ADMIN")

  const lead = await prisma.enrollmentLead.findUnique({
    where: { id },
    include: { family: { select: { familyName: true, id: true } } },
  })

  if (!lead || lead.leadType === "WAITLIST") notFound()

  const stage = stageInfo(lead.stage)
  const { parsed, freeformNote } = parseDashboardApplicationNote(lead.note)
  const quote = await getTuitionQuote({
    programSlug: lead.programInterest,
    scheduleSlug: lead.scheduleNeed,
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/enrollment"
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to enrollment queue
        </Link>
      </div>

      <SurfaceCard className="space-y-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Application
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {lead.childName || "—"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {lead.familyName} · received {formatMonthDay(lead.createdAt)} ·
              updated {formatMonthDay(lead.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge variant={stage.tone}>{stage.label}</StatusBadge>
            <StatusBadge variant={priorityTone(lead.priority)}>
              Priority: {lead.priority.toLowerCase()}
            </StatusBadge>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SurfaceCard className="space-y-3 p-5">
              <SectionTitle>Child</SectionTitle>
              <Row label="Name" value={lead.childName || "—"} />
              <Row label="Age label" value={lead.childAgeLabel || "—"} />
              <Row label="Date of birth" value={parsed?.dateOfBirth || "—"} />
              <Row
                label="Primary language"
                value={parsed?.primaryLanguage || "—"}
              />
            </SurfaceCard>

            <SurfaceCard className="space-y-3 p-5">
              <SectionTitle>Guardian</SectionTitle>
              <Row label="Name" value={lead.parentName || "—"} />
              <Row
                label="Relationship"
                value={parsed?.relationshipToChild || "—"}
              />
              <Row label="Email" value={lead.email || "—"} />
              <Row label="Phone" value={lead.phone || "—"} />
              <Row label="Address" value={parsed?.homeAddress || "—"} />
              <Row
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

            <SurfaceCard className="space-y-3 p-5">
              <SectionTitle>Program & schedule</SectionTitle>
              <Row
                label="Program"
                value={quote?.programName || lead.programInterest || "—"}
              />
              <Row
                label="Schedule"
                value={quote?.scheduleName || lead.scheduleNeed || "—"}
              />
              <Row
                label="Start date"
                value={parsed?.preferredStartDate || lead.requestedStart || "—"}
              />
              <Row
                label="Estimated tuition"
                value={
                  quote
                    ? `${quote.amountFormatted} · ${quote.billingLabel}`
                    : "—"
                }
              />
            </SurfaceCard>

            <SurfaceCard className="space-y-3 p-5">
              <SectionTitle>Health & safety</SectionTitle>
              <Row
                label="Pediatrician"
                value={parsed?.pediatricianName || "—"}
              />
              <Row
                label="Pediatrician phone"
                value={parsed?.pediatricianPhone || "—"}
              />
              <Row label="Medical notes" value={parsed?.healthNotes || "—"} />
            </SurfaceCard>
          </div>

          {freeformNote && (
            <SurfaceCard className="space-y-2 p-5">
              <SectionTitle>Family notes</SectionTitle>
              <p className="whitespace-pre-line text-sm text-slate-700">
                {freeformNote}
              </p>
            </SurfaceCard>
          )}
        </div>

        <SurfaceCard className="space-y-4 p-5">
          <SectionTitle>Actions</SectionTitle>
          <p className="text-xs leading-5 text-slate-500">
            Approving creates the enrollment fee invoice automatically and
            updates the family&apos;s portal status.
          </p>
          <EnrollmentActionPanel
            lead={{
              id: lead.id,
              stage: lead.stage as
                | "CONTACTED"
                | "APPLICATION_SENT"
                | "ACCEPTED"
                | "DENIED",
              priority: lead.priority as "HIGH" | "MEDIUM" | "NORMAL" | "LOW",
              assignedTo: lead.assignedTo,
              note: freeformNote,
            }}
          />
        </SurfaceCard>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {children}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  )
}
