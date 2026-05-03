import "server-only"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatTime } from "@/lib/format"

export type AttendanceStatusKey = "present" | "absent" | "scheduled"

export type AttendanceHistoryDot = {
  date: string // YYYY-MM-DD
  status: AttendanceStatusKey | null // null = no record on that day
}

export type AttendanceChildRow = {
  id: string
  slug: string
  firstName: string
  lastName: string
  name: string
  ageLabel: string
  classroomId: string
  classroomName: string
  familyId: string
  familyName: string
  status: AttendanceStatusKey
  checkInAt: string | null // formatted "8:14 AM"
  checkOutAt: string | null
  checkInValue: string | null // "08:14" — for time inputs
  checkOutValue: string | null
  note: string
  history: AttendanceHistoryDot[]
}

export type AttendanceClassroomRoster = {
  id: string
  name: string
  ageGroup: string
  capacity: number
  children: AttendanceChildRow[]
  presentCount: number
  absentCount: number
  scheduledCount: number
}

export type AttendanceForDate = {
  date: string // YYYY-MM-DD
  classrooms: AttendanceClassroomRoster[]
  totals: {
    expected: number
    present: number
    absent: number
    scheduled: number
  }
}

/* ── Date helpers ───────────────────────────────────────── */

export function todayIso(): string {
  return formatIsoDate(new Date())
}

export function formatIsoDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function startOfDayFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map((p) => Number(p))
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function endOfDay(start: Date): Date {
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  return end
}

function statusFromPrisma(status: "PRESENT" | "ABSENT" | "SCHEDULED"): AttendanceStatusKey {
  return status.toLowerCase() as AttendanceStatusKey
}

