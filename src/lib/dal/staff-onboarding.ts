import "server-only"

import { prisma } from "@/lib/db"
import type {
  StaffDocument,
  StaffOnboardingProgress,
  StaffProfile,
} from "@prisma/client"

import { STAFF_POLICY_KEYS, type StaffPolicyKey } from "@/lib/validators/staff-onboarding"

export type StaffPolicySignature = {
  signedName: string
  signedAt: string
  signedIp: string | null
}

export type StaffOnboardingBundle = {
  staffProfile: StaffProfile & {
    classroom: { id: string; name: string } | null
  }
  progress: StaffOnboardingProgress
  documents: StaffDocument[]
  /** Map of policyKey → signature record (only set if signed). */
  acknowledgments: Record<string, StaffPolicySignature | undefined>
  /** Tally for the wizard "complete" gate. */
  requiredDocCount: number
  submittedDocCount: number
  approvedDocCount: number
  /** Policy keys that have a signature record. */
  signedPolicyKeys: StaffPolicyKey[]
  /** Policy keys still missing a signature. */
  unsignedPolicyKeys: StaffPolicyKey[]
}

function readAcknowledgments(
  raw: unknown,
): Record<string, StaffPolicySignature | undefined> {
  if (!raw || typeof raw !== "object") return {}
  const out: Record<string, StaffPolicySignature | undefined> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (
      value &&
      typeof value === "object" &&
      "signedName" in value &&
      "signedAt" in value
    ) {
      const v = value as Record<string, unknown>
      out[key] = {
        signedName: String(v.signedName ?? ""),
        signedAt: String(v.signedAt ?? ""),
        signedIp: v.signedIp == null ? null : String(v.signedIp),
      }
    }
  }
  return out
}

/**
 * Loads the full onboarding bundle for the given user. Returns null when the
 * user has no `StaffProfile` (e.g. parents) so callers can branch.
 */
export async function getStaffOnboardingForUser(
  userId: string,
): Promise<StaffOnboardingBundle | null> {
  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      classroom: { select: { id: true, name: true } },
      documents: { orderBy: { createdAt: "asc" } },
      onboarding: true,
    },
  })

  if (!staffProfile) return null

  // Lazy backfill: if a staff profile exists but onboarding row was never
  // created (legacy staff invited before this feature shipped), create it on
  // first read so the wizard has somewhere to write.
  let progress = staffProfile.onboarding
  if (!progress) {
    progress = await prisma.staffOnboardingProgress.create({
      data: { staffProfileId: staffProfile.id },
    })
  }

  const acknowledgments = readAcknowledgments(progress.acknowledgments)
  const signedPolicyKeys = STAFF_POLICY_KEYS.filter((key) =>
    Boolean(acknowledgments[key]),
  )
  const unsignedPolicyKeys = STAFF_POLICY_KEYS.filter(
    (key) => !acknowledgments[key],
  )

  const documents = staffProfile.documents
  const requiredDocCount = documents.length
  const submittedDocCount = documents.filter(
    (doc) =>
      doc.status === "SUBMITTED" ||
      doc.status === "APPROVED" ||
      doc.status === "REJECTED",
  ).length
  const approvedDocCount = documents.filter(
    (doc) => doc.status === "APPROVED",
  ).length

  return {
    staffProfile,
    progress,
    documents,
    acknowledgments,
    requiredDocCount,
    submittedDocCount,
    approvedDocCount,
    signedPolicyKeys: signedPolicyKeys as StaffPolicyKey[],
    unsignedPolicyKeys: unsignedPolicyKeys as StaffPolicyKey[],
  }
}

/**
 * Per-staff onboarding completion summary used by the admin staff list to
 * render a "3/5" badge on each row.
 */
export type StaffOnboardingSummary = {
  staffProfileId: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE"
  completedSteps: number
  totalSteps: number
}

const TOTAL_ONBOARDING_STEPS = 4 // profile, documents, policies, classroom

export async function getStaffOnboardingSummariesForAdmin(
  staffProfileIds: string[],
): Promise<Record<string, StaffOnboardingSummary>> {
  if (staffProfileIds.length === 0) return {}

  const [progressRows, documents] = await Promise.all([
    prisma.staffOnboardingProgress.findMany({
      where: { staffProfileId: { in: staffProfileIds } },
    }),
    prisma.staffDocument.findMany({
      where: { staffProfileId: { in: staffProfileIds } },
      select: { staffProfileId: true, status: true },
    }),
  ])

  const docsByStaff = new Map<string, { total: number; submitted: number }>()
  for (const doc of documents) {
    const tally = docsByStaff.get(doc.staffProfileId) ?? {
      total: 0,
      submitted: 0,
    }
    tally.total += 1
    if (
      doc.status === "SUBMITTED" ||
      doc.status === "APPROVED" ||
      doc.status === "REJECTED"
    ) {
      tally.submitted += 1
    }
    docsByStaff.set(doc.staffProfileId, tally)
  }

  const out: Record<string, StaffOnboardingSummary> = {}
  for (const id of staffProfileIds) {
    const progress = progressRows.find((row) => row.staffProfileId === id)
    if (!progress) {
      out[id] = {
        staffProfileId: id,
        status: "NOT_STARTED",
        completedSteps: 0,
        totalSteps: TOTAL_ONBOARDING_STEPS,
      }
      continue
    }

    const acks = readAcknowledgments(progress.acknowledgments)
    const profileDone = Boolean(progress.currentStep) && progress.currentStep !== "welcome" && progress.currentStep !== "profile"
    const docsTally = docsByStaff.get(id)
    const docsDone = docsTally ? docsTally.submitted >= docsTally.total && docsTally.total > 0 : false
    const policiesDone = STAFF_POLICY_KEYS.every((key) => Boolean(acks[key]))
    const classroomDone = progress.status === "COMPLETE"

    const completed = [profileDone, docsDone, policiesDone, classroomDone].filter(
      Boolean,
    ).length

    out[id] = {
      staffProfileId: id,
      status: progress.status,
      completedSteps: completed,
      totalSteps: TOTAL_ONBOARDING_STEPS,
    }
  }
  return out
}
