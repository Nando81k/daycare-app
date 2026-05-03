import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { EnrollmentActionPanel } from "@/components/admin/enrollment/enrollment-action-panel"
import { EnrollmentApplicationCards } from "@/components/admin/enrollment/enrollment-application-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { requireRole } from "@/lib/auth"
import { getEnrollmentLeadDetail } from "@/lib/dal/admin"
import { prisma } from "@/lib/db"
import { formatMonthDay } from "@/lib/format"
import { parseDashboardApplicationNote } from "@/lib/parent-enrollment"
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

  // Verify it's a lead row (not waitlist) before loading the rich detail.
  const baseLead = await prisma.enrollmentLead.findUnique({
    where: { id },
    select: { id: true, leadType: true, createdAt: true, updatedAt: true },
  })
  if (!baseLead || baseLead.leadType === "WAITLIST") notFound()

  const detail = await getEnrollmentLeadDetail(id)
  if (!detail) notFound()

  const stage = stageInfo(detail.lead.stage)
  const { freeformNote } = parseDashboardApplicationNote(detail.lead.note)

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
              {detail.lead.childName || "—"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {detail.lead.familyName} · received {formatMonthDay(baseLead.createdAt)}
              {" "}· updated {formatMonthDay(baseLead.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge variant={stage.tone}>{stage.label}</StatusBadge>
            <StatusBadge variant={priorityTone(detail.lead.priority)}>
              Priority: {detail.lead.priority.toLowerCase()}
            </StatusBadge>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <EnrollmentApplicationCards
            lead={detail.lead}
            application={detail.application}
          />
        </div>

        <SurfaceCard className="space-y-4 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Actions
          </h2>
          <p className="text-xs leading-5 text-slate-500">
            Approving creates the child record, places them in the chosen
            classroom, and posts the registration fee in one step.
          </p>
          <EnrollmentActionPanel
            lead={{
              id: detail.lead.id,
              stage: detail.lead.stage as
                | "CONTACTED"
                | "APPLICATION_SENT"
                | "ACCEPTED"
                | "DENIED",
              priority: detail.lead.priority as
                | "HIGH"
                | "MEDIUM"
                | "NORMAL"
                | "LOW",
              assignedTo: detail.lead.assignedTo,
              note: freeformNote,
            }}
            detail={detail}
          />
        </SurfaceCard>
      </div>
    </div>
  )
}
