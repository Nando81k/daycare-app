"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

import {
  buildInvoiceNumber,
  calculateDepositCents,
} from "@/lib/billing-calculations"
import { db } from "@/lib/db"
import {
  sendApplicationAcknowledgementEmail,
  sendApplicationStatusEmail,
  sendDepositInvoiceEmail,
} from "@/lib/email"
import { requireCurrentUser, requireRole } from "@/lib/dal/auth"
import {
  acceptApplicationSchema,
  enrollmentApplicationSchema,
  enrollmentDocumentSchema,
  updateApplicationStatusSchema,
} from "@/lib/validators/enrollment"

export type EnrollmentActionState = {
  error?: string
  success?: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : ""
}

function parseDocuments(raw: string) {
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    const result = enrollmentDocumentSchema.array().safeParse(parsed)
    if (!result.success) {
      return []
    }

    return result.data
  } catch {
    return []
  }
}

function toEmergencyContacts(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return {
      notes: value,
    }
  }
}

export async function createEnrollmentApplication(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("PARENT")

  const documents = parseDocuments(asString(formData.get("documents")))
  const parsed = enrollmentApplicationSchema.safeParse({
    primaryContactName: asString(formData.get("primaryContactName")),
    primaryContactEmail: asString(formData.get("primaryContactEmail")),
    primaryContactPhone: asString(formData.get("primaryContactPhone")),
    secondaryContactName: asString(formData.get("secondaryContactName")) || undefined,
    secondaryContactPhone: asString(formData.get("secondaryContactPhone")) || undefined,
    childFirstName: asString(formData.get("childFirstName")),
    childLastName: asString(formData.get("childLastName")),
    childBirthDate: asString(formData.get("childBirthDate")),
    desiredProgramSlug: asString(formData.get("desiredProgramSlug")),
    desiredStartDate: asString(formData.get("desiredStartDate")),
    careSchedule: asString(formData.get("careSchedule")) || undefined,
    tourPreference: asString(formData.get("tourPreference")) || undefined,
    allergies: asString(formData.get("allergies")) || undefined,
    medicalNotes: asString(formData.get("medicalNotes")) || undefined,
    emergencyContacts: asString(formData.get("emergencyContacts")),
    additionalNotes: asString(formData.get("additionalNotes")) || undefined,
    consentPolicies: formData.get("consentPolicies") === "on",
    consentPhoto: formData.get("consentPhoto") === "on",
    documents,
  })

  if (!parsed.success) {
    throw new Error("Please review the enrollment form details.")
  }

  const householdId = actor.householdId
    ? actor.householdId
    : (
        await db.household.create({
          data: {
            name: `${parsed.data.primaryContactName.split(" ")[0]} household`,
            billingEmail: parsed.data.primaryContactEmail,
            phone: parsed.data.primaryContactPhone,
          },
        })
      ).id

  if (!actor.householdId) {
    await db.user.update({
      where: { id: actor.id },
      data: { householdId },
    })

    await db.householdMember.upsert({
      where: {
        householdId_userId: {
          householdId,
          userId: actor.id,
        },
      },
      create: {
        householdId,
        userId: actor.id,
        relationship: "Parent",
        isPrimary: true,
      },
      update: {
        relationship: "Parent",
        isPrimary: true,
      },
    })
  }

  const application = await db.enrollmentApplication.create({
    data: {
      parentUserId: actor.id,
      householdId,
      status: "SUBMITTED",
      primaryContactName: parsed.data.primaryContactName,
      primaryContactEmail: parsed.data.primaryContactEmail,
      primaryContactPhone: parsed.data.primaryContactPhone,
      secondaryContactName: parsed.data.secondaryContactName,
      secondaryContactPhone: parsed.data.secondaryContactPhone,
      childFirstName: parsed.data.childFirstName,
      childLastName: parsed.data.childLastName,
      childBirthDate: parsed.data.childBirthDate,
      desiredProgramSlug: parsed.data.desiredProgramSlug,
      desiredStartDate: parsed.data.desiredStartDate,
      careSchedule: parsed.data.careSchedule,
      tourPreference: parsed.data.tourPreference,
      allergies: parsed.data.allergies,
      medicalNotes: parsed.data.medicalNotes,
      emergencyContacts: toEmergencyContacts(parsed.data.emergencyContacts),
      consentPolicies: parsed.data.consentPolicies,
      consentPhoto: parsed.data.consentPhoto,
      additionalNotes: parsed.data.additionalNotes,
      documents: {
        create: parsed.data.documents.map((document) => ({
          uploadedByUserId: actor.id,
          blobUrl: document.blobUrl,
          blobPath: document.blobPath,
          fileName: document.fileName,
          mimeType: document.mimeType,
          sizeBytes: document.sizeBytes,
          type: document.type,
          status: "UPLOADED",
        })),
      },
      events: {
        create: {
          actorUserId: actor.id,
          status: "SUBMITTED",
          title: "Application submitted",
          detail: "Parent submitted a full intake packet.",
        },
      },
    },
  })

  await sendApplicationAcknowledgementEmail({
    to: parsed.data.primaryContactEmail,
    parentName: parsed.data.primaryContactName,
  })

  await db.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: "ENROLLMENT_APPLICATION_CREATED",
      entityType: "EnrollmentApplication",
      entityId: application.id,
      metadata: {
        desiredProgramSlug: parsed.data.desiredProgramSlug,
      },
    },
  })

  revalidatePath("/parent/enrollment")
  revalidatePath("/admin/enrollment")
}

