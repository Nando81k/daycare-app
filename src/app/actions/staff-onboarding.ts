"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { getCurrentSession } from "@/lib/auth"
import { deleteBlobIfConfigured } from "@/lib/blob"
import { prisma } from "@/lib/db"
import {
  type MutationActionState,
  getFieldErrors,
  getMutationState,
  getStringValue,
} from "@/lib/action-state"
import {
  STAFF_POLICY_KEYS,
  saveStaffProfileStepSchema,
  signStaffPolicySchema,
  submitStaffDocumentSchema,
  type StaffPolicyKey,
} from "@/lib/validators/staff-onboarding"

/**
 * Loads the signed-in staff member's profile + onboarding row, or throws via
 * `forbidden()` if the user is not a TEACHER/ADMIN with a `StaffProfile`. All
 * actions in this module must run after this check — onboarding is staff-only.
 */
async function getStaffOnboardingContext() {
  const session = await getCurrentSession()
  if (!session) {
    redirect("/login")
  }
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    redirect("/")
  }

  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId: session.user.id },
    include: { onboarding: true },
  })

  if (!staffProfile) {
    redirect("/")
  }

  // Backfill the onboarding row if missing (legacy staff accounts).
  let progress = staffProfile.onboarding
  if (!progress) {
    progress = await prisma.staffOnboardingProgress.create({
      data: { staffProfileId: staffProfile.id },
    })
  }

  return { user: session.user, staffProfile, progress }
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function revalidateOnboarding() {
  revalidatePath("/onboarding/staff")
  revalidatePath("/admin/staff")
}

