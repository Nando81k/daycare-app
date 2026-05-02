import "server-only"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatBirthday, formatRelativeDateTime, formatTime } from "@/lib/format"

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