export async function updateApplicationStatus(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("ADMIN")

  const parsed = updateApplicationStatusSchema.safeParse({
    applicationId: asString(formData.get("applicationId")),
    status: asString(formData.get("status")),
    reviewNote: asString(formData.get("reviewNote")) || undefined,
  })

  if (!parsed.success) {
    throw new Error("Invalid status update request.")
  }

  const application = await db.enrollmentApplication.update({
    where: { id: parsed.data.applicationId },
    data: {
      status: parsed.data.status,
      reviewNote: parsed.data.reviewNote,
      reviewedAt: new Date(),
      events: {
        create: {
          actorUserId: actor.id,
          status: parsed.data.status,
          title: `Status moved to ${parsed.data.status.replaceAll("_", " ").toLowerCase()}`,
          detail: parsed.data.reviewNote,
        },
      },
    },
  })

  await sendApplicationStatusEmail({
    to: application.primaryContactEmail,
    statusLabel: parsed.data.status.replaceAll("_", " ").toLowerCase(),
    note: parsed.data.reviewNote,
  })

  await db.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: "ENROLLMENT_APPLICATION_STATUS_UPDATED",
      entityType: "EnrollmentApplication",
      entityId: application.id,
      metadata: {
        status: parsed.data.status,
      },
    },
  })

  revalidatePath("/admin/enrollment")
  revalidatePath("/parent/enrollment")
}

