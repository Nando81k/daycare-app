import "server-only"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatBirthday, formatRelativeDateTime, formatTime } from "@/lib/format"
import { BILLING_THREAD_LABEL } from "@/lib/messaging"
import type {
  ParentMessagePreview,
  TeacherFamilyOption,
  TeacherMessageThreadPreview,
} from "@/types/app"

export type TeacherTodayReport = {
  arrivalMood: string
  summary: string
  meals: string[]
  rest: string[]
  activities: string[]
  staffNotes: string[]
}

export type TeacherChildRow = {
  id: string
  slug: string
  firstName: string
  lastName: string
  fullName: string
  ageLabel: string
  birthday: string
  allergies: string[]
  medicalNotes: string[]
  comfortNotes: string[]
  todayStatus: "PRESENT" | "ABSENT" | "SCHEDULED" | null
  checkInAt: string | null
  checkOutAt: string | null
  todayNote: string
  todayReportSummary: string | null
  todayReportUpdatedAt: string | null
  todayReport: TeacherTodayReport | null
}

export type TeacherDashboardData = {
  teacher: { id: string; name: string; email: string; roleLabel: string }
  classroom: {
    id: string
    name: string
    ageGroup: string
    capacity: number
    enrolled: number
    ratio: string
  } | null
  children: TeacherChildRow[]
  presentCount: number
  absentCount: number
  scheduledCount: number
  reportsPostedToday: number
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

/**
 * Resolve the signed-in teacher's assigned classroom + roster + today's
 * attendance + today's daily reports in a single round trip.
 */
export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
  const user = await requireRole("TEACHER")

  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    include: {
      classroom: {
        include: {
          children: {
            orderBy: { firstName: "asc" },
            include: {
              attendanceRecords: {
                where: { date: { gte: startOfToday(), lte: endOfToday() } },
                take: 1,
              },
              dailyReports: {
                where: { date: { gte: startOfToday(), lte: endOfToday() } },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!profile?.classroom) {
    return {
      teacher: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleLabel: profile?.roleLabel ?? "Teacher",
      },
      classroom: null,
      children: [],
      presentCount: 0,
      absentCount: 0,
      scheduledCount: 0,
      reportsPostedToday: 0,
    }
  }

  const room = profile.classroom
  const children: TeacherChildRow[] = room.children.map((child) => {
    const att = child.attendanceRecords[0] ?? null
    const report = child.dailyReports[0] ?? null
    return {
      id: child.id,
      slug: child.slug,
      firstName: child.firstName,
      lastName: child.lastName,
      fullName: `${child.firstName} ${child.lastName}`.trim(),
      ageLabel: child.ageLabel,
      birthday: child.birthday ? formatBirthday(child.birthday) : "",
      allergies: asStringArray(child.allergies),
      medicalNotes: asStringArray(child.medicalNotes),
      comfortNotes: asStringArray(child.comfortNotes),
      todayStatus: att?.status ?? null,
      checkInAt: att?.checkInAt ? formatTime(att.checkInAt) : null,
      checkOutAt: att?.checkOutAt ? formatTime(att.checkOutAt) : null,
      todayNote: att?.note ?? "",
      todayReportSummary: report?.summary ?? null,
      todayReportUpdatedAt: report
        ? formatRelativeDateTime(report.date)
        : null,
      todayReport: report
        ? {
            arrivalMood: report.arrivalMood,
            summary: report.summary,
            meals: asStringArray(report.meals),
            rest: asStringArray(report.rest),
            activities: asStringArray(report.activities),
            staffNotes: asStringArray(report.staffNotes),
          }
        : null,
    }
  })

  const presentCount = children.filter((c) => c.todayStatus === "PRESENT").length
  const absentCount = children.filter((c) => c.todayStatus === "ABSENT").length
  const scheduledCount = children.filter((c) => c.todayStatus === "SCHEDULED").length
  const reportsPostedToday = children.filter(
    (c) => c.todayReportSummary !== null
  ).length

  return {
    teacher: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleLabel: profile.roleLabel,
    },
    classroom: {
      id: room.id,
      name: room.name,
      ageGroup: room.ageGroup,
      capacity: room.capacity,
      enrolled: room.children.length,
      ratio: room.ratioLabel,
    },
    children,
    presentCount,
    absentCount,
    scheduledCount,
    reportsPostedToday,
  }
}

/**
 * Verify the signed-in teacher actually owns a classroom that contains the
 * given child. Used by every teacher write action so a teacher can't post
 * attendance / daily reports for children outside their room.
 */
export async function assertTeacherCanEditChild(
  userId: string,
  childId: string
): Promise<{ classroomId: string }> {
  const profile = await prisma.staffProfile.findFirst({
    where: { userId },
    select: { classroomId: true },
  })
  if (!profile?.classroomId) {
    throw new Error("You don't have a classroom assigned yet.")
  }
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { classroomId: true },
  })
  if (!child || child.classroomId !== profile.classroomId) {
    throw new Error("That child is not in your classroom.")
  }
  return { classroomId: profile.classroomId }
}

function mapThreadStatus(
  status: "ACTIVE" | "RESPONSE_NEEDED" | "CLOSED"
): TeacherMessageThreadPreview["status"] {
  switch (status) {
    case "ACTIVE":
      return "active"
    case "RESPONSE_NEEDED":
      return "response-needed"
    case "CLOSED":
      return "closed"
  }
}

function mapMessageRole(
  role: "STAFF" | "PARENT" | "DIRECTOR"
): ParentMessagePreview["role"] {
  switch (role) {
    case "STAFF":
      return "staff"
    case "PARENT":
      return "parent"
    case "DIRECTOR":
      return "director"
  }
}

export type TeacherMessagesData = {
  teacherName: string
  classroomName: string | null
  threads: TeacherMessageThreadPreview[]
  families: TeacherFamilyOption[]
}

export async function getTeacherMessagesData(): Promise<TeacherMessagesData> {
  const user = await requireRole("TEACHER")

  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    select: {
      classroomId: true,
      classroom: { select: { id: true, name: true } },
    },
  })

  if (!profile?.classroomId || !profile.classroom) {
    return {
      teacherName: user.name,
      classroomName: null,
      threads: [],
      families: [],
    }
  }

  const classroomId = profile.classroomId

  const [threadRows, familyRows] = await Promise.all([
    prisma.messageThread.findMany({
      where: {
        family: { children: { some: { classroomId } } },
        // Billing inquiries route exclusively to admins.
        classroomLabel: { not: BILLING_THREAD_LABEL },
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        family: { select: { id: true, familyName: true } },
        messages: { orderBy: { sentAt: "asc" } },
      },
    }),
    prisma.family.findMany({
      where: { children: { some: { classroomId } } },
      orderBy: { familyName: "asc" },
      select: {
        id: true,
        familyName: true,
        parents: {
          select: { user: { select: { name: true } } },
        },
        children: {
          where: { classroomId },
          orderBy: { firstName: "asc" },
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }),
  ])

  const threads: TeacherMessageThreadPreview[] = threadRows.map((thread) => {
    const lastMessage = thread.messages[thread.messages.length - 1]
    const unreadCount =
      thread.status === "RESPONSE_NEEDED" && lastMessage?.role !== "STAFF"
        ? 1
        : 0
    return {
      id: thread.id,
      familyId: thread.familyId,
      familyName: thread.family.familyName,
      subject: thread.subject,
      classroom: thread.classroomLabel,
      lastMessageAt: formatRelativeDateTime(thread.lastMessageAt),
      preview: lastMessage?.body ?? "No messages yet.",
      unreadCount,
      status: mapThreadStatus(thread.status),
      participants: asStringArray(thread.participants),
      messages: thread.messages.map((message) => ({
        id: message.id,
        sender: message.senderName,
        role: mapMessageRole(message.role),
        sentAt: formatRelativeDateTime(message.sentAt),
        body: message.body,
      })),
    }
  })

  const families: TeacherFamilyOption[] = familyRows.map((family) => ({
    id: family.id,
    familyName: family.familyName,
    parentNames: family.parents
      .map((p) => p.user.name)
      .filter((name): name is string => Boolean(name)),
    children: family.children.map((child) => ({
      id: child.id,
      fullName: `${child.firstName} ${child.lastName}`.trim(),
    })),
  }))

  return {
    teacherName: user.name,
    classroomName: profile.classroom.name,
    threads,
    families,
  }
}

export async function getTeacherChildById(slugOrId: string) {
  const user = await requireRole("TEACHER")
  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    select: { classroomId: true },
  })
  if (!profile?.classroomId) return null

  const child = await prisma.child.findFirst({
    where: {
      classroomId: profile.classroomId,
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
    include: {
      attendanceRecords: {
        where: { date: { gte: startOfToday(), lte: endOfToday() } },
        take: 1,
      },
      dailyReports: {
        where: { date: { gte: startOfToday(), lte: endOfToday() } },
        take: 1,
      },
    },
  })
  return child
}
