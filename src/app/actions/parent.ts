"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { requireRole } from "@/lib/auth"
import { getFieldErrors, getMutationState, getStringListValue, getStringValue } from "@/lib/action-state"
import { deleteBlobIfConfigured } from "@/lib/blob"
import { prisma } from "@/lib/db"
import { BILLING_THREAD_LABEL } from "@/lib/messaging"
import {
  combineChildName,
  getDraftPlaceholder,
  serializeDashboardApplicationNote,
} from "@/lib/parent-enrollment"
import {
  transitionApplicationToSubmitted,
  upsertEnrollmentApplicationDraft,
  type EnrollmentApplicationDraftInput,
} from "@/lib/dal/enrollment-applications"
import type { ParentActionState } from "@/types/app"
import {
  createParentThreadSchema,
  deleteEnrollmentApplicationDraftSchema,
  deleteAuthorizedPickupSchema,
  saveEnrollmentApplicationDraftSchema,
  sendParentReplySchema,
  submitEnrollmentApplicationSchema,
  submitDocumentTypedSignatureSchema,
  submitDocumentUploadSchema,
  updateParentSettingsSchema,
  upsertAuthorizedPickupSchema,
} from "@/lib/validators/parent"

function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path)
  }
}

function getBooleanValue(formData: FormData, key: string) {
  return getStringValue(formData, key) === "true"
}

function buildApplicationDraftInput(
  familyId: string,
  parentProfileId: string | null,
  values: ReturnType<typeof getEnrollmentDashboardValues>,
  parsed: {
    parentName: string
    familyName: string
    email: string
    phone: string
    childFirstName: string
    childLastName?: string | null
    childAgeLabel: string
    programInterest: string
    scheduleNeed: string
  }
): EnrollmentApplicationDraftInput {
  const payload = {
    healthChecklist: values.healthChecklist,
    authorizedPickups: values.authorizedPickups,
    accepted: values.accepted,
    note: values.note,
    requestedStart: values.requestedStart,
  }
  return {
    familyId,
    parentProfileId,
    childFirstName: parsed.childFirstName,
    childLastName: parsed.childLastName ?? "",
    dateOfBirth: values.dateOfBirth,
    childAgeLabel: parsed.childAgeLabel,
    primaryLanguage: values.primaryLanguage,
    homeAddress: values.homeAddress,
    parentName: parsed.parentName,
    parentEmail: parsed.email,
    parentPhone: parsed.phone,
    relationshipToChild: values.relationshipToChild,
    emergencyContactName: values.emergencyContactName,
    emergencyContactPhone: values.emergencyContactPhone,
    programSlug: parsed.programInterest,
    scheduleSlug: parsed.scheduleNeed,
    preferredStartDate: values.preferredStartDate,
    pediatricianName: values.pediatricianName,
    pediatricianPhone: values.pediatricianPhone,
    healthNotes: values.healthNotes,
    payload,
  }
}