function timeInputValue(d: Date | null | undefined): string | null {
  if (!d) return null
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function buildHistoryDots(
  records: Array<{ date: Date; status: "PRESENT" | "ABSENT" | "SCHEDULED" }>,
  endDate: Date,
  days = 14,
): AttendanceHistoryDot[] {
  const byDate = new Map<string, AttendanceStatusKey>()
  for (const record of records) {
    byDate.set(formatIsoDate(record.date), statusFromPrisma(record.status))
  }
  const dots: AttendanceHistoryDot[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(endDate)
    d.setDate(d.getDate() - offset)
    const iso = formatIsoDate(d)
    dots.push({ date: iso, status: byDate.get(iso) ?? null })
  }
  return dots
}

/* ── Admin: full attendance for any date ────────────────── */

export async function getAdminAttendanceForDate(
  isoDate: string = todayIso(),
): Promise<AttendanceForDate> {
  await requireRole("ADMIN")

  const start = startOfDayFromIso(isoDate)
  const end = endOfDay(start)
  const historyStart = new Date(start)
  historyStart.setDate(historyStart.getDate() - 13) // 14 days inclusive

  const classrooms = await prisma.classroom.findMany({
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { firstName: "asc" },
        include: {
          family: { select: { id: true, familyName: true } },
          attendanceRecords: {
            where: {
              date: {
                gte: historyStart,
                lte: end,
              },
            },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  })

  return assembleAttendance(isoDate, classrooms, start)
}

/* ── Teacher: attendance for their classroom on any date ─ */

export async function getTeacherAttendanceForDate(
  isoDate: string = todayIso(),
): Promise<AttendanceForDate & { hasClassroom: boolean }> {
  const user = await requireRole("TEACHER")

  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    select: { classroomId: true },
  })

  if (!profile?.classroomId) {
    return {
      date: isoDate,
      classrooms: [],
      totals: { expected: 0, present: 0, absent: 0, scheduled: 0 },
      hasClassroom: false,
    }
  }

  const start = startOfDayFromIso(isoDate)
  const end = endOfDay(start)
  const historyStart = new Date(start)
  historyStart.setDate(historyStart.getDate() - 13)

  const classroom = await prisma.classroom.findUnique({
    where: { id: profile.classroomId },
    include: {
      children: {
        orderBy: { firstName: "asc" },
        include: {
          family: { select: { id: true, familyName: true } },
          attendanceRecords: {
            where: {
              date: {
                gte: historyStart,
                lte: end,
              },
            },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  })

  if (!classroom) {
    return {
      date: isoDate,
      classrooms: [],
      totals: { expected: 0, present: 0, absent: 0, scheduled: 0 },
      hasClassroom: false,
    }
  }

  const result = assembleAttendance(isoDate, [classroom], start)
  return { ...result, hasClassroom: true }
}

/* ── Shared assembly ────────────────────────────────────── */

type ClassroomWithChildren = {
  id: string
  name: string
  ageGroup: string
  capacity: number
  children: Array<{
    id: string
    slug: string
    firstName: string
    lastName: string
    ageLabel: string
    classroomId: string
    family: { id: string; familyName: string }
    attendanceRecords: Array<{
      date: Date
      status: "PRESENT" | "ABSENT" | "SCHEDULED"
      checkInAt: Date | null
      checkOutAt: Date | null
      note: string
    }>
  }>
}

function assembleAttendance(
  isoDate: string,
  classrooms: ClassroomWithChildren[],
  selectedDay: Date,
): AttendanceForDate {
  let expected = 0
  let totalPresent = 0
  let totalAbsent = 0
  let totalScheduled = 0

  const rosters: AttendanceClassroomRoster[] = classrooms.map((room) => {
    let present = 0
    let absent = 0
    let scheduled = 0

    const children: AttendanceChildRow[] = room.children.map((child) => {
      // Find the record for the selected day, if any.
      const todayRecord = child.attendanceRecords.find(
        (record) => formatIsoDate(record.date) === isoDate,
      )
      const status: AttendanceStatusKey = todayRecord
        ? statusFromPrisma(todayRecord.status)
        : "scheduled"

      if (status === "present") present += 1
      if (status === "absent") absent += 1
      if (status === "scheduled") scheduled += 1

      return {
        id: child.id,
        slug: child.slug,
        firstName: child.firstName,
        lastName: child.lastName,
        name: `${child.firstName} ${child.lastName}`.trim(),
        ageLabel: child.ageLabel,
        classroomId: child.classroomId,
        classroomName: room.name,
        familyId: child.family.id,
        familyName: child.family.familyName,
        status,
        checkInAt: todayRecord?.checkInAt ? formatTime(todayRecord.checkInAt) : null,
        checkOutAt: todayRecord?.checkOutAt ? formatTime(todayRecord.checkOutAt) : null,
        checkInValue: timeInputValue(todayRecord?.checkInAt),
        checkOutValue: timeInputValue(todayRecord?.checkOutAt),
        note: todayRecord?.note ?? "",
        history: buildHistoryDots(child.attendanceRecords, selectedDay, 14),
      }
    })

    expected += children.length
    totalPresent += present
    totalAbsent += absent
    totalScheduled += scheduled

    return {
      id: room.id,
      name: room.name,
      ageGroup: room.ageGroup,
      capacity: room.capacity,
      children,
      presentCount: present,
      absentCount: absent,
      scheduledCount: scheduled,
    }
  })

  return {
    date: isoDate,
    classrooms: rosters,
    totals: {
      expected,
      present: totalPresent,
      absent: totalAbsent,
      scheduled: totalScheduled,
    },
  }
}

/* ── History grid for /admin/attendance/history ─────────── */

export type AttendanceHistoryDayCell = {
  date: string
  expected: number
  present: number
  absent: number
  scheduled: number
  presentRate: number // 0..1
}

export type AttendanceHistoryRow = {
  classroomId: string
  classroomName: string
  capacity: number
  days: AttendanceHistoryDayCell[]
  totals: {
    present: number
    absent: number
    scheduled: number
    expected: number
  }
}

export type AttendanceHistoryGrid = {
  days: string[] // ISO dates oldest -> newest
  rows: AttendanceHistoryRow[]
  overall: {
    present: number
    absent: number
    scheduled: number
    expected: number
  }
}

export async function getAttendanceHistoryGrid(
  daysBack = 30,
): Promise<AttendanceHistoryGrid> {
  await requireRole("ADMIN")

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (daysBack - 1))

  const dates: string[] = []
  for (let i = 0; i < daysBack; i += 1) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    dates.push(formatIsoDate(d))
  }

  const classrooms = await prisma.classroom.findMany({
    orderBy: { name: "asc" },
    include: {
      children: {
        select: {
          id: true,
          attendanceRecords: {
            where: { date: { gte: start, lte: endOfDay(today) } },
            select: { date: true, status: true },
          },
        },
      },
    },
  })

  let overallPresent = 0
  let overallAbsent = 0
  let overallScheduled = 0
  let overallExpected = 0

  const rows: AttendanceHistoryRow[] = classrooms.map((room) => {
    // For each date, count statuses; children with no record on that date
    // are treated as "scheduled" (the soft default).
    const dayMap = new Map<
      string,
      { present: number; absent: number; scheduled: number }
    >()
    for (const date of dates) {
      dayMap.set(date, { present: 0, absent: 0, scheduled: 0 })
    }

    for (const child of room.children) {
      const recordedDates = new Set<string>()
      for (const record of child.attendanceRecords) {
        const iso = formatIsoDate(record.date)
        if (!dayMap.has(iso)) continue
        recordedDates.add(iso)
        const bucket = dayMap.get(iso)!
        if (record.status === "PRESENT") bucket.present += 1
        else if (record.status === "ABSENT") bucket.absent += 1
        else bucket.scheduled += 1
      }
      // Days with no record default to "scheduled" (expected but not marked).
      for (const date of dates) {
        if (!recordedDates.has(date)) {
          dayMap.get(date)!.scheduled += 1
        }
      }
    }

    let roomPresent = 0
    let roomAbsent = 0
    let roomScheduled = 0
    let roomExpected = 0

    const days: AttendanceHistoryDayCell[] = dates.map((date) => {
      const counts = dayMap.get(date)!
      const expected = room.children.length
      roomPresent += counts.present
      roomAbsent += counts.absent
      roomScheduled += counts.scheduled
      roomExpected += expected
      return {
        date,
        expected,
        present: counts.present,
        absent: counts.absent,
        scheduled: counts.scheduled,
        presentRate: expected === 0 ? 0 : counts.present / expected,
      }
    })

    overallPresent += roomPresent
    overallAbsent += roomAbsent
    overallScheduled += roomScheduled
    overallExpected += roomExpected

    return {
      classroomId: room.id,
      classroomName: room.name,
      capacity: room.capacity,
      days,
      totals: {
        present: roomPresent,
        absent: roomAbsent,
        scheduled: roomScheduled,
        expected: roomExpected,
      },
    }
  })

  return {
    days: dates,
    rows,
    overall: {
      present: overallPresent,
      absent: overallAbsent,
      scheduled: overallScheduled,
      expected: overallExpected,
    },
  }
}
