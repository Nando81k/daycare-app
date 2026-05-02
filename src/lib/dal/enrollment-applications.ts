import "server-only"

import type { EnrollmentApplicationStatus, Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import {
  formatMonthDay,
  formatRelativeDateTime,
} from "@/lib/format"
import type { StatusBadgeVariant } from "@/types/app"

export type EnrollmentApplicationDraftInput = {
  leadId?: string | null
  familyId: string
  parentProfileId?: string | null
  childFirstName: string
  childLastName: string
  dateOfBirth: string
  childAgeLabel: string
  primaryLanguage: string
  homeAddress: string
  parentName: string
  parentEmail: string
  parentPhone: string
  relationshipToChild: string
  emergencyContactName: string
  emergencyContactPhone: string
  programSlug: string
  scheduleSlug: string
  preferredStartDate: string
  pediatricianName: string
  pediatricianPhone: string
  healthNotes: string
  /** Free-form payload, stored verbatim under `payload`. */
  payload: Prisma.InputJsonValue
  internalNote?: string
}

export type EnrollmentApplicationListItem = {
  id: string
  childFullName: string
  parentName: string
  programSlug: string
  scheduleSlug: string
  programLabel: string
  scheduleLabel: string
  status: EnrollmentApplicationStatus
  statusLabel: string
  statusTone: StatusBadgeVariant
  submittedAt: string | null
  updatedAt: string
  familyName: string | null
}

export function applicationStatusInfo(status: EnrollmentApplicationStatus): {
  label: string
  tone: StatusBadgeVariant
} {
  switch (status) {
    case "DRAFT":
      return { label: "Draft", tone: "secondary" }
    case "SUBMITTED":
      return { label: "Submitted", tone: "info" }
    case "UNDER_REVIEW":
      return { label: "Under review", tone: "warning" }
    case "APPROVED":
      return { label: "Approved", tone: "success" }
    case "REJECTED":
      return { label: "Rejected", tone: "destructive" }
    case "WAITLISTED":
      return { label: "Waitlisted", tone: "outline" }
  }
}

/**
 * Resolve programId/scheduleId from slugs (best-effort) — returns null entries if not found.
 */
async function resolveProgramAndSchedule(programSlug: string, scheduleSlug: string) {
  const [program, schedule] = await Promise.all([
    programSlug
      ? prisma.program.findUnique({ where: { slug: programSlug }, select: { id: true } })
      : Promise.resolve(null),
    scheduleSlug
      ? prisma.schedule.findUnique({ where: { slug: scheduleSlug }, select: { id: true } })
      : Promise.resolve(null),
  ])
  return { programId: program?.id ?? null, scheduleId: schedule?.id ?? null }
}

export async function upsertEnrollmentApplicationDraft(
  input: EnrollmentApplicationDraftInput
) {
  const { programId, scheduleId } = await resolveProgramAndSchedule(
    input.programSlug,
    input.scheduleSlug
  )

  // We key on (familyId, childFirstName, childLastName) for the upsert since
  // there's no stable external id yet — leadId, when present, is from the legacy
  // lead row, not the application itself.
  const existing = await prisma.enrollmentApplication.findFirst({
    where: {
      familyId: input.familyId,
      childFirstName: input.childFirstName,
      childLastName: input.childLastName,
      status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
    },
    select: { id: true, status: true },
  })

  const baseData = {
    childFirstName: input.childFirstName,
    childLastName: input.childLastName,
    dateOfBirth: input.dateOfBirth,
    childAgeLabel: input.childAgeLabel,
    primaryLanguage: input.primaryLanguage,
    homeAddress: input.homeAddress,
    parentName: input.parentName,
    parentEmail: input.parentEmail,
    parentPhone: input.parentPhone,
    relationshipToChild: input.relationshipToChild,
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
    programSlug: input.programSlug,
    scheduleSlug: input.scheduleSlug,
    programId,
    scheduleId,
    preferredStartDate: input.preferredStartDate,
    pediatricianName: input.pediatricianName,
    pediatricianPhone: input.pediatricianPhone,
    healthNotes: input.healthNotes,
    payload: input.payload,
    internalNote: input.internalNote ?? "",
  }

  if (existing) {
    return prisma.enrollmentApplication.update({
      where: { id: existing.id },
      data: baseData,
    })
  }

  return prisma.enrollmentApplication.create({
    data: {
      ...baseData,
      familyId: input.familyId,
      parentProfileId: input.parentProfileId ?? null,
      status: "DRAFT",
    },
  })
}

export async function transitionApplicationToSubmitted(applicationId: string) {
  return prisma.enrollmentApplication.update({
    where: { id: applicationId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  })
}

export async function transitionApplicationStatus(
  applicationId: string,
  status: EnrollmentApplicationStatus,
  decidedByUserId?: string,
  decisionNote?: string
) {
  return prisma.enrollmentApplication.update({
    where: { id: applicationId },
    data: {
      status,
      decidedAt:
        status === "APPROVED" ||
        status === "REJECTED" ||
        status === "WAITLISTED"
          ? new Date()
          : null,
      decidedByUserId: decidedByUserId ?? null,
      decisionNote: decisionNote ?? null,
    },
  })
}

export async function listFamilyApplications(familyId: string) {
  const rows = await prisma.enrollmentApplication.findMany({
    where: { familyId },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      program: { select: { name: true } },
      schedule: { select: { name: true } },
      family: { select: { familyName: true } },
    },
  })
  return rows.map(toListItem)
}

export async function listAllApplications(filters?: {
  status?: EnrollmentApplicationStatus | null
}) {
  const rows = await prisma.enrollmentApplication.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    orderBy: [{ updatedAt: "desc" }],
    include: {
      program: { select: { name: true } },
      schedule: { select: { name: true } },
      family: { select: { familyName: true } },
    },
  })
  return rows.map(toListItem)
}

function toListItem(
  row: Awaited<ReturnType<typeof prisma.enrollmentApplication.findMany>>[number] & {
    program: { name: string } | null
    schedule: { name: string } | null
    family: { familyName: string } | null
  }
): EnrollmentApplicationListItem {
  const status = applicationStatusInfo(row.status)
  return {
    id: row.id,
    childFullName: `${row.childFirstName} ${row.childLastName}`.trim(),
    parentName: row.parentName,
    programSlug: row.programSlug,
    scheduleSlug: row.scheduleSlug,
    programLabel: row.program?.name ?? row.programSlug ?? "—",
    scheduleLabel: row.schedule?.name ?? row.scheduleSlug ?? "—",
    status: row.status,
    statusLabel: status.label,
    statusTone: status.tone,
    submittedAt: row.submittedAt
      ? formatRelativeDateTime(row.submittedAt)
      : null,
    updatedAt: formatMonthDay(row.updatedAt),
    familyName: row.family?.familyName ?? null,
  }
}

export async function getApplicationById(id: string) {
  return prisma.enrollmentApplication.findUnique({
    where: { id },
    include: {
      program: true,
      schedule: true,
      family: { include: { parents: { include: { user: true } } } },
      decidedByUser: { select: { id: true, name: true } },
    },
  })
}