function getEnrollmentDashboardValues(formData: FormData) {
  const authorizedPickups = getStringValue(formData, "authorizedPickups")
  let parsedPickups: Array<{
    id?: string
    name?: string
    relationship?: string
    phone?: string
  }> = []

  if (authorizedPickups) {
    try {
      parsedPickups = JSON.parse(authorizedPickups) as Array<{
        id?: string
        name?: string
        relationship?: string
        phone?: string
      }>
    } catch {
      parsedPickups = []
    }
  }

  return {
    leadId: getStringValue(formData, "leadId"),
    familyName: getStringValue(formData, "familyName"),
    parentName: getStringValue(formData, "parentName"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    childFirstName: getStringValue(formData, "childFirstName"),
    childLastName: getStringValue(formData, "childLastName"),
    dateOfBirth: getStringValue(formData, "dateOfBirth"),
    childAgeLabel: getStringValue(formData, "childAgeLabel"),
    homeAddress: getStringValue(formData, "homeAddress"),
    preferredStartDate: getStringValue(formData, "preferredStartDate"),
    primaryLanguage: getStringValue(formData, "primaryLanguage"),
    relationshipToChild: getStringValue(formData, "relationshipToChild"),
    emergencyContactName: getStringValue(formData, "emergencyContactName"),
    emergencyContactPhone: getStringValue(formData, "emergencyContactPhone"),
    requestedStart: getStringValue(formData, "requestedStart"),
    programInterest: getStringValue(formData, "programInterest"),
    scheduleNeed: getStringValue(formData, "scheduleNeed"),
    pediatricianName: getStringValue(formData, "pediatricianName"),
    pediatricianPhone: getStringValue(formData, "pediatricianPhone"),
    healthNotes: getStringValue(formData, "healthNotes"),
    note: getStringValue(formData, "note"),
    accepted: getBooleanValue(formData, "accepted"),
    healthChecklist: {
      immunizationRecords: getBooleanValue(formData, "healthChecklist.immunizationRecords"),
      emergencyContacts: getBooleanValue(formData, "healthChecklist.emergencyContacts"),
      authorizedPickups: getBooleanValue(formData, "healthChecklist.authorizedPickups"),
      healthChanges: getBooleanValue(formData, "healthChecklist.healthChanges"),
    },
    authorizedPickups: parsedPickups
      .map((pickup, index) => ({
        id: String(pickup.id ?? `pickup-${index + 1}`),
        name: String(pickup.name ?? ""),
        relationship: String(pickup.relationship ?? ""),
        phone: String(pickup.phone ?? ""),
      }))
      .filter((pickup) => pickup.name || pickup.relationship || pickup.phone),
  }
}

async function getParentActionContext() {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      family: {
        include: {
          billingProfile: true,
          children: {
            select: {
              id: true,
              slug: true,
              firstName: true,
              lastName: true,
              teacherLabel: true,
              classroom: {
                select: {
                  name: true,
                },
              },
              dailyReports: {
                orderBy: {
                  date: "desc",
                },
                take: 1,
                select: {
                  id: true,
                  date: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!profile) {
    throw new Error("Parent account is not configured.")
  }

  return {
    user,
    profile,
  }
}

function getPrimaryChild(profile: Awaited<ReturnType<typeof getParentActionContext>>["profile"]) {
  return profile.family.children[0] ?? null
}

export async function createParentThread(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()
  const primaryChild = getPrimaryChild(profile)

  const parsed = createParentThreadSchema.safeParse({
    subject: getStringValue(formData, "subject"),
    classroomLabel: getStringValue(formData, "classroomLabel"),
    body: getStringValue(formData, "body"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted message details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const participantLabel =
    parsed.data.classroomLabel === BILLING_THREAD_LABEL
      ? "Billing Office"
      : primaryChild?.teacherLabel ?? "Classroom team"

  const thread = await prisma.messageThread.create({
    data: {
      familyId: profile.familyId,
      subject: parsed.data.subject,
      classroomLabel: parsed.data.classroomLabel,
      status: "ACTIVE",
      participants: [participantLabel, profile.user.name],
      lastMessageAt: new Date(),
      messages: {
        create: {
          authorUserId: user.id,
          senderName: profile.user.name,
          role: "PARENT",
          body: parsed.data.body,
        },
      },
    },
    select: {
      id: true,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "parent.messages.thread.create",
      subjectType: "MessageThread",
      subjectId: thread.id,
      details: {
        subject: parsed.data.subject,
        classroomLabel: parsed.data.classroomLabel,
      },
    },
  })

  revalidatePaths([
    "/parent",
    "/parent/messages",
  ])

  return getMutationState({
    success: true,
    message: "Message sent to the school team.",
  })
}

export async function saveEnrollmentApplicationDraft(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()
  const values = getEnrollmentDashboardValues(formData)
  const parsed = saveEnrollmentApplicationDraftSchema.safeParse({
    leadId: values.leadId,
    familyName: values.familyName,
    parentName: values.parentName,
    email: values.email,
    phone: values.phone,
    childFirstName: values.childFirstName,
    childLastName: values.childLastName,
    childAgeLabel: values.childAgeLabel,
    requestedStart: values.requestedStart,
    programInterest: values.programInterest,
    scheduleNeed: values.scheduleNeed,
    note: values.note,
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Add the basic child and guardian details before saving this draft.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const existingLead = parsed.data.leadId
    ? await prisma.enrollmentLead.findFirst({
        where: {
          id: parsed.data.leadId,
          familyId: profile.familyId,
          leadType: {
            not: "WAITLIST",
          },
        },
        select: {
          id: true,
          stage: true,
          priority: true,
          assignedTo: true,
        },
      })
    : null

  if (parsed.data.leadId && !existingLead) {
    return getMutationState({
      error: "That child application could not be found.",
    })
  }

  if (existingLead?.stage === "ACCEPTED") {
    return getMutationState({
      error: "Approved applications can no longer be edited here.",
    })
  }

  const childName = combineChildName(parsed.data.childFirstName, parsed.data.childLastName ?? "")
  const placeholder = getDraftPlaceholder()
  const serializedNote = serializeDashboardApplicationNote({
    dateOfBirth: values.dateOfBirth,
    homeAddress: values.homeAddress,
    preferredStartDate: values.preferredStartDate,
    primaryLanguage: values.primaryLanguage,
    relationshipToChild: values.relationshipToChild,
    emergencyContactName: values.emergencyContactName,
    emergencyContactPhone: values.emergencyContactPhone,
    authorizedPickups: values.authorizedPickups,
    pediatricianName: values.pediatricianName,
    pediatricianPhone: values.pediatricianPhone,
    healthNotes: values.healthNotes,
    healthChecklist: values.healthChecklist,
    accepted: values.accepted,
    note: values.note,
  })

  const lead = await prisma.$transaction(async (tx) => {
    await tx.family.update({
      where: {
        id: profile.familyId,
      },
      data: {
        enrollmentStage: "Draft saved",
      },
    })

    await tx.parentProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        phone: parsed.data.phone,
        billingContact: parsed.data.parentName,
      },
    })

    const record = existingLead
      ? await tx.enrollmentLead.update({
          where: {
            id: existingLead.id,
          },
          data: {
            parentName: parsed.data.parentName,
            familyName: parsed.data.familyName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            childName,
            childAgeLabel: parsed.data.childAgeLabel ?? placeholder,
            requestedStart: parsed.data.requestedStart ?? placeholder,
            programInterest: parsed.data.programInterest ?? placeholder,
            source: "Parent dashboard",
            stage:
              existingLead.stage === "APPLICATION_SENT" || existingLead.stage === "DENIED"
                ? existingLead.stage
                : "CONTACTED",
            priority: existingLead.priority,
            assignedTo: existingLead.assignedTo,
            note: serializedNote,
            scheduleNeed: parsed.data.scheduleNeed ?? placeholder,
          },
          select: {
            id: true,
          },
        })
      : await tx.enrollmentLead.create({
          data: {
            familyId: profile.familyId,
            parentName: parsed.data.parentName,
            familyName: parsed.data.familyName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            childName,
            childAgeLabel: parsed.data.childAgeLabel ?? placeholder,
            requestedStart: parsed.data.requestedStart ?? placeholder,
            programInterest: parsed.data.programInterest ?? placeholder,
            source: "Parent dashboard",
            leadType: "CONTACT",
            stage: "CONTACTED",
            priority: "NORMAL",
            assignedTo: "Admissions",
            note: serializedNote,
            scheduleNeed: parsed.data.scheduleNeed ?? placeholder,
          },
          select: {
            id: true,
          },
        })

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: existingLead ? "parent.enrollment.draft.update" : "parent.enrollment.draft.create",
        subjectType: "EnrollmentLead",
        subjectId: record.id,
        details: {
          familyId: profile.familyId,
          childName,
        },
      },
    })

    return record
  })

  // Phase 5 mirror: keep the canonical EnrollmentApplication in sync.
  try {
    await upsertEnrollmentApplicationDraft(
      buildApplicationDraftInput(profile.familyId, profile.id, values, {
        parentName: parsed.data.parentName,
        familyName: parsed.data.familyName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        childFirstName: parsed.data.childFirstName,
        childLastName: parsed.data.childLastName ?? "",
        childAgeLabel: parsed.data.childAgeLabel ?? placeholder,
        programInterest: parsed.data.programInterest ?? placeholder,
        scheduleNeed: parsed.data.scheduleNeed ?? placeholder,
      })
    )
  } catch (mirrorError) {
    console.error("EnrollmentApplication mirror failed (draft):", mirrorError)
  }

  revalidatePaths([
    "/parent",
    "/parent/enrollment",
    "/parent/billing",
    "/admin",
    "/admin/enrollment",
  ])

  return getMutationState({
    success: true,
    message: "Draft saved.",
    entityId: lead.id,
  })
}

export async function submitEnrollmentApplication(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()
  const values = getEnrollmentDashboardValues(formData)
  const parsed = submitEnrollmentApplicationSchema.safeParse({
    leadId: values.leadId,
    familyName: values.familyName,
    parentName: values.parentName,
    email: values.email,
    phone: values.phone,
    childFirstName: values.childFirstName,
    childLastName: values.childLastName,
    childAgeLabel: values.childAgeLabel,
    requestedStart: values.requestedStart,
    programInterest: values.programInterest,
    scheduleNeed: values.scheduleNeed,
    emergencyContactName: values.emergencyContactName,
    emergencyContactPhone: values.emergencyContactPhone,
    accepted: values.accepted ? "true" : "false",
    note: values.note,
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted enrollment details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const existingLead = parsed.data.leadId
    ? await prisma.enrollmentLead.findFirst({
        where: {
          id: parsed.data.leadId,
          familyId: profile.familyId,
          leadType: {
            not: "WAITLIST",
          },
        },
        select: {
          id: true,
          stage: true,
          priority: true,
          assignedTo: true,
        },
      })
    : null

  if (parsed.data.leadId && !existingLead) {
    return getMutationState({
      error: "That child application could not be found.",
    })
  }

  if (existingLead?.stage === "ACCEPTED") {
    return getMutationState({
      error: "Approved applications can no longer be edited here.",
    })
  }

  const childName = combineChildName(parsed.data.childFirstName, parsed.data.childLastName)
  const serializedNote = serializeDashboardApplicationNote({
    dateOfBirth: values.dateOfBirth,
    homeAddress: values.homeAddress,
    preferredStartDate: values.preferredStartDate,
    primaryLanguage: values.primaryLanguage,
    relationshipToChild: values.relationshipToChild,
    emergencyContactName: values.emergencyContactName,
    emergencyContactPhone: values.emergencyContactPhone,
    authorizedPickups: values.authorizedPickups,
    pediatricianName: values.pediatricianName,
    pediatricianPhone: values.pediatricianPhone,
    healthNotes: values.healthNotes,
    healthChecklist: values.healthChecklist,
    accepted: values.accepted,
    note: values.note,
  })

  const lead = await prisma.$transaction(async (tx) => {
    await tx.family.update({
      where: {
        id: profile.familyId,
      },
      data: {
        enrollmentStage: "Submitted",
      },
    })

    await tx.parentProfile.update({
      where: {
        id: profile.id,
      },
      data: {
        phone: parsed.data.phone,
        billingContact: parsed.data.parentName,
      },
    })

    const record = existingLead
      ? await tx.enrollmentLead.update({
          where: {
            id: existingLead.id,
          },
          data: {
            parentName: parsed.data.parentName,
            familyName: parsed.data.familyName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            childName,
            childAgeLabel: parsed.data.childAgeLabel,
            requestedStart: parsed.data.requestedStart,
            programInterest: parsed.data.programInterest,
            source: "Parent dashboard",
            stage: "APPLICATION_SENT",
            priority: existingLead.priority,
            assignedTo: existingLead.assignedTo,
            note: serializedNote,
            scheduleNeed: parsed.data.scheduleNeed,
          },
          select: {
            id: true,
          },
        })
      : await tx.enrollmentLead.create({
          data: {
            familyId: profile.familyId,
            parentName: parsed.data.parentName,
            familyName: parsed.data.familyName,
            email: parsed.data.email,
            phone: parsed.data.phone,
            childName,
            childAgeLabel: parsed.data.childAgeLabel,
            requestedStart: parsed.data.requestedStart,
            programInterest: parsed.data.programInterest,
            source: "Parent dashboard",
            leadType: "CONTACT",
            stage: "APPLICATION_SENT",
            priority: "NORMAL",
            assignedTo: "Admissions",
            note: serializedNote,
            scheduleNeed: parsed.data.scheduleNeed,
          },
          select: {
            id: true,
          },
        })

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "parent.enrollment.submit",
        subjectType: "EnrollmentLead",
        subjectId: record.id,
        details: {
          familyId: profile.familyId,
          childName,
          requestedStart: parsed.data.requestedStart,
        },
      },
    })

    return record
  })

  // Phase 5 mirror: write to the canonical EnrollmentApplication and mark submitted.
  try {
    const application = await upsertEnrollmentApplicationDraft(
      buildApplicationDraftInput(profile.familyId, profile.id, values, {
        parentName: parsed.data.parentName,
        familyName: parsed.data.familyName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        childFirstName: parsed.data.childFirstName,
        childLastName: parsed.data.childLastName ?? "",
        childAgeLabel: parsed.data.childAgeLabel,
        programInterest: parsed.data.programInterest,
        scheduleNeed: parsed.data.scheduleNeed,
      })
    )
    await transitionApplicationToSubmitted(application.id)
  } catch (mirrorError) {
    console.error("EnrollmentApplication mirror failed (submit):", mirrorError)
  }

  revalidatePaths([
    "/parent",
    "/parent/enrollment",
    "/parent/billing",
    "/admin",
    "/admin/enrollment",
  ])

  return getMutationState({
    success: true,
    message: "Enrollment submitted.",
    entityId: lead.id,
  })
}

export async function deleteEnrollmentApplicationDraft(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()
  const parsed = deleteEnrollmentApplicationDraftSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "That application could not be removed.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const lead = await prisma.enrollmentLead.findFirst({
    where: {
      id: parsed.data.leadId,
      familyId: profile.familyId,
      leadType: {
        not: "WAITLIST",
      },
    },
    select: {
      id: true,
      childName: true,
      stage: true,
    },
  })

  if (!lead) {
    return getMutationState({
      error: "That child application could not be found.",
    })
  }

  if (lead.stage === "APPLICATION_SENT" || lead.stage === "ACCEPTED") {
    return getMutationState({
      error: "Submitted applications cannot be deleted from the dashboard. Contact admissions if you need help.",
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.delete({
      where: {
        id: lead.id,
      },
    })

    const remainingLeadCount = await tx.enrollmentLead.count({
      where: {
        familyId: profile.familyId,
        leadType: {
          not: "WAITLIST",
        },
      },
    })

    if (remainingLeadCount === 0) {
      await tx.family.update({
        where: {
          id: profile.familyId,
        },
        data: {
          enrollmentStage: "Account created",
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "parent.enrollment.draft.delete",
        subjectType: "EnrollmentLead",
        subjectId: lead.id,
        details: {
          familyId: profile.familyId,
          childName: lead.childName,
        },
      },
    })
  })

  revalidatePaths([
    "/parent",
    "/parent/enrollment",
    "/admin",
    "/admin/enrollment",
  ])

  return getMutationState({
    success: true,
    message: "Application removed.",
  })
}

export async function sendParentReply(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = sendParentReplySchema.safeParse({
    threadId: getStringValue(formData, "threadId"),
    body: getStringValue(formData, "body"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Write a reply before sending it.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const thread = await prisma.messageThread.findFirst({
    where: {
      id: parsed.data.threadId,
      familyId: profile.familyId,
    },
    select: {
      id: true,
      subject: true,
    },
  })

  if (!thread) {
    return getMutationState({
      error: "That conversation could not be found.",
    })
  }

  await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId: thread.id,
        authorUserId: user.id,
        senderName: profile.user.name,
        role: "PARENT",
        body: parsed.data.body,
      },
    }),
    prisma.messageThread.update({
      where: {
        id: thread.id,
      },
      data: {
        status: "ACTIVE",
        lastMessageAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "parent.messages.reply",
        subjectType: "MessageThread",
        subjectId: thread.id,
        details: {
          subject: thread.subject,
        },
      },
    }),
  ])

  revalidatePaths([
    "/parent",
    "/parent/messages",
  ])

  return getMutationState({
    success: true,
    message: "Reply sent.",
  })
}

export async function updateParentSettings(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = updateParentSettingsSchema.safeParse({
    phone: getStringValue(formData, "phone"),
    billingContact: getStringValue(formData, "billingContact"),
    notificationPreferenceIds: getStringListValue(formData, "notificationPreferenceIds"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted settings and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const currentPreferences = Array.isArray(profile.notificationPreferences)
    ? profile.notificationPreferences.map((item: unknown) => {
        const row = item as {
          id?: string
          label?: string
          description?: string
          enabled?: boolean
        }

        return {
          id: String(row.id ?? ""),
          label: String(row.label ?? ""),
          description: String(row.description ?? ""),
          enabled: parsed.data.notificationPreferenceIds.includes(String(row.id ?? "")),
        }
      })
    : []

  await prisma.parentProfile.update({
    where: {
      id: profile.id,
    },
    data: {
      phone: parsed.data.phone,
      billingContact: parsed.data.billingContact,
      notificationPreferences: currentPreferences,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "parent.settings.update",
      subjectType: "ParentProfile",
      subjectId: profile.id,
      details: {
        phone: parsed.data.phone,
        billingContact: parsed.data.billingContact,
        notificationPreferenceIds: parsed.data.notificationPreferenceIds,
      },
    },
  })

  revalidatePaths([
    "/parent",
    "/parent/settings",
    "/parent/billing",
  ])

  return getMutationState({
    success: true,
    message: "Family settings saved.",
  })
}

export async function upsertAuthorizedPickup(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = upsertAuthorizedPickupSchema.safeParse({
    pickupId: getStringValue(formData, "pickupId"),
    childSlug: getStringValue(formData, "childSlug"),
    name: getStringValue(formData, "name"),
    relationship: getStringValue(formData, "relationship"),
    phone: getStringValue(formData, "phone"),
    note: getStringValue(formData, "note"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted pickup details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const child = profile.family.children.find(
    (item: { id: string; slug: string }) => item.slug === parsed.data.childSlug
  )

  if (!child) {
    return getMutationState({
      error: "That child profile could not be found.",
    })
  }

  if (parsed.data.pickupId) {
    const existingPickup = await prisma.authorizedPickup.findFirst({
      where: {
        id: parsed.data.pickupId,
        childId: child.id,
      },
      select: {
        id: true,
      },
    })

    if (!existingPickup) {
      return getMutationState({
        error: "That pickup contact could not be found.",
      })
    }

    await prisma.authorizedPickup.update({
      where: {
        id: existingPickup.id,
      },
      data: {
        name: parsed.data.name,
        relationship: parsed.data.relationship,
        phone: parsed.data.phone,
        note: parsed.data.note ?? null,
      },
    })
  } else {
    await prisma.authorizedPickup.create({
      data: {
        childId: child.id,
        name: parsed.data.name,
        relationship: parsed.data.relationship,
        phone: parsed.data.phone,
        note: parsed.data.note ?? null,
      },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: parsed.data.pickupId
        ? "parent.pickups.update"
        : "parent.pickups.create",
      subjectType: "AuthorizedPickup",
      subjectId: parsed.data.pickupId ?? child.id,
      details: {
        childSlug: child.slug,
        name: parsed.data.name,
      },
    },
  })

  revalidatePaths([
    `/parent/child/${child.slug}`,
    "/parent/settings",
  ])

  return getMutationState({
    success: true,
    message: parsed.data.pickupId ? "Pickup contact updated." : "Pickup contact added.",
  })
}

export async function deleteAuthorizedPickup(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = deleteAuthorizedPickupSchema.safeParse({
    pickupId: getStringValue(formData, "pickupId"),
    childSlug: getStringValue(formData, "childSlug"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "That pickup contact could not be removed.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const child = profile.family.children.find(
    (item: { id: string; slug: string }) => item.slug === parsed.data.childSlug
  )

  if (!child) {
    return getMutationState({
      error: "That child profile could not be found.",
    })
  }

  const pickup = await prisma.authorizedPickup.findFirst({
    where: {
      id: parsed.data.pickupId,
      childId: child.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (!pickup) {
    return getMutationState({
      error: "That pickup contact could not be found.",
    })
  }

  await prisma.authorizedPickup.delete({
    where: {
      id: pickup.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "parent.pickups.delete",
      subjectType: "AuthorizedPickup",
      subjectId: pickup.id,
      details: {
        childSlug: child.slug,
        name: pickup.name,
      },
    },
  })

  revalidatePaths([
    `/parent/child/${child.slug}`,
    "/parent/settings",
  ])

  return getMutationState({
    success: true,
    message: "Pickup contact removed.",
  })
}

export async function submitParentDocumentUpload(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = submitDocumentUploadSchema.safeParse({
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

  const document = await prisma.document.findFirst({
    where: {
      id: parsed.data.documentId,
      familyId: profile.familyId,
    },
    select: {
      id: true,
      title: true,
      blobPathname: true,
    },
  })

  if (!document) {
    return getMutationState({
      error: "That document request could not be found.",
    })
  }

  if (document.blobPathname && document.blobPathname !== parsed.data.blobPathname) {
    await deleteBlobIfConfigured(document.blobPathname)
  }

  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      status: "SUBMITTED",
      fileName: parsed.data.fileName,
      blobPathname: parsed.data.blobPathname,
      blobUrl: parsed.data.blobUrl,
      blobDownloadUrl: parsed.data.blobDownloadUrl,
      contentType: parsed.data.contentType,
      sizeBytes: parsed.data.sizeBytes,
      submittedAt: new Date(),
      note: "Submitted by family and ready for school review.",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "parent.documents.submit",
      subjectType: "Document",
      subjectId: document.id,
      details: {
        title: document.title,
        fileName: parsed.data.fileName,
      },
    },
  })

  revalidatePaths([
    "/parent",
    "/parent/forms",
    "/admin/documents",
    "/admin/children",
  ])

  return getMutationState({
    success: true,
    message: "Document uploaded and sent for review.",
  })
}

export async function submitParentDocumentTypedSignature(
  _previousState: ParentActionState,
  formData: FormData
): Promise<ParentActionState> {
  const { user, profile } = await getParentActionContext()

  const parsed = submitDocumentTypedSignatureSchema.safeParse({
    documentId: getStringValue(formData, "documentId"),
    signerName: getStringValue(formData, "signerName"),
    acknowledged: getStringValue(formData, "acknowledged"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Type your name and confirm the acknowledgement to sign.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const document = await prisma.document.findFirst({
    where: {
      id: parsed.data.documentId,
      familyId: profile.familyId,
    },
    select: { id: true, title: true },
  })

  if (!document) {
    return getMutationState({
      error: "That document request could not be found.",
    })
  }

  const headerStore = await headers()
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null

  await prisma.document.update({
    where: { id: document.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      signedName: parsed.data.signerName,
      signedAt: new Date(),
      signedIp: ipAddress,
      note: "Signed in-portal by the family — ready for school review.",
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "parent.documents.signed",
      subjectType: "Document",
      subjectId: document.id,
      details: {
        title: document.title,
        signerName: parsed.data.signerName,
      },
    },
  })

  revalidatePaths([
    "/parent",
    "/parent/forms",
    "/parent/documents",
    "/admin/documents",
    "/admin/children",
  ])

  return getMutationState({
    success: true,
    message: "Signed and sent to the school for review.",
  })
}