/** Save the profile-step fields and advance the wizard's currentStep. */
export async function saveStaffProfileStep(
  _previous: MutationActionState,
  formData: FormData,
): Promise<MutationActionState> {
  const { staffProfile, progress } = await getStaffOnboardingContext()

  const parsed = saveStaffProfileStepSchema.safeParse({
    phone: getStringValue(formData, "phone"),
    pronouns: getStringValue(formData, "pronouns"),
    bio: getStringValue(formData, "bio"),
    hireDate: getStringValue(formData, "hireDate"),
    emergencyContactName: getStringValue(formData, "emergencyContactName"),
    emergencyContactPhone: getStringValue(formData, "emergencyContactPhone"),
    photoBlobPathname: getStringValue(formData, "photoBlobPathname"),
    photoBlobUrl: getStringValue(formData, "photoBlobUrl"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted fields and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  // If the staff member uploaded a new photo, clean up the previous one.
  if (
    parsed.data.photoBlobPathname &&
    staffProfile.photoBlobPathname &&
    staffProfile.photoBlobPathname !== parsed.data.photoBlobPathname
  ) {
    await deleteBlobIfConfigured(staffProfile.photoBlobPathname)
  }

  await prisma.staffProfile.update({
    where: { id: staffProfile.id },
    data: {
      phone: parsed.data.phone,
      pronouns: parsed.data.pronouns ?? null,
      bio: parsed.data.bio ?? null,
      hireDate: parsed.data.hireDate ? new Date(parsed.data.hireDate) : null,
      emergencyContactName: parsed.data.emergencyContactName,
      emergencyContactPhone: parsed.data.emergencyContactPhone,
      photoBlobPathname: parsed.data.photoBlobPathname ?? null,
      photoBlobUrl: parsed.data.photoBlobUrl ?? null,
    },
  })

  await prisma.staffOnboardingProgress.update({
    where: { id: progress.id },
    data: {
      status: "IN_PROGRESS",
      currentStep: "documents",
    },
  })

  revalidateOnboarding()

  return getMutationState({
    success: true,
    message: "Profile saved. Next: required documents.",
  })
}

/** Persist a freshly-uploaded staff document (post-Vercel-Blob-upload). */
export async function submitStaffDocument(
  _previous: MutationActionState,
  formData: FormData,
): Promise<MutationActionState> {
  const { staffProfile } = await getStaffOnboardingContext()

  const parsed = submitStaffDocumentSchema.safeParse({
    documentId: getStringValue(formData, "documentId"),
    fileName: getStringValue(formData, "fileName"),
    blobPathname: getStringValue(formData, "blobPathname"),
    blobUrl: getStringValue(formData, "blobUrl"),
    blobDownloadUrl: getStringValue(formData, "blobDownloadUrl"),
    contentType: getStringValue(formData, "contentType"),
    sizeBytes: getStringValue(formData, "sizeBytes"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "The uploaded file details were incomplete. Upload again and retry.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const document = await prisma.staffDocument.findFirst({
    where: { id: parsed.data.documentId, staffProfileId: staffProfile.id },
    select: { id: true, blobPathname: true, category: true },
  })

  if (!document) {
    return getMutationState({
      error: "That document request could not be found.",
    })
  }

  if (document.blobPathname && document.blobPathname !== parsed.data.blobPathname) {
    await deleteBlobIfConfigured(document.blobPathname)
  }

  await prisma.staffDocument.update({
    where: { id: document.id },
    data: {
      status: "SUBMITTED",
      fileName: parsed.data.fileName,
      blobPathname: parsed.data.blobPathname,
      blobUrl: parsed.data.blobUrl,
      blobDownloadUrl: parsed.data.blobDownloadUrl,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      submittedAt: new Date(),
      // Clear any prior rejection note now that a fresh file is in.
      notes: null,
    },
  })

  revalidateOnboarding()

  return getMutationState({
    success: true,
    message: "Document uploaded.",
  })
}

/** Type-sign a single policy. Stores the signature into the JSON acks blob. */
export async function signStaffPolicy(
  _previous: MutationActionState,
  formData: FormData,
): Promise<MutationActionState> {
  const { progress } = await getStaffOnboardingContext()

  const parsed = signStaffPolicySchema.safeParse({
    policyKey: getStringValue(formData, "policyKey"),
    signerName: getStringValue(formData, "signerName"),
    acknowledged: getStringValue(formData, "acknowledged"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Type your name and confirm the acknowledgement to sign.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const headerStore = await headers()
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null

  const existing = isJsonObject(progress.acknowledgments)
    ? { ...progress.acknowledgments }
    : {}
  existing[parsed.data.policyKey] = {
    signedName: parsed.data.signerName,
    signedAt: new Date().toISOString(),
    signedIp: ipAddress,
  }

  await prisma.staffOnboardingProgress.update({
    where: { id: progress.id },
    data: {
      status: "IN_PROGRESS",
      acknowledgments: existing,
    },
  })

  revalidateOnboarding()

  return getMutationState({
    success: true,
    message: "Policy signed.",
  })
}

/** Move the wizard's currentStep marker forward (e.g. after viewing a step). */
export async function advanceStaffOnboardingStep(
  _previous: MutationActionState,
  formData: FormData,
): Promise<MutationActionState> {
  const { progress } = await getStaffOnboardingContext()
  const step = getStringValue(formData, "step")

  if (
    !["welcome", "profile", "documents", "policies", "classroom", "complete"].includes(
      step,
    )
  ) {
    return getMutationState({ error: "Unknown step." })
  }

  await prisma.staffOnboardingProgress.update({
    where: { id: progress.id },
    data: {
      status: progress.status === "NOT_STARTED" ? "IN_PROGRESS" : progress.status,
      currentStep: step,
    },
  })

  revalidateOnboarding()
  return getMutationState({ success: true })
}

/** Final gate: requires every required doc submitted + every policy signed. */
export async function completeStaffOnboarding(): Promise<void> {
  const { user, staffProfile, progress } = await getStaffOnboardingContext()

  const documents = await prisma.staffDocument.findMany({
    where: { staffProfileId: staffProfile.id },
    select: { status: true },
  })

  const allDocsSubmitted = documents.every(
    (doc) =>
      doc.status === "SUBMITTED" ||
      doc.status === "APPROVED",
  )

  const acks = isJsonObject(progress.acknowledgments) ? progress.acknowledgments : {}
  const allPoliciesSigned = STAFF_POLICY_KEYS.every((key: StaffPolicyKey) =>
    Boolean(acks[key]),
  )

  if (!allDocsSubmitted || !allPoliciesSigned) {
    redirect("/onboarding/staff")
  }

  await prisma.staffOnboardingProgress.update({
    where: { id: progress.id },
    data: {
      status: "COMPLETE",
      currentStep: "complete",
      completedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "staff.onboarding.complete",
      subjectType: "StaffProfile",
      subjectId: staffProfile.id,
      details: {
        documents: documents.length,
        policies: STAFF_POLICY_KEYS.length,
      },
    },
  })

  revalidateOnboarding()

  redirect(user.role === "ADMIN" ? "/admin" : "/teacher")
}
