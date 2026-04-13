"use server"

import { revalidatePath } from "next/cache"
import { TZDate } from "react-day-picker"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  approveEnrollmentApplicationSchema,
  declineEnrollmentApplicationSchema,
  createCalendarEventSchema,
  createAnnouncementSchema,
  createDocumentRequestSchema,
  createInvoiceSchema,
  deleteCalendarEventSchema,
  reviewDocumentSchema,
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

  await prisma.$transaction(async (tx) => {
    await tx.enrollmentLead.update({
      where: {
        id: lead.id,
      },
      data: {
        stage: "ACCEPTED",
        assignedTo: admin.name,
        note: "Approved manually from the simplified admin enrollment dashboard.",
      },
    })

    if (lead.familyId) {
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
          label: `Enrollment fee – ${lead.childName}`,
          description:
            "Registration fee generated automatically upon enrollment approval.",
          amountCents: 15000,
          dueDate,
          status: "DUE",
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
      "/admin/waitlist",
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

    const { start, end } = getTodayRange()
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
      "/admin/children",
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
      "/admin/announcements",
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
      "/admin/announcements",
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
      "/admin/children",
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
      "/admin/children",
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

    const parsed = createDocumentRequestSchema.safeParse({
      familyId: getStringValue(formData, "familyId"),
      title: getStringValue(formData, "title"),
      note: getStringValue(formData, "note"),
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
      prisma.document.create({
        data: {
          familyId: family.id,
          title: parsed.data.title,
          category: "Request",
          owner: "Staff",
          status: "REQUIRED",
          note: parsed.data.note ?? "",
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: user.id,
          action: "document.request_created",
          subjectType: "Document",
          details: {
            familyName: family.familyName,
            title: parsed.data.title,
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

    revalidatePaths(["/admin", "/admin/messages", "/parent"])

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

    revalidatePaths(["/admin", "/admin/children"])

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
      "/admin/children",
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
