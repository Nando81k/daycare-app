"use server"

import { revalidatePath } from "next/cache"
import { TZDate } from "react-day-picker"

import {
  buildAppUrl,
  isResendConfigured,
} from "@/lib/env"
import { requireRole, createAccountInviteToken, createUserWithInvite } from "@/lib/auth"
import { getEnrollmentLeadDetail } from "@/lib/dal/admin"
import { prisma } from "@/lib/db"
import { sendTransactionalEmail } from "@/lib/email"
import {
  acceptEnrollmentApplicationSchema,
  addFamilyNoteSchema,
  approveEnrollmentApplicationSchema,
  deleteFamilyNoteSchema,
  assignStaffClassroomSchema,
  createClassroomSchema,
  createStaffMemberSchema,
  removeClassroomSchema,
  removeStaffMemberSchema,
  updateClassroomSchema,
  updateStaffMemberSchema,
  declineEnrollmentApplicationSchema,
  createCalendarEventSchema,
  createAnnouncementSchema,
  createDocumentRequestSchema,
  createInvoiceSchema,
  deleteCalendarEventSchema,
  reviewDocumentSchema,
  createAdminThreadSchema,
  sendAdminReplySchema,
  updateCalendarEventSchema,
  updateAnnouncementSchema,
  updateChildProfileSchema,
  upsertChildDailyReportSchema,
  updateEnrollmentLeadSchema,
  updateFamilyStageSchema,
  updateSchoolSettingSchema,
  updateWaitlistEntrySchema,
  upsertAttendanceRecordSchema,
  upsertProgramSchema,
  upsertScheduleSchema,
  upsertProgramRateSchema,
} from "@/lib/validators/admin"
import { createDailyReportPhotoSchema } from "@/lib/validators/parent"
import type { AdminActionState } from "@/types/app"

const SCHOOL_TIME_ZONE = "America/New_York"

function getActionState(overrides?: Partial<AdminActionState>): AdminActionState {
  return {
    success: false,
    message: null,
    error: null,
    fieldErrors: {},
    ...overrides,
  }
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function getFieldErrors(error: {
  flatten: () => {
    fieldErrors: Record<string, string[] | undefined>
  }
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors)
      .map(([key, value]) => [key, value?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
  )
}

function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path)
  }
}

function getTodayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  return { start, end }
}

function getDayRange(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map((p) => Number(p))
  const start = new Date(year, month - 1, day)
  const end = new Date(year, month - 1, day + 1)
  return { start, end }
}

function buildSchoolDateFromDateInput(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number(part))
  return new TZDate(year, month - 1, day, 12, 0, 0, 0, SCHOOL_TIME_ZONE)
}

function buildSchoolDateFromDateTimeInput(value: string) {
  const [rawDate, rawTime] = value.split("T")
  const [year, month, day] = rawDate.split("-").map((part) => Number(part))
  const [hours, minutes] = rawTime.split(":").map((part) => Number(part))

  return new TZDate(year, month - 1, day, hours, minutes, 0, 0, SCHOOL_TIME_ZONE)
}

function formatTimeLabelFromInput(value: string) {
  const [hoursPart, minutes] = value.split("T")[1].split(":")
  const rawHours = Number(hoursPart)
  const meridiem = rawHours >= 12 ? "PM" : "AM"
  const normalizedHours = rawHours % 12 || 12

  return `${normalizedHours}:${minutes} ${meridiem}`
}

function calendarEventMutationData(values: {
  title: string
  category: "CLASSROOM" | "FAMILY" | "CLOSURE"
  targetScope: "school" | "classroom"
  classroomId?: string
  timeKind: "timed" | "all-day"
  startsAt?: string
  eventDate?: string
  description: string
}) {
  if (values.timeKind === "all-day" && values.eventDate) {
    return {
      title: values.title,
      category: values.category,
      classroomId: values.targetScope === "classroom" ? values.classroomId ?? null : null,
      date: buildSchoolDateFromDateInput(values.eventDate),
      timeLabel: "All day",
      description: values.description,
    }
  }

  return {
    title: values.title,
    category: values.category,
    classroomId: values.targetScope === "classroom" ? values.classroomId ?? null : null,
    date: buildSchoolDateFromDateTimeInput(values.startsAt ?? ""),
    timeLabel: values.startsAt ? formatTimeLabelFromInput(values.startsAt) : "All day",
    description: values.description,
  }
}

function timeToDate(time: string | undefined, day: Date) {
  if (!time) {
    return null
  }

  const [hours, minutes] = time.split(":").map((part) => Number(part))
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0)
}

function getTodayReportDate() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
}

function getStructuredLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseDailyMeals(value: string) {
  return getStructuredLines(value).map((line) => {
    const [time, label, details, status] = line.split("|").map((part) => part.trim())
    return {
      time,
      label,
      details,
      status: status.toLowerCase() as "eaten" | "partial" | "skipped",
    }
  })
}

function parseDailyRest(value: string) {
  return getStructuredLines(value).map((line) => {
    const [time, label, duration, note] = line.split("|").map((part) => part.trim())
    return {
      time,
      label,
      duration,
      note,
    }
  })
}

function parseDailyActivities(value: string) {
  return getStructuredLines(value).map((line) => {
    const [time, title, description] = line.split("|").map((part) => part.trim())
    return {
      time,
      title,
      description,
    }
  })
}

function announcementMutationData(values: {
  title: string
  audience: string
  summary: string
  body?: string
  scheduledFor?: string
  intent: "save-draft" | "schedule" | "publish-now"
}) {
  if (values.intent === "publish-now") {
    return {
      title: values.title,
      audience: values.audience,
      summary: values.summary,
      body: values.body ?? null,
      publishStatus: "PUBLISHED" as const,
      scheduledFor: null,
    }
  }

  if (values.intent === "schedule") {
    return {
      title: values.title,
      audience: values.audience,
      summary: values.summary,
      body: values.body ?? null,
      publishStatus: "SCHEDULED" as const,
      scheduledFor: values.scheduledFor ? new Date(values.scheduledFor) : null,
    }
  }

  return {
    title: values.title,
    audience: values.audience,
    summary: values.summary,
    body: values.body ?? null,
    publishStatus: "DRAFT" as const,
    scheduledFor: null,
  }
}

export async function updateEnrollmentLead(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = updateEnrollmentLeadSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    stage: getStringValue(formData, "stage"),
    priority: getStringValue(formData, "priority"),
    assignedTo: getStringValue(formData, "assignedTo"),
    note: getStringValue(formData, "note"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted lead details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingLead = await prisma.enrollmentLead.findUnique({
      where: {
        id: parsed.data.leadId,
      },
      select: {
        id: true,
        familyName: true,
        childName: true,
        leadType: true,
      },
    })

    if (!existingLead || existingLead.leadType === "WAITLIST") {
      return getActionState({
        error: "That enrollment lead could not be found.",
      })
    }

    await prisma.enrollmentLead.update({
      where: {
        id: parsed.data.leadId,
      },
      data: {
        stage: parsed.data.stage,
        priority: parsed.data.priority,
        assignedTo: parsed.data.assignedTo,
        note: parsed.data.note,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.enrollment.update",
        subjectType: "EnrollmentLead",
        subjectId: parsed.data.leadId,
        details: {
          familyName: existingLead.familyName,
          childName: existingLead.childName,
          updates: parsed.data,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/enrollment",
    ])

    return getActionState({
      success: true,
      message: "Lead details saved.",
    })
  } catch {
    return getActionState({
      error: "We could not update this lead right now.",
    })
  }
}

export async function approveEnrollmentApplication(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = approveEnrollmentApplicationSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "That enrollment record could not be approved.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const lead = await prisma.enrollmentLead.findUnique({
    where: {
      id: parsed.data.leadId,
    },
    select: {
      id: true,
      familyId: true,
      familyName: true,
      childName: true,
    },
  })

  if (!lead) {
    return getActionState({
      error: "That enrollment record could not be found.",
    })
  }

  // Pull the active registration fee, if any, to drive the invoice amount.
  const registrationFee = await prisma.feeRule.findFirst({
    where: { kind: "REGISTRATION", isActive: true },
    orderBy: { createdAt: "desc" },
  })

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: {
        id: lead.id,
      },
      data: {
        stage: "ACCEPTED",
        assignedTo: admin.name,
        note: "Approved manually from the admin enrollment view.",
      },
    })

    // Phase 5 mirror: flip any matching EnrollmentApplication to APPROVED.
    if (lead.familyId) {
      await tx.enrollmentApplication.updateMany({
        where: {
          familyId: lead.familyId,
          status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
        },
        data: {
          status: "APPROVED",
          decidedAt: new Date(),
          decidedByUserId: admin.id,
        },
      })

      await tx.family.update({
        where: {
          id: lead.familyId,
        },
        data: {
          enrollmentStage: "Approved",
        },
      })

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)

      await tx.invoice.create({
        data: {
          familyId: lead.familyId,
          label: registrationFee
            ? `${registrationFee.label} – ${lead.childName}`
            : `Enrollment fee – ${lead.childName}`,
          description:
            registrationFee?.description ??
            "Registration fee generated automatically upon enrollment approval.",
          amountCents: registrationFee?.amountCents ?? 15000,
          dueDate,
          status: "OPEN",
          feeRuleId: registrationFee?.id ?? null,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.enrollment.approve",
        subjectType: "EnrollmentLead",
        subjectId: lead.id,
        details: {
          familyId: lead.familyId,
          familyName: lead.familyName,
          childName: lead.childName,
          invoiceGenerated: !!lead.familyId,
          feeRuleId: registrationFee?.id ?? null,
        },
      },
    })
  })

  revalidatePaths([
    "/admin",
    "/admin/enrollment",
    "/parent",
    "/parent/enrollment",
  ])

  return getActionState({
    success: true,
    message: lead.familyId
      ? "Enrollment approved and invoice created."
      : "Enrollment approved.",
  })
}