export async function acceptApplication(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("ADMIN")

  const parsed = acceptApplicationSchema.safeParse({
    applicationId: asString(formData.get("applicationId")),
    tuitionPlanId: asString(formData.get("tuitionPlanId")) || undefined,
  })

  if (!parsed.success) {
    throw new Error("Invalid acceptance request.")
  }

  const application = await db.enrollmentApplication.findUnique({
    where: { id: parsed.data.applicationId },
    include: {
      enrollment: true,
    },
  })

  if (!application) {
    throw new Error("Application not found.")
  }

  if (application.enrollment) {
    throw new Error("Application is already accepted.")
  }

  const tuitionPlan =
    (parsed.data.tuitionPlanId
      ? await db.tuitionPlan.findUnique({ where: { id: parsed.data.tuitionPlanId } })
      : await db.tuitionPlan.findFirst({
          where: {
            slug: application.desiredProgramSlug,
            isActive: true,
          },
        })) ??
    (await db.tuitionPlan.findFirst({ where: { isActive: true } }))

  if (!tuitionPlan) {
    throw new Error("No active tuition plan is configured.")
  }

  const now = new Date()
  const dueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  const depositCents = calculateDepositCents({
    weeklyRateCents: tuitionPlan.weeklyRateCents,
    depositWeeks: tuitionPlan.depositWeeks,
  })

  const created = await db.$transaction(async (tx) => {
    const child = await tx.child.create({
      data: {
        householdId: application.householdId,
        firstName: application.childFirstName,
        lastName: application.childLastName,
        birthDate: application.childBirthDate,
        startDate: application.desiredStartDate,
        allergies: application.allergies,
        medicalNotes: application.medicalNotes,
        emergencyNotes: application.additionalNotes,
        authorizedPickup: application.emergencyContacts as Prisma.InputJsonValue,
      },
    })

    const enrollment = await tx.enrollment.create({
      data: {
        householdId: application.householdId,
        childId: child.id,
        tuitionPlanId: tuitionPlan.id,
        sourceApplicationId: application.id,
        status: "PENDING",
        startDate: application.desiredStartDate,
        weeklyRateCents: tuitionPlan.weeklyRateCents,
        monthlyRateCents: tuitionPlan.monthlyRateCents,
      },
    })

    const monthlyCount = await tx.invoice.count({
      where: {
        issueDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      },
    })

    const invoiceNumber = buildInvoiceNumber({
      sequence: monthlyCount + 1,
      issueDate: now,
    })

    const invoice = await tx.invoice.create({
      data: {
        householdId: application.householdId,
        createdByUserId: actor.id,
        sourceApplicationId: application.id,
        invoiceNumber,
        status: "OPEN",
        issueDate: now,
        dueDate,
        periodStart: now,
        periodEnd: now,
        subtotalCents: depositCents,
        totalCents: depositCents,
        paidCents: 0,
        currency: "usd",
        isDeposit: true,
      },
    })

    await tx.invoiceLineItem.create({
      data: {
        invoiceId: invoice.id,
        enrollmentId: enrollment.id,
        tuitionPlanId: tuitionPlan.id,
        description: `${tuitionPlan.name} enrollment deposit (${tuitionPlan.depositWeeks} weeks)`,
        quantity: 1,
        unitAmountCents: depositCents,
        totalCents: depositCents,
        serviceStartDate: application.desiredStartDate,
        serviceEndDate: application.desiredStartDate,
      },
    })

    await tx.enrollmentApplication.update({
      where: { id: application.id },
      data: {
        status: "ACCEPTED",
        reviewedAt: now,
        reviewNote: "Application accepted. Deposit invoice generated.",
        events: {
          create: {
            actorUserId: actor.id,
            status: "ACCEPTED",
            title: "Application accepted",
            detail: `Deposit invoice ${invoiceNumber} generated.`,
          },
        },
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: actor.id,
        action: "ENROLLMENT_APPLICATION_ACCEPTED",
        entityType: "EnrollmentApplication",
        entityId: application.id,
        metadata: {
          enrollmentId: enrollment.id,
          invoiceId: invoice.id,
          invoiceNumber,
          depositCents,
        },
      },
    })

    return { invoice }
  })

  await sendApplicationStatusEmail({
    to: application.primaryContactEmail,
    statusLabel: "accepted",
    note: "Deposit invoice has been generated.",
  })

  await sendDepositInvoiceEmail({
    to: application.primaryContactEmail,
    invoiceNumber: created.invoice.invoiceNumber,
    amountCents: created.invoice.totalCents,
  })

  revalidatePath("/admin/enrollment")
  revalidatePath("/admin/billing")
  revalidatePath("/parent/enrollment")
  revalidatePath("/parent/billing")
}