/**
 * Server-action wrapper around `getEnrollmentLeadDetail` so the admin
 * enrollment drawer can lazy-load the rich application detail + classrooms
 * on open without forcing the list page to fetch everything up front.
 */
export async function loadEnrollmentLeadDetail(leadId: string) {
  await requireRole("ADMIN")
  return getEnrollmentLeadDetail(leadId)
}

function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 6)
}

/**
 * Atomic enrollment acceptance: approves the lead AND creates a `Child` row
 * placed in the chosen classroom AND posts the registration invoice. The
 * admin no longer has to re-enter the child's details on a separate page
 * after approving — this is the single-action conversion.
 */
export async function acceptEnrollmentApplication(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = acceptEnrollmentApplicationSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    classroomId: getStringValue(formData, "classroomId"),
    childFirstName: getStringValue(formData, "childFirstName"),
    childLastName: getStringValue(formData, "childLastName"),
    birthday: getStringValue(formData, "birthday"),
    ageLabel: getStringValue(formData, "ageLabel"),
    startDate: getStringValue(formData, "startDate"),
    summary: getStringValue(formData, "summary"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted fields and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const lead = await prisma.enrollmentLead.findUnique({
    where: { id: parsed.data.leadId },
    select: {
      id: true,
      familyId: true,
      familyName: true,
      childName: true,
      note: true,
    },
  })

  if (!lead) {
    return getActionState({
      error: "That enrollment record could not be found.",
    })
  }

  if (!lead.familyId) {
    return getActionState({
      error:
        "Family record is missing — invite the parent or link a family before approving.",
    })
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: parsed.data.classroomId },
    include: { _count: { select: { children: true } } },
  })

  if (!classroom) {
    return getActionState({
      error: "The selected classroom could not be found.",
    })
  }

  const capacityOverride = classroom._count.children >= classroom.capacity

  // Generate a unique slug; one collision retry is enough in practice.
  const baseSlug = slugifyName(
    `${parsed.data.childFirstName} ${parsed.data.childLastName}`
  )
  let slug = `${baseSlug}-${randomSlugSuffix()}`
  for (let attempt = 0; attempt < 3; attempt++) {
    const collision = await prisma.child.findUnique({ where: { slug } })
    if (!collision) break
    slug = `${baseSlug}-${randomSlugSuffix()}`
  }

  // Best-effort: pull a matching application for any health notes to seed.
  const matchingApp = lead.familyId
    ? await prisma.enrollmentApplication.findFirst({
        where: {
          familyId: lead.familyId,
          childFirstName: parsed.data.childFirstName,
          childLastName: parsed.data.childLastName,
        },
        orderBy: { updatedAt: "desc" },
      })
    : null

  const registrationFee = await prisma.feeRule.findFirst({
    where: { kind: "REGISTRATION", isActive: true },
    orderBy: { createdAt: "desc" },
  })

  const childSummary =
    parsed.data.summary && parsed.data.summary.length > 0
      ? parsed.data.summary
      : "Recently enrolled — update care notes when ready."

  const allergiesSeed: string[] = []
  const medicalNotesSeed: string[] = matchingApp?.healthNotes
    ? [matchingApp.healthNotes]
    : []

  let createdChildId: string | null = null

  await prisma.$transaction(async (tx) => {
    const child = await tx.child.create({
      data: {
        slug,
        familyId: lead.familyId!,
        classroomId: classroom.id,
        firstName: parsed.data.childFirstName,
        lastName: parsed.data.childLastName,
        ageLabel: parsed.data.ageLabel,
        birthday: new Date(parsed.data.birthday),
        teacherLabel: classroom.leadTeacherName || "Lead teacher",
        summary: childSummary,
        allergies: allergiesSeed,
        medicalNotes: medicalNotesSeed,
        comfortNotes: [],
      },
      select: { id: true, firstName: true },
    })
    createdChildId = child.id

    const enrollmentNote = `${lead.note ? lead.note + "\n" : ""}Enrolled in ${classroom.name} by ${admin.name}.`
    await tx.enrollmentLead.update({
      where: { id: lead.id },
      data: {
        stage: "ACCEPTED",
        assignedTo: admin.name,
        note: enrollmentNote,
      },
    })

    await tx.enrollmentApplication.updateMany({
      where: {
        familyId: lead.familyId!,
        status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
        childFirstName: parsed.data.childFirstName,
        childLastName: parsed.data.childLastName,
      },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        decidedByUserId: admin.id,
      },
    })

    await tx.family.update({
      where: { id: lead.familyId! },
      data: { enrollmentStage: "Approved" },
    })

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const childFullName = `${parsed.data.childFirstName} ${parsed.data.childLastName}`.trim()
    await tx.invoice.create({
      data: {
        familyId: lead.familyId!,
        label: registrationFee
          ? `${registrationFee.label} – ${childFullName}`
          : `Registration fee – ${childFullName}`,
        description:
          registrationFee?.description ??
          "Registration fee posted automatically when the family was approved.",
        amountCents: registrationFee?.amountCents ?? 15000,
        dueDate,
        status: "OPEN",
        feeRuleId: registrationFee?.id ?? null,
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.enrollment.accept_and_enroll",
        subjectType: "EnrollmentLead",
        subjectId: lead.id,
        details: {
          childId: child.id,
          classroomId: classroom.id,
          classroomName: classroom.name,
          familyId: lead.familyId,
          familyName: lead.familyName,
          capacityOverride,
        },
      },
    })
  })

  revalidatePaths([
    "/admin",
    "/admin/enrollment",
    `/admin/enrollment/${lead.id}`,
    "/admin/classrooms",
    "/admin/billing",
    "/parent",
  ])

  void createdChildId
  return getActionState({
    success: true,
    message: capacityOverride
      ? `${parsed.data.childFirstName} enrolled in ${classroom.name} (over capacity). Registration fee posted.`
      : `${parsed.data.childFirstName} enrolled in ${classroom.name}. Registration fee posted.`,
  })
}

export async function declineEnrollmentApplication(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = declineEnrollmentApplicationSchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    note: getStringValue(formData, "note"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "That enrollment record could not be declined.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const lead = await prisma.enrollmentLead.findUnique({
    where: {
      id: parsed.data.leadId,
    },
    select: {
      id: true,
      familyId: true,
      familyName: true,
      childName: true,
    },
  })

  if (!lead) {
    return getActionState({
      error: "That enrollment record could not be found.",
    })
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: {
        id: lead.id,
      },
      data: {
        stage: "DENIED",
        assignedTo: admin.name,
        note:
          parsed.data.note ||
          "Declined from the simplified admin enrollment dashboard.",
      },
    })

    if (lead.familyId) {
      // Phase 5 mirror: flip matching application(s) to REJECTED.
      await tx.enrollmentApplication.updateMany({
        where: {
          familyId: lead.familyId,
          status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
        },
        data: {
          status: "REJECTED",
          decidedAt: new Date(),
          decidedByUserId: admin.id,
          decisionNote: parsed.data.note ?? null,
        },
      })

      await tx.family.update({
        where: {
          id: lead.familyId,
        },
        data: {
          enrollmentStage: "Denied",
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.enrollment.decline",
        subjectType: "EnrollmentLead",
        subjectId: lead.id,
        details: {
          familyId: lead.familyId,
          familyName: lead.familyName,
          childName: lead.childName,
        },
      },
    })
  })

  revalidatePaths([
    "/admin",
    "/admin/enrollment",
    "/parent",
    "/parent/enrollment",
  ])

  return getActionState({
    success: true,
    message: "Enrollment declined.",
  })
}

export async function updateWaitlistEntry(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = updateWaitlistEntrySchema.safeParse({
    leadId: getStringValue(formData, "leadId"),
    waitlistStatus: getStringValue(formData, "waitlistStatus"),
    priority: getStringValue(formData, "priority"),
    assignedTo: getStringValue(formData, "assignedTo"),
    note: getStringValue(formData, "note"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted waitlist details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingLead = await prisma.enrollmentLead.findUnique({
      where: {
        id: parsed.data.leadId,
      },
      select: {
        id: true,
        familyName: true,
        childName: true,
        leadType: true,
      },
    })

    if (!existingLead || existingLead.leadType !== "WAITLIST") {
      return getActionState({
        error: "That waitlist entry could not be found.",
      })
    }

    await prisma.enrollmentLead.update({
      where: {
        id: parsed.data.leadId,
      },
      data: {
        waitlistStatus: parsed.data.waitlistStatus,
        priority: parsed.data.priority,
        assignedTo: parsed.data.assignedTo,
        note: parsed.data.note,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.waitlist.update",
        subjectType: "EnrollmentLead",
        subjectId: parsed.data.leadId,
        details: {
          familyName: existingLead.familyName,
          childName: existingLead.childName,
          updates: parsed.data,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/enrollment",
    ])

    return getActionState({
      success: true,
      message: "Waitlist entry saved.",
    })
  } catch {
    return getActionState({
      error: "We could not update this waitlist entry right now.",
    })
  }
}

export async function upsertAttendanceRecord(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = upsertAttendanceRecordSchema.safeParse({
    childId: getStringValue(formData, "childId"),
    status: getStringValue(formData, "status"),
    checkInAt: getStringValue(formData, "checkInAt"),
    checkOutAt: getStringValue(formData, "checkOutAt"),
    note: getStringValue(formData, "note"),
    date: getStringValue(formData, "date") || undefined,
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted attendance details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const child = await prisma.child.findUnique({
      where: {
        id: parsed.data.childId,
      },
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!child) {
      return getActionState({
        error: "That child could not be found.",
      })
    }

    const { start, end } = parsed.data.date
      ? getDayRange(parsed.data.date)
      : getTodayRange()
    const checkInAt = timeToDate(parsed.data.checkInAt, start)
    const checkOutAt = timeToDate(parsed.data.checkOutAt, start)
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        childId: parsed.data.childId,
        date: {
          gte: start,
          lt: end,
        },
      },
      select: {
        id: true,
      },
    })

    if (existingRecord) {
      await prisma.attendanceRecord.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          status: parsed.data.status,
          checkInAt,
          checkOutAt,
          note: parsed.data.note,
          date: start,
        },
      })
    } else {
      await prisma.attendanceRecord.create({
        data: {
          childId: parsed.data.childId,
          date: start,
          status: parsed.data.status,
          checkInAt,
          checkOutAt,
          note: parsed.data.note,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.attendance.upsert",
        subjectType: "AttendanceRecord",
        subjectId: existingRecord?.id ?? parsed.data.childId,
        details: {
          childName: `${child.firstName} ${child.lastName}`,
          updates: parsed.data,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/attendance",
        "/admin/reports",
      "/parent",
      "/parent/attendance",
      `/parent/child/${child.slug}`,
    ])

    return getActionState({
      success: true,
      message: "Attendance updated.",
    })
  } catch {
    return getActionState({
      error: "We could not update attendance right now.",
    })
  }
}

export async function createCalendarEvent(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = createCalendarEventSchema.safeParse({
    title: getStringValue(formData, "title"),
    category: getStringValue(formData, "category"),
    targetScope: getStringValue(formData, "targetScope"),
    classroomId: getStringValue(formData, "classroomId"),
    timeKind: getStringValue(formData, "timeKind"),
    startsAt: getStringValue(formData, "startsAt"),
    eventDate: getStringValue(formData, "eventDate"),
    description: getStringValue(formData, "description"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted event details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const classroom =
      parsed.data.targetScope === "classroom" && parsed.data.classroomId
        ? await prisma.classroom.findUnique({
            where: {
              id: parsed.data.classroomId,
            },
            select: {
              id: true,
              name: true,
            },
          })
        : null

    if (parsed.data.targetScope === "classroom" && !classroom) {
      return getActionState({
        error: "That classroom could not be found.",
      })
    }

    const event = await prisma.calendarEvent.create({
      data: calendarEventMutationData(parsed.data),
      select: {
        id: true,
        title: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.calendar.create",
        subjectType: "CalendarEvent",
        subjectId: event.id,
        details: {
          title: event.title,
          category: parsed.data.category,
          targetScope: parsed.data.targetScope,
          classroom: classroom?.name ?? null,
          timeKind: parsed.data.timeKind,
        },
      },
    })

    revalidatePaths([
      "/admin/calendar",
      "/parent",
      "/parent/calendar",
    ])

    return getActionState({
      success: true,
      message: "Calendar event created.",
    })
  } catch {
    return getActionState({
      error: "We could not create this calendar event right now.",
    })
  }
}

export async function updateCalendarEvent(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = updateCalendarEventSchema.safeParse({
    eventId: getStringValue(formData, "eventId"),
    title: getStringValue(formData, "title"),
    category: getStringValue(formData, "category"),
    targetScope: getStringValue(formData, "targetScope"),
    classroomId: getStringValue(formData, "classroomId"),
    timeKind: getStringValue(formData, "timeKind"),
    startsAt: getStringValue(formData, "startsAt"),
    eventDate: getStringValue(formData, "eventDate"),
    description: getStringValue(formData, "description"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted event details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: {
        id: parsed.data.eventId,
      },
      select: {
        id: true,
        title: true,
        category: true,
      },
    })

    if (!existingEvent || existingEvent.category === "BILLING") {
      return getActionState({
        error: "That calendar event could not be found.",
      })
    }

    const classroom =
      parsed.data.targetScope === "classroom" && parsed.data.classroomId
        ? await prisma.classroom.findUnique({
            where: {
              id: parsed.data.classroomId,
            },
            select: {
              id: true,
              name: true,
            },
          })
        : null

    if (parsed.data.targetScope === "classroom" && !classroom) {
      return getActionState({
        error: "That classroom could not be found.",
      })
    }

    await prisma.calendarEvent.update({
      where: {
        id: parsed.data.eventId,
      },
      data: calendarEventMutationData(parsed.data),
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.calendar.update",
        subjectType: "CalendarEvent",
        subjectId: parsed.data.eventId,
        details: {
          previousTitle: existingEvent.title,
          nextTitle: parsed.data.title,
          category: parsed.data.category,
          targetScope: parsed.data.targetScope,
          classroom: classroom?.name ?? null,
          timeKind: parsed.data.timeKind,
        },
      },
    })

    revalidatePaths([
      "/admin/calendar",
      "/parent",
      "/parent/calendar",
    ])

    return getActionState({
      success: true,
      message: "Calendar event saved.",
    })
  } catch {
    return getActionState({
      error: "We could not update this calendar event right now.",
    })
  }
}

export async function deleteCalendarEvent(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = deleteCalendarEventSchema.safeParse({
    eventId: getStringValue(formData, "eventId"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "That calendar event could not be removed.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: {
        id: parsed.data.eventId,
      },
      include: {
        classroom: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!existingEvent || existingEvent.category === "BILLING") {
      return getActionState({
        error: "That calendar event could not be found.",
      })
    }

    await prisma.calendarEvent.delete({
      where: {
        id: parsed.data.eventId,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.calendar.delete",
        subjectType: "CalendarEvent",
        subjectId: parsed.data.eventId,
        details: {
          title: existingEvent.title,
          category: existingEvent.category,
          classroom: existingEvent.classroom?.name ?? null,
        },
      },
    })

    revalidatePaths([
      "/admin/calendar",
      "/parent",
      "/parent/calendar",
    ])

    return getActionState({
      success: true,
      message: "Calendar event removed.",
    })
  } catch {
    return getActionState({
      error: "We could not delete this calendar event right now.",
    })
  }
}

export async function createAnnouncement(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = createAnnouncementSchema.safeParse({
    title: getStringValue(formData, "title"),
    audience: getStringValue(formData, "audience"),
    summary: getStringValue(formData, "summary"),
    body: getStringValue(formData, "body"),
    scheduledFor: getStringValue(formData, "scheduledFor"),
    intent: getStringValue(formData, "intent"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted announcement details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const announcement = await prisma.announcement.create({
      data: announcementMutationData(parsed.data),
      select: {
        id: true,
        title: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.announcement.create",
        subjectType: "Announcement",
        subjectId: announcement.id,
        details: {
          title: announcement.title,
          intent: parsed.data.intent,
          audience: parsed.data.audience,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/communications",
    ])

    return getActionState({
      success: true,
      message:
        parsed.data.intent === "publish-now"
          ? "Announcement published."
          : parsed.data.intent === "schedule"
            ? "Announcement scheduled."
            : "Draft saved.",
    })
  } catch {
    return getActionState({
      error: "We could not save this announcement right now.",
    })
  }
}

export async function updateAnnouncement(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = updateAnnouncementSchema.safeParse({
    announcementId: getStringValue(formData, "announcementId"),
    title: getStringValue(formData, "title"),
    audience: getStringValue(formData, "audience"),
    summary: getStringValue(formData, "summary"),
    body: getStringValue(formData, "body"),
    scheduledFor: getStringValue(formData, "scheduledFor"),
    intent: getStringValue(formData, "intent"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted announcement details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: parsed.data.announcementId,
      },
      select: {
        id: true,
        title: true,
        publishStatus: true,
      },
    })

    if (!existingAnnouncement) {
      return getActionState({
        error: "That announcement could not be found.",
      })
    }

    if (existingAnnouncement.publishStatus === "PUBLISHED") {
      return getActionState({
        error: "Published announcements are read-only in this phase.",
      })
    }

    await prisma.announcement.update({
      where: {
        id: parsed.data.announcementId,
      },
      data: announcementMutationData(parsed.data),
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.announcement.update",
        subjectType: "Announcement",
        subjectId: parsed.data.announcementId,
        details: {
          title: existingAnnouncement.title,
          intent: parsed.data.intent,
          updates: {
            title: parsed.data.title,
            audience: parsed.data.audience,
            summary: parsed.data.summary,
            scheduledFor: parsed.data.scheduledFor,
          },
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/communications",
    ])

    return getActionState({
      success: true,
      message:
        parsed.data.intent === "publish-now"
          ? "Announcement published."
          : parsed.data.intent === "schedule"
            ? "Announcement scheduled."
            : "Draft saved.",
    })
  } catch {
    return getActionState({
      error: "We could not update this announcement right now.",
    })
  }
}

export async function updateSchoolSettingValue(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = updateSchoolSettingSchema.safeParse({
    settingId: getStringValue(formData, "settingId"),
    value: getStringValue(formData, "value"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted setting and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const existingSetting = await prisma.schoolSetting.findUnique({
      where: {
        id: parsed.data.settingId,
      },
      select: {
        id: true,
        label: true,
      },
    })

    if (!existingSetting) {
      return getActionState({
        error: "That setting could not be found.",
      })
    }

    await prisma.schoolSetting.update({
      where: {
        id: parsed.data.settingId,
      },
      data: {
        value: parsed.data.value,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.setting.update",
        subjectType: "SchoolSetting",
        subjectId: parsed.data.settingId,
        details: {
          label: existingSetting.label,
          value: parsed.data.value,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/settings",
    ])

    return getActionState({
      success: true,
      message: "Setting updated.",
    })
  } catch {
    return getActionState({
      error: "We could not update this setting right now.",
    })
  }
}

export async function reviewDocumentSubmission(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = reviewDocumentSchema.safeParse({
    documentId: getStringValue(formData, "documentId"),
    intent: getStringValue(formData, "intent"),
    note: getStringValue(formData, "note"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted review details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const document = await prisma.document.findUnique({
      where: {
        id: parsed.data.documentId,
      },
      include: {
        child: {
          select: {
            slug: true,
          },
        },
      },
    })

    if (!document) {
      return getActionState({
        error: "That document could not be found.",
      })
    }

    await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        status: parsed.data.intent === "approve" ? "APPROVED" : "REQUIRED",
        approvedAt: parsed.data.intent === "approve" ? new Date() : null,
        reviewedByName: admin.name,
        note: parsed.data.note,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action:
          parsed.data.intent === "approve"
            ? "admin.documents.approve"
            : "admin.documents.request-resubmission",
        subjectType: "Document",
        subjectId: document.id,
        details: {
          title: document.title,
          note: parsed.data.note,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/documents",
        "/parent",
      "/parent/forms",
      document.child?.slug ? `/parent/child/${document.child.slug}` : "/parent",
    ])

    return getActionState({
      success: true,
      message: parsed.data.intent === "approve" ? "Document approved." : "Family asked to resubmit.",
    })
  } catch {
    return getActionState({
      error: "We could not update this document right now.",
    })
  }
}

export async function uploadChildDailyReportPhoto(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireRole("ADMIN")

  const parsed = createDailyReportPhotoSchema.safeParse({
    childSlug: getStringValue(formData, "childSlug"),
    title: getStringValue(formData, "title"),
    caption: getStringValue(formData, "caption"),
    fileName: getStringValue(formData, "fileName"),
    blobPathname: getStringValue(formData, "blobPathname"),
    blobUrl: getStringValue(formData, "blobUrl"),
    blobDownloadUrl: getStringValue(formData, "blobDownloadUrl"),
    contentType: getStringValue(formData, "contentType"),
    sizeBytes: getStringValue(formData, "sizeBytes"),
  })

  if (!parsed.success) {
    return getActionState({
      error: "Check the highlighted photo details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  try {
    const child = await prisma.child.findUnique({
      where: {
        slug: parsed.data.childSlug,
      },
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
        dailyReports: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          select: {
            id: true,
            date: true,
            arrivalMood: true,
            summary: true,
            meals: true,
            rest: true,
            activities: true,
            staffNotes: true,
          },
        },
      },
    })

    if (!child) {
      return getActionState({
        error: "That child could not be found.",
      })
    }

    const latestReport = child.dailyReports[0]
    const report =
      latestReport ??
      (await prisma.dailyReport.create({
        data: {
          childId: child.id,
          date: new Date(),
          arrivalMood: "Awaiting classroom update",
          summary: "Photo updates were added before the full classroom summary was written.",
          meals: [],
          rest: [],
          activities: [],
          staffNotes: [],
        },
        select: {
          id: true,
        },
      }))

    await prisma.dailyReportPhoto.create({
      data: {
        dailyReportId: report.id,
        title: parsed.data.title,
        caption: parsed.data.caption ?? null,
        fileName: parsed.data.fileName,
        blobPathname: parsed.data.blobPathname,
        blobUrl: parsed.data.blobUrl,
        blobDownloadUrl: parsed.data.blobDownloadUrl,
        contentType: parsed.data.contentType,
        sizeBytes: parsed.data.sizeBytes,
        uploadedByUserId: admin.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.children.photo.upload",
        subjectType: "Child",
        subjectId: child.id,
        details: {
          childName: `${child.firstName} ${child.lastName}`,
          title: parsed.data.title,
          fileName: parsed.data.fileName,
        },
      },
    })

    revalidatePaths([
      "/admin",
        "/parent",
      `/parent/child/${child.slug}`,
    ])

    return getActionState({
      success: true,
      message: "Photo added to the latest daily report.",
    })
  } catch {
    return getActionState({
      error: "We could not upload this child photo right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Document Request
// ---------------------------------------------------------------------------

export async function createDocumentRequest(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const templateRaw = getStringValue(formData, "template")
    let templateInput: unknown = undefined
    if (templateRaw) {
      try {
        templateInput = JSON.parse(templateRaw)
      } catch {
        return getActionState({
          error: "The uploaded template was not parseable. Try again.",
        })
      }
    }

    const parsed = createDocumentRequestSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      childId: getStringValue(formData, "childId") || undefined,
      title: getStringValue(formData, "title"),
      note: getStringValue(formData, "note"),
      template: templateInput,
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please check the form for errors.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
      include: { children: { select: { id: true, firstName: true, lastName: true } } },
    })

    if (!family) {
      return getActionState({ error: "Family not found." })
    }

    let scopedChildId: string | undefined
    let scopedChildName: string | null = null
    if (parsed.data.childId) {
      const child = family.children.find((c) => c.id === parsed.data.childId)
      if (!child) {
        return getActionState({
          error: "That child is not part of the selected family.",
        })
      }
      scopedChildId = child.id
      scopedChildName = `${child.firstName} ${child.lastName}`.trim()
    }

    const template = parsed.data.template

    await prisma.$transaction([
      prisma.document.create({
        data: {
          familyId: family.id,
          childId: scopedChildId,
          title: parsed.data.title,
          category: "Request",
          owner: "Staff",
          status: "REQUIRED",
          note: parsed.data.note ?? "",
          templateBlobPathname: template?.blobPathname,
          templateBlobUrl: template?.blobUrl,
          templateDownloadUrl: template?.blobDownloadUrl,
          templateFileName: template?.fileName,
          templateContentType: template?.contentType,
          templateSizeBytes: template?.sizeBytes,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "document.request_created",
          subjectType: "Document",
          details: {
            familyName: family.familyName,
            childId: scopedChildId ?? null,
            childName: scopedChildName,
            title: parsed.data.title,
            hasTemplate: Boolean(template),
            templateFileName: template?.fileName ?? null,
          },
        },
      }),
    ])

    revalidatePaths(["/admin", "/admin/documents", "/parent"])

    return getActionState({
      success: true,
      message: "Document request sent to the family.",
    })
  } catch {
    return getActionState({
      error: "We could not create this document request right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export async function createInvoice(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = createInvoiceSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      description: getStringValue(formData, "description"),
      amountCents: getStringValue(formData, "amountCents"),
      dueDate: getStringValue(formData, "dueDate"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please check the form for errors.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
    })

    if (!family) {
      return getActionState({ error: "Family not found." })
    }

    if (!parsed.data.dueDate) {
      return getActionState({ error: "Due date is required." })
    }

    const dueDate = new TZDate(parsed.data.dueDate, SCHOOL_TIME_ZONE)

    await prisma.$transaction([
      prisma.invoice.create({
        data: {
          familyId: family.id,
          label: parsed.data.description,
          description: parsed.data.description,
          amountCents: parsed.data.amountCents,
          dueDate,
          status: "DRAFT",
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "invoice.created",
          subjectType: "Invoice",
          details: {
            familyName: family.familyName,
            description: parsed.data.description,
            amountCents: parsed.data.amountCents,
          },
        },
      }),
    ])

    revalidatePaths(["/admin", "/admin/billing", "/parent"])

    return getActionState({
      success: true,
      message: "Invoice created as a draft.",
    })
  } catch {
    return getActionState({
      error: "We could not create this invoice right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Refund Invoice
// ---------------------------------------------------------------------------

export async function refundInvoiceAction(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")
    const invoiceId = getStringValue(formData, "invoiceId")
    const reason = getStringValue(formData, "reason")

    if (!invoiceId) {
      return getActionState({ error: "Invoice id is required." })
    }

    const { refundInvoice } = await import("@/lib/billing")
    const result = await refundInvoice(invoiceId, {
      reason,
      actorUserId: user.id,
    })

    revalidatePaths(["/admin", "/admin/billing", "/parent", "/parent/billing"])

    return getActionState({
      success: true,
      message: `Refund issued (${result.refundId}).`,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not refund this invoice right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Family Stage
// ---------------------------------------------------------------------------

export async function updateFamilyStage(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = updateFamilyStageSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      enrollmentStage: getStringValue(formData, "enrollmentStage"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please check the form for errors.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
    })

    if (!family) {
      return getActionState({ error: "Family not found." })
    }

    await prisma.$transaction([
      prisma.family.update({
        where: { id: family.id },
        data: { enrollmentStage: parsed.data.enrollmentStage },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "family.stage_updated",
          subjectType: "Family",
          subjectId: family.id,
          details: {
            familyName: family.familyName,
            previousStage: family.enrollmentStage,
            newStage: parsed.data.enrollmentStage,
          },
        },
      }),
    ])

    revalidatePaths(["/admin", "/admin/families", "/admin/enrollment"])

    return getActionState({
      success: true,
      message: "Family enrollment stage updated.",
    })
  } catch {
    return getActionState({
      error: "We could not update this family stage right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Family notes (admin-internal)
// ---------------------------------------------------------------------------

export async function addFamilyNote(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = addFamilyNoteSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      body: getStringValue(formData, "body"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please add a short note before saving.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
      select: { id: true, familyName: true },
    })

    if (!family) {
      return getActionState({ error: "Family not found." })
    }

    await prisma.$transaction([
      prisma.familyNote.create({
        data: {
          familyId: family.id,
          authorId: user.id,
          body: parsed.data.body,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "family.note_added",
          subjectType: "Family",
          subjectId: family.id,
          details: { familyName: family.familyName },
        },
      }),
    ])

    revalidatePaths(["/admin/families"])

    return getActionState({ success: true, message: "Note saved." })
  } catch {
    return getActionState({ error: "We could not save this note right now." })
  }
}

export async function deleteFamilyNote(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = deleteFamilyNoteSchema.safeParse({
      noteId: getStringValue(formData, "noteId"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "We could not identify the note to delete.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const note = await prisma.familyNote.findUnique({
      where: { id: parsed.data.noteId },
      select: { id: true, familyId: true },
    })

    if (!note) {
      return getActionState({ error: "Note not found." })
    }

    await prisma.$transaction([
      prisma.familyNote.delete({ where: { id: note.id } }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "family.note_deleted",
          subjectType: "FamilyNote",
          subjectId: note.id,
          details: { familyId: note.familyId },
        },
      }),
    ])

    revalidatePaths(["/admin/families"])

    return getActionState({ success: true, message: "Note deleted." })
  } catch {
    return getActionState({ error: "We could not delete this note right now." })
  }
}

// ---------------------------------------------------------------------------
// Admin Message Reply
// ---------------------------------------------------------------------------

export async function sendAdminReply(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = sendAdminReplySchema.safeParse({
      threadId: getStringValue(formData, "threadId"),
      body: getStringValue(formData, "body"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please check the form for errors.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const thread = await prisma.messageThread.findUnique({
      where: { id: parsed.data.threadId },
    })

    if (!thread) {
      return getActionState({ error: "Message thread not found." })
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.message.create({
        data: {
          threadId: thread.id,
          authorUserId: user.id,
          senderName: user.name,
          role: "STAFF",
          body: parsed.data.body,
          sentAt: now,
        },
      }),
      prisma.messageThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: now, status: "ACTIVE" },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "message.reply_sent",
          subjectType: "MessageThread",
          subjectId: thread.id,
          details: {
            subject: thread.subject,
          },
        },
      }),
    ])

    revalidatePaths([
      "/admin",
      "/admin/communications",
      "/parent",
      "/parent/messages",
    ])

    return getActionState({
      success: true,
      message: "Reply sent.",
    })
  } catch {
    return getActionState({
      error: "We could not send this reply right now.",
    })
  }
}

export async function createAdminThread(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const user = await requireRole("ADMIN")

    const parsed = createAdminThreadSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      subject: getStringValue(formData, "subject"),
      classroomLabel: getStringValue(formData, "classroomLabel"),
      body: getStringValue(formData, "body"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Check the highlighted message details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const family = await prisma.family.findUnique({
      where: { id: parsed.data.familyId },
      select: {
        id: true,
        familyName: true,
        parents: {
          select: { user: { select: { name: true } } },
        },
      },
    })

    if (!family) {
      return getActionState({ error: "Family record not found." })
    }

    const parentNames = family.parents
      .map((p) => p.user.name)
      .filter((name): name is string => Boolean(name))
    const participants = Array.from(
      new Set([user.name, ...parentNames])
    ).filter(Boolean)

    const now = new Date()
    const thread = await prisma.messageThread.create({
      data: {
        familyId: family.id,
        subject: parsed.data.subject,
        classroomLabel: parsed.data.classroomLabel,
        status: "ACTIVE",
        participants,
        lastMessageAt: now,
        messages: {
          create: {
            authorUserId: user.id,
            senderName: user.name,
            role: "STAFF",
            body: parsed.data.body,
            sentAt: now,
          },
        },
      },
      select: { id: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "admin.messages.thread.create",
        subjectType: "MessageThread",
        subjectId: thread.id,
        details: {
          subject: parsed.data.subject,
          classroomLabel: parsed.data.classroomLabel,
          familyId: family.id,
        },
      },
    })

    revalidatePaths([
      "/admin",
      "/admin/communications",
      "/parent",
      "/parent/messages",
    ])

    return getActionState({
      success: true,
      message: "Message sent to the family.",
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not send this message right now.",
    })
  }
}

/* ------------------------------------------------------------------ */
/*  Child Profile                                                      */
/* ------------------------------------------------------------------ */

export async function updateChildProfile(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireRole("ADMIN")

    const parsed = updateChildProfileSchema.safeParse({
      childId: getStringValue(formData, "childId"),
      firstName: getStringValue(formData, "firstName"),
      lastName: getStringValue(formData, "lastName"),
      classroomId: getStringValue(formData, "classroomId"),
      allergies: getStringValue(formData, "allergies"),
      medicalNotes: getStringValue(formData, "medicalNotes"),
      comfortNotes: getStringValue(formData, "comfortNotes"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please fix the highlighted fields.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const { childId, firstName, lastName, classroomId, allergies, medicalNotes, comfortNotes } =
      parsed.data

    const child = await prisma.child.findUnique({ where: { id: childId } })

    if (!child) {
      return getActionState({ error: "Child record not found." })
    }

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } })

    if (!classroom) {
      return getActionState({ error: "Selected classroom not found." })
    }

    await prisma.child.update({
      where: { id: childId },
      data: {
        firstName,
        lastName,
        classroomId,
        allergies: allergies
          ? allergies.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
        medicalNotes: medicalNotes ?? "",
        comfortNotes: comfortNotes ?? "",
      },
    })

    revalidatePaths(["/admin", "/admin/families"])

    return getActionState({
      success: true,
      message: `${firstName} ${lastName}'s profile has been updated.`,
    })
  } catch {
    return getActionState({
      error: "We could not update this profile right now.",
    })
  }
}

export async function upsertChildDailyReport(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")

    const parsed = upsertChildDailyReportSchema.safeParse({
      childId: getStringValue(formData, "childId"),
      arrivalMood: getStringValue(formData, "arrivalMood"),
      summary: getStringValue(formData, "summary"),
      mealsText: getStringValue(formData, "mealsText"),
      restText: getStringValue(formData, "restText"),
      activitiesText: getStringValue(formData, "activitiesText"),
      staffNotesText: getStringValue(formData, "staffNotesText"),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Please fix the highlighted daily report fields.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const child = await prisma.child.findUnique({
      where: {
        id: parsed.data.childId,
      },
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!child) {
      return getActionState({
        error: "Child record not found.",
      })
    }

    const { start, end } = getTodayRange()
    const meals = parseDailyMeals(parsed.data.mealsText)
    const rest = parseDailyRest(parsed.data.restText)
    const activities = parseDailyActivities(parsed.data.activitiesText)
    const staffNotes = getStructuredLines(parsed.data.staffNotesText)

    const existingReport = await prisma.dailyReport.findFirst({
      where: {
        childId: child.id,
        date: {
          gte: start,
          lt: end,
        },
      },
      select: {
        id: true,
      },
    })

    if (existingReport) {
      await prisma.dailyReport.update({
        where: {
          id: existingReport.id,
        },
        data: {
          arrivalMood: parsed.data.arrivalMood,
          summary: parsed.data.summary,
          meals,
          rest,
          activities,
          staffNotes,
        },
      })
    } else {
      await prisma.dailyReport.create({
        data: {
          childId: child.id,
          date: getTodayReportDate(),
          arrivalMood: parsed.data.arrivalMood,
          summary: parsed.data.summary,
          meals,
          rest,
          activities,
          staffNotes,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.children.daily-report.upsert",
        subjectType: "Child",
        subjectId: child.id,
        details: {
          childName: `${child.firstName} ${child.lastName}`,
          mealsCount: meals.length,
          restCount: rest.length,
          activitiesCount: activities.length,
          staffNoteCount: staffNotes.length,
        },
      },
    })

    revalidatePaths([
      "/admin",
        "/admin/families",
      "/parent",
      `/parent/child/${child.slug}`,
    ])

    return getActionState({
      success: true,
      message: `${child.firstName}'s daily report is live for parents.`,
    })
  } catch {
    return getActionState({
      error: "We could not save this daily report right now.",
    })
  }
}

/* ------------------------------------------------------------------ */
/*  Programs & Pricing                                                */
/* ------------------------------------------------------------------ */

export async function upsertProgram(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = upsertProgramSchema.safeParse({
      programId: getStringValue(formData, "programId") || undefined,
      name: getStringValue(formData, "name"),
      slug: getStringValue(formData, "slug"),
      ageRange: getStringValue(formData, "ageRange") || undefined,
      description: getStringValue(formData, "description") || undefined,
      sortOrder: getStringValue(formData, "sortOrder"),
      isActive: getStringValue(formData, "isActive"),
    })

    if (!parsed.success) {
      return getActionState({ fieldErrors: getFieldErrors(parsed.error) })
    }

    const { programId, name, slug, ageRange, description, sortOrder, isActive } = parsed.data

    if (programId) {
      await prisma.program.update({
        where: { id: programId },
        data: { name, slug, ageRange, description, sortOrder, isActive },
      })
    } else {
      await prisma.program.create({
        data: { name, slug, ageRange, description, sortOrder, isActive },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: programId ? "admin.program.update" : "admin.program.create",
        subjectType: "Program",
        subjectId: programId ?? slug,
        details: { name, slug },
      },
    })

    revalidatePaths(["/admin", "/admin/rooms"])

    return getActionState({
      success: true,
      message: `Program "${name}" ${programId ? "updated" : "created"}.`,
    })
  } catch {
    return getActionState({ error: "Could not save this program right now." })
  }
}

export async function upsertSchedule(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = upsertScheduleSchema.safeParse({
      scheduleId: getStringValue(formData, "scheduleId") || undefined,
      name: getStringValue(formData, "name"),
      slug: getStringValue(formData, "slug"),
      daysDescription: getStringValue(formData, "daysDescription") || undefined,
      sortOrder: getStringValue(formData, "sortOrder"),
      isActive: getStringValue(formData, "isActive"),
    })

    if (!parsed.success) {
      return getActionState({ fieldErrors: getFieldErrors(parsed.error) })
    }

    const { scheduleId, name, slug, daysDescription, sortOrder, isActive } = parsed.data

    if (scheduleId) {
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: { name, slug, daysDescription, sortOrder, isActive },
      })
    } else {
      await prisma.schedule.create({
        data: { name, slug, daysDescription, sortOrder, isActive },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: scheduleId ? "admin.schedule.update" : "admin.schedule.create",
        subjectType: "Schedule",
        subjectId: scheduleId ?? slug,
        details: { name, slug },
      },
    })

    revalidatePaths(["/admin", "/admin/rooms"])

    return getActionState({
      success: true,
      message: `Schedule "${name}" ${scheduleId ? "updated" : "created"}.`,
    })
  } catch {
    return getActionState({ error: "Could not save this schedule right now." })
  }
}

export async function upsertProgramRate(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = upsertProgramRateSchema.safeParse({
      rateId: getStringValue(formData, "rateId") || undefined,
      programId: getStringValue(formData, "programId"),
      scheduleId: getStringValue(formData, "scheduleId"),
      rateCents: getStringValue(formData, "rateCents"),
      billingLabel: getStringValue(formData, "billingLabel") || undefined,
    })

    if (!parsed.success) {
      return getActionState({ fieldErrors: getFieldErrors(parsed.error) })
    }

    const { rateId, programId, scheduleId, rateCents, billingLabel } = parsed.data

    if (rateId) {
      await prisma.programRate.update({
        where: { id: rateId },
        data: { programId, scheduleId, rateCents, billingLabel },
      })
    } else {
      await prisma.programRate.upsert({
        where: { programId_scheduleId: { programId, scheduleId } },
        update: { rateCents, billingLabel },
        create: { programId, scheduleId, rateCents, billingLabel },
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: rateId ? "admin.rate.update" : "admin.rate.create",
        subjectType: "ProgramRate",
        subjectId: rateId ?? `${programId}:${scheduleId}`,
        details: { programId, scheduleId, rateCents },
      },
    })

    revalidatePaths(["/admin", "/admin/rooms"])

    return getActionState({
      success: true,
      message: "Rate saved.",
    })
  } catch {
    return getActionState({ error: "Could not save this rate right now." })
  }
}

// ---------------------------------------------------------------------------
// Staff management
// ---------------------------------------------------------------------------

function getStaffFormValues(formData: FormData) {
  return {
    name: getStringValue(formData, "name"),
    roleLabel: getStringValue(formData, "roleLabel"),
    classroomId: getStringValue(formData, "classroomId") || undefined,
    certification: getStringValue(formData, "certification") || undefined,
    note: getStringValue(formData, "note") || undefined,
    status: (getStringValue(formData, "status") || "SCHEDULED") as
      | "SCHEDULED"
      | "COVERAGE_NEEDED"
      | "OUT",
    accountKind: (getStringValue(formData, "accountKind") || "NONE") as
      | "NONE"
      | "ADMIN"
      | "TEACHER",
    email: getStringValue(formData, "email") || undefined,
  }
}

async function sendStaffInviteEmail(params: {
  to: string
  name: string
  role: "ADMIN" | "TEACHER"
  inviteUrl: string
  inviterName: string
}) {
  if (!isResendConfigured()) return
  const portalLabel = params.role === "ADMIN" ? "admin" : "teacher"
  const onboardingNote =
    "After signing in you'll set up your profile, upload required documents (background check, first-aid certification, government ID), and acknowledge our policies. Plan about 10 minutes."
  await sendTransactionalEmail({
    to: params.to,
    subject: `You've been added to Ambassadors Care (${portalLabel})`,
    text: `Hi ${params.name},\n\n${params.inviterName} added you as a ${portalLabel} on Ambassadors Care.\n\nUse this secure link to set your password:\n${params.inviteUrl}\n\n${onboardingNote}\n\nThis link expires in 72 hours.`,
    html: `<p>Hi ${params.name},</p><p>${params.inviterName} added you as a <strong>${portalLabel}</strong> on Ambassadors Care.</p><p>Use this secure link to set your password:</p><p><a href="${params.inviteUrl}">${params.inviteUrl}</a></p><p>${onboardingNote}</p><p>This link expires in 72 hours.</p>`,
  })
}

/** Default required documents per role at invite time. */
const DEFAULT_STAFF_DOCS_BY_ROLE: Record<
  "ADMIN" | "TEACHER",
  Array<{ category: "BACKGROUND_CHECK" | "FIRST_AID" | "GOVERNMENT_ID" }>
> = {
  TEACHER: [
    { category: "BACKGROUND_CHECK" },
    { category: "FIRST_AID" },
    { category: "GOVERNMENT_ID" },
  ],
  ADMIN: [
    { category: "BACKGROUND_CHECK" },
    { category: "GOVERNMENT_ID" },
  ],
}

export async function createStaffMember(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = createStaffMemberSchema.safeParse(getStaffFormValues(formData))

    if (!parsed.success) {
      return getActionState({
        error: "Check the staff details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const { accountKind, email, ...staffData } = parsed.data
    let userId: string | null = null
    let inviteUrl: string | null = null

    if (accountKind !== "NONE") {
      if (!email) {
        return getActionState({
          error: "Email is required when creating a portal account.",
          fieldErrors: { email: "Required for ADMIN / TEACHER accounts." },
        })
      }
      const { user, invite } = await createUserWithInvite({
        name: staffData.name,
        email,
        role: accountKind,
        issuedByUserId: admin.id,
      })
      userId = user.id
      inviteUrl = buildAppUrl(`/invite/${invite.rawToken}`)
      await sendStaffInviteEmail({
        to: user.email,
        name: user.name,
        role: accountKind,
        inviteUrl,
        inviterName: admin.name,
      })
    }

    const staffProfile = await prisma.staffProfile.create({
      data: {
        userId,
        classroomId: staffData.classroomId ?? null,
        name: staffData.name,
        roleLabel: staffData.roleLabel,
        certification: staffData.certification ?? "",
        status: staffData.status,
        note: staffData.note ?? "",
      },
      select: { id: true, name: true, roleLabel: true },
    })

    // When a portal account is created, also seed the onboarding-progress
    // row plus the default required documents for the role. The wizard
    // reads these on first login.
    if (accountKind !== "NONE") {
      const requiredDocs = DEFAULT_STAFF_DOCS_BY_ROLE[accountKind]
      await prisma.staffOnboardingProgress.create({
        data: { staffProfileId: staffProfile.id },
      })
      if (requiredDocs.length > 0) {
        await prisma.staffDocument.createMany({
          data: requiredDocs.map((doc) => ({
            staffProfileId: staffProfile.id,
            category: doc.category,
          })),
        })
      }
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.create",
        subjectType: "StaffProfile",
        subjectId: staffProfile.id,
        details: {
          name: staffProfile.name,
          roleLabel: staffProfile.roleLabel,
          accountKind,
          inviteUrl,
        },
      },
    })

    revalidatePaths(["/admin", "/admin/staff", "/admin/classrooms"])

    return getActionState({
      success: true,
      message:
        accountKind === "NONE"
          ? `${staffProfile.name} added to staff.`
          : `${staffProfile.name} added — invite sent to ${email}.`,
      entityId: staffProfile.id,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not add this staff member right now.",
    })
  }
}

export async function updateStaffMember(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = updateStaffMemberSchema.safeParse({
      staffId: getStringValue(formData, "staffId"),
      ...getStaffFormValues(formData),
    })

    if (!parsed.success) {
      return getActionState({
        error: "Check the staff details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const { staffId, ...staffData } = parsed.data
    const updated = await prisma.staffProfile.update({
      where: { id: staffId },
      data: {
        name: staffData.name,
        roleLabel: staffData.roleLabel,
        classroomId: staffData.classroomId ?? null,
        certification: staffData.certification ?? "",
        status: staffData.status,
        note: staffData.note ?? "",
      },
      select: { id: true, name: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.update",
        subjectType: "StaffProfile",
        subjectId: updated.id,
        details: { name: updated.name },
      },
    })

    revalidatePaths(["/admin", "/admin/staff", "/admin/classrooms"])

    return getActionState({
      success: true,
      message: `${updated.name}'s details saved.`,
      entityId: updated.id,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not update this staff member right now.",
    })
  }
}

export async function assignStaffClassroom(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = assignStaffClassroomSchema.safeParse({
      staffId: getStringValue(formData, "staffId"),
      classroomId: getStringValue(formData, "classroomId") || undefined,
    })

    if (!parsed.success) {
      return getActionState({ error: "That assignment could not be saved." })
    }

    const updated = await prisma.staffProfile.update({
      where: { id: parsed.data.staffId },
      data: { classroomId: parsed.data.classroomId ?? null },
      select: { id: true, name: true, classroom: { select: { name: true } } },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.assign-classroom",
        subjectType: "StaffProfile",
        subjectId: updated.id,
        details: { classroomId: parsed.data.classroomId ?? null },
      },
    })

    revalidatePaths(["/admin", "/admin/staff", "/admin/classrooms"])

    return getActionState({
      success: true,
      message: updated.classroom
        ? `${updated.name} assigned to ${updated.classroom.name}.`
        : `${updated.name} unassigned from classroom.`,
    })
  } catch {
    return getActionState({ error: "We could not save that assignment right now." })
  }
}

export async function resendStaffInvite(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const staffId = getStringValue(formData, "staffId")
    if (!staffId) return getActionState({ error: "Staff id is required." })

    const profile = await prisma.staffProfile.findUnique({
      where: { id: staffId },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    })
    if (!profile?.user) {
      return getActionState({
        error: "This staff member doesn't have a portal account.",
      })
    }

    const invite = await createAccountInviteToken({
      userId: profile.user.id,
      email: profile.user.email,
      role: profile.user.role,
      issuedByUserId: admin.id,
    })
    const inviteUrl = buildAppUrl(`/invite/${invite.rawToken}`)

    await prisma.user.update({
      where: { id: profile.user.id },
      data: { mustSetPassword: true },
    })

    if (profile.user.role === "ADMIN" || profile.user.role === "TEACHER") {
      await sendStaffInviteEmail({
        to: profile.user.email,
        name: profile.user.name,
        role: profile.user.role,
        inviteUrl,
        inviterName: admin.name,
      })
    }

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.invite-resend",
        subjectType: "StaffProfile",
        subjectId: profile.id,
        details: { email: profile.user.email },
      },
    })

    revalidatePaths(["/admin/staff"])

    return getActionState({
      success: true,
      message: `Invite resent to ${profile.user.email}.`,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not resend that invite right now.",
    })
  }
}

export async function removeStaffMember(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = removeStaffMemberSchema.safeParse({
      staffId: getStringValue(formData, "staffId"),
    })
    if (!parsed.success) {
      return getActionState({ error: "That staff member could not be removed." })
    }

    const profile = await prisma.staffProfile.findUnique({
      where: { id: parsed.data.staffId },
      select: { id: true, name: true },
    })
    if (!profile) {
      return getActionState({ error: "Staff member not found." })
    }

    await prisma.staffProfile.delete({ where: { id: profile.id } })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.remove",
        subjectType: "StaffProfile",
        subjectId: profile.id,
        details: { name: profile.name },
      },
    })

    revalidatePaths(["/admin", "/admin/staff", "/admin/classrooms"])

    return getActionState({
      success: true,
      message: `${profile.name} removed from staff.`,
    })
  } catch {
    return getActionState({
      error: "We could not remove this staff member right now.",
    })
  }
}

// ---------------------------------------------------------------------------
// Staff onboarding (document review)
// ---------------------------------------------------------------------------

export type AdminStaffOnboardingDetail = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE"
  currentStep: string
  completedAt: Date | null
  profile: {
    phone: string | null
    bio: string | null
    pronouns: string | null
    hireDate: Date | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
    photoBlobUrl: string | null
  }
  documents: Array<{
    id: string
    category: string
    status: string
    fileName: string | null
    blobDownloadUrl: string | null
    submittedAt: Date | null
    approvedAt: Date | null
    reviewedByName: string | null
    notes: string | null
  }>
  policies: Array<{
    key: string
    title: string
    signedName: string | null
    signedAt: string | null
  }>
}

const ADMIN_POLICY_TITLES: Record<string, string> = {
  handbook: "Staff handbook",
  safeguarding: "Child safeguarding & reporting",
  code_of_conduct: "Code of conduct & confidentiality",
}

/**
 * Loads onboarding detail for a single staff record so the admin drawer can
 * render review controls. The drawer calls this on open.
 */
export async function loadStaffOnboardingForAdmin(
  staffProfileId: string,
): Promise<AdminStaffOnboardingDetail | null> {
  await requireRole("ADMIN")

  const staff = await prisma.staffProfile.findUnique({
    where: { id: staffProfileId },
    include: {
      onboarding: true,
      documents: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!staff) return null

  // Lazy-create the onboarding row for legacy staff so the panel always has
  // something to render.
  const progress =
    staff.onboarding ??
    (await prisma.staffOnboardingProgress.create({
      data: { staffProfileId: staff.id },
    }))

  const acks = isJsonObjectAdmin(progress.acknowledgments)
    ? progress.acknowledgments
    : {}

  return {
    status: progress.status,
    currentStep: progress.currentStep,
    completedAt: progress.completedAt,
    profile: {
      phone: staff.phone,
      bio: staff.bio,
      pronouns: staff.pronouns,
      hireDate: staff.hireDate,
      emergencyContactName: staff.emergencyContactName,
      emergencyContactPhone: staff.emergencyContactPhone,
      photoBlobUrl: staff.photoBlobUrl,
    },
    documents: staff.documents.map((doc) => ({
      id: doc.id,
      category: doc.category,
      status: doc.status,
      fileName: doc.fileName,
      blobDownloadUrl: doc.blobDownloadUrl,
      submittedAt: doc.submittedAt,
      approvedAt: doc.approvedAt,
      reviewedByName: doc.reviewedByName,
      notes: doc.notes,
    })),
    policies: Object.entries(ADMIN_POLICY_TITLES).map(([key, title]) => {
      const sig = acks[key]
      const isSig =
        sig &&
        typeof sig === "object" &&
        "signedName" in (sig as Record<string, unknown>)
      return {
        key,
        title,
        signedName: isSig ? String((sig as Record<string, unknown>).signedName) : null,
        signedAt: isSig ? String((sig as Record<string, unknown>).signedAt) : null,
      }
    }),
  }
}

function isJsonObjectAdmin(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

export async function approveStaffDocument(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const documentId = getStringValue(formData, "documentId")
    if (!documentId) {
      return getActionState({ error: "Missing document id." })
    }

    const document = await prisma.staffDocument.update({
      where: { id: documentId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        reviewedByName: admin.name,
        notes: null,
      },
      select: { id: true, staffProfileId: true, category: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.document.approve",
        subjectType: "StaffDocument",
        subjectId: document.id,
        details: {
          staffProfileId: document.staffProfileId,
          category: document.category,
        },
      },
    })

    revalidatePaths(["/admin/staff", "/onboarding/staff"])
    return getActionState({ success: true, message: "Document approved." })
  } catch {
    return getActionState({ error: "Could not approve this document." })
  }
}

export async function rejectStaffDocument(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const documentId = getStringValue(formData, "documentId")
    const reason = getStringValue(formData, "reason").trim()
    if (!documentId) {
      return getActionState({ error: "Missing document id." })
    }
    if (reason.length < 4) {
      return getActionState({
        error: "Add a short reason so the staff member knows what to fix.",
        fieldErrors: { reason: "Required, at least 4 characters." },
      })
    }

    const document = await prisma.staffDocument.update({
      where: { id: documentId },
      data: {
        status: "REJECTED",
        notes: reason,
        reviewedByName: admin.name,
      },
      select: { id: true, staffProfileId: true, category: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.staff.document.reject",
        subjectType: "StaffDocument",
        subjectId: document.id,
        details: {
          staffProfileId: document.staffProfileId,
          category: document.category,
          reason,
        },
      },
    })

    revalidatePaths(["/admin/staff", "/onboarding/staff"])
    return getActionState({ success: true, message: "Document rejected and noted." })
  } catch {
    return getActionState({ error: "Could not reject this document." })
  }
}

// ---------------------------------------------------------------------------
// Classrooms
// ---------------------------------------------------------------------------

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
}

async function getUniqueClassroomSlug(base: string, excludeId?: string) {
  const candidate = base || "classroom"
  let slug = candidate
  let i = 2
  // Try until we find a free slug. Max 25 attempts to avoid an infinite loop.
  for (let attempt = 0; attempt < 25; attempt++) {
    const existing = await prisma.classroom.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) return slug
    slug = `${candidate}-${i++}`
  }
  return `${candidate}-${Date.now()}`
}

function getClassroomFormValues(formData: FormData) {
  return {
    name: getStringValue(formData, "name"),
    ageGroup: getStringValue(formData, "ageGroup"),
    capacity: getStringValue(formData, "capacity"),
    leadTeacherName: getStringValue(formData, "leadTeacherName") || undefined,
    ratioLabel: getStringValue(formData, "ratioLabel") || undefined,
    nextEvent: getStringValue(formData, "nextEvent") || undefined,
    note: getStringValue(formData, "note") || undefined,
    slug: getStringValue(formData, "slug") || undefined,
  }
}

export async function createClassroom(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = createClassroomSchema.safeParse(getClassroomFormValues(formData))
    if (!parsed.success) {
      return getActionState({
        error: "Check the classroom details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    // Reject duplicate name early with a friendly message.
    const existingByName = await prisma.classroom.findUnique({
      where: { name: parsed.data.name },
      select: { id: true },
    })
    if (existingByName) {
      return getActionState({
        error: "A classroom with that name already exists.",
        fieldErrors: { name: "Name must be unique." },
      })
    }

    const slug = await getUniqueClassroomSlug(
      parsed.data.slug ?? slugify(parsed.data.name)
    )

    const created = await prisma.classroom.create({
      data: {
        name: parsed.data.name,
        ageGroup: parsed.data.ageGroup,
        capacity: parsed.data.capacity,
        leadTeacherName: parsed.data.leadTeacherName ?? "",
        ratioLabel: parsed.data.ratioLabel ?? "",
        nextEvent: parsed.data.nextEvent ?? "",
        note: parsed.data.note ?? "",
        slug,
      },
      select: { id: true, name: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.classroom.create",
        subjectType: "Classroom",
        subjectId: created.id,
        details: { name: created.name, slug },
      },
    })

    revalidatePaths(["/admin", "/admin/classrooms", "/admin/staff", "/admin/attendance"])

    return getActionState({
      success: true,
      message: `${created.name} added.`,
      entityId: created.id,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not add this classroom right now.",
    })
  }
}

export async function updateClassroom(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = updateClassroomSchema.safeParse({
      classroomId: getStringValue(formData, "classroomId"),
      ...getClassroomFormValues(formData),
    })
    if (!parsed.success) {
      return getActionState({
        error: "Check the classroom details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    const { classroomId, ...data } = parsed.data
    const existing = await prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true, name: true, slug: true },
    })
    if (!existing) {
      return getActionState({ error: "That classroom could not be found." })
    }

    // If name changed, ensure no other classroom owns that name.
    if (data.name !== existing.name) {
      const collision = await prisma.classroom.findUnique({
        where: { name: data.name },
        select: { id: true },
      })
      if (collision && collision.id !== existing.id) {
        return getActionState({
          error: "Another classroom already uses that name.",
          fieldErrors: { name: "Name must be unique." },
        })
      }
    }

    const slug = await getUniqueClassroomSlug(
      data.slug ?? (data.name !== existing.name ? slugify(data.name) : existing.slug),
      existing.id
    )

    const updated = await prisma.classroom.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        ageGroup: data.ageGroup,
        capacity: data.capacity,
        leadTeacherName: data.leadTeacherName ?? "",
        ratioLabel: data.ratioLabel ?? "",
        nextEvent: data.nextEvent ?? "",
        note: data.note ?? "",
        slug,
      },
      select: { id: true, name: true },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.classroom.update",
        subjectType: "Classroom",
        subjectId: updated.id,
        details: { name: updated.name },
      },
    })

    revalidatePaths(["/admin", "/admin/classrooms", "/admin/staff", "/admin/attendance"])

    return getActionState({
      success: true,
      message: `${updated.name} saved.`,
      entityId: updated.id,
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not save this classroom right now.",
    })
  }
}

export async function removeClassroom(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const admin = await requireRole("ADMIN")
    const parsed = removeClassroomSchema.safeParse({
      classroomId: getStringValue(formData, "classroomId"),
    })
    if (!parsed.success) {
      return getActionState({ error: "That classroom could not be removed." })
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: parsed.data.classroomId },
      select: {
        id: true,
        name: true,
        _count: { select: { children: true, staffProfiles: true } },
      },
    })
    if (!classroom) {
      return getActionState({ error: "Classroom not found." })
    }

    if (classroom._count.children > 0 || classroom._count.staffProfiles > 0) {
      return getActionState({
        error:
          "Re-assign every child and staff member out of this classroom before removing it.",
      })
    }

    await prisma.classroom.delete({ where: { id: classroom.id } })

    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "admin.classroom.remove",
        subjectType: "Classroom",
        subjectId: classroom.id,
        details: { name: classroom.name },
      },
    })

    revalidatePaths(["/admin", "/admin/classrooms", "/admin/staff", "/admin/attendance"])

    return getActionState({
      success: true,
      message: `${classroom.name} removed.`,
    })
  } catch {
    return getActionState({
      error: "We could not remove this classroom right now.",
    })
  }
}
