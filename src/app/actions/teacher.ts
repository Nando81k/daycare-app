"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assertTeacherCanEditChild } from "@/lib/dal/teacher"
import {
  getMutationState as getActionState,
  getFieldErrors,
  getStringValue,
} from "@/lib/action-state"
import {
  upsertAttendanceRecordSchema,
  upsertChildDailyReportSchema,
} from "@/lib/validators/admin"
import type { AdminActionState } from "@/types/app"

const SCHOOL_DAY_TZ_OFFSET_MINUTES = 0 // school day is interpreted in local TZ

function startOfToday() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - SCHOOL_DAY_TZ_OFFSET_MINUTES)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfDayFromIso(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map((p) => Number(p))
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

function combineDateAndTime(time: string | undefined, day: Date) {
  if (!time) return null
  const [hh, mm] = time.split(":").map((v) => Number.parseInt(v, 10))
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  const d = new Date(day)
  d.setHours(hh, mm, 0, 0)
  return d
}

export async function teacherUpsertAttendance(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const user = await requireRole("TEACHER")
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
        error: "Check the attendance details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    await assertTeacherCanEditChild(user.id, parsed.data.childId)

    const day = parsed.data.date ? startOfDayFromIso(parsed.data.date) : startOfToday()
    const checkInAt = combineDateAndTime(parsed.data.checkInAt, day)
    const checkOutAt = combineDateAndTime(parsed.data.checkOutAt, day)

    await prisma.attendanceRecord.upsert({
      where: {
        childId_date: { childId: parsed.data.childId, date: day },
      },
      update: {
        status: parsed.data.status,
        checkInAt,
        checkOutAt,
        note: parsed.data.note ?? "",
      },
      create: {
        childId: parsed.data.childId,
        date: day,
        status: parsed.data.status,
        checkInAt,
        checkOutAt,
        note: parsed.data.note ?? "",
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "teacher.attendance.upsert",
        subjectType: "AttendanceRecord",
        subjectId: parsed.data.childId,
        details: { status: parsed.data.status },
      },
    })

    revalidatePath("/teacher")
    revalidatePath("/teacher/attendance")
    revalidatePath("/parent")
    revalidatePath("/parent/attendance")

    return getActionState({
      success: true,
      message: "Attendance saved.",
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not save attendance right now.",
    })
  }
}

export async function teacherUpsertDailyReport(
  _previousState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    const user = await requireRole("TEACHER")
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
        error: "Check the daily report details and try again.",
        fieldErrors: getFieldErrors(parsed.error),
      })
    }

    await assertTeacherCanEditChild(user.id, parsed.data.childId)

    const today = startOfToday()
    const meals = parsed.data.mealsText
      ? parsed.data.mealsText.split("\n").map((s) => s.trim()).filter(Boolean)
      : []
    const rest = parsed.data.restText
      ? parsed.data.restText.split("\n").map((s) => s.trim()).filter(Boolean)
      : []
    const activities = parsed.data.activitiesText
      ? parsed.data.activitiesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const staffNotes = parsed.data.staffNotesText
      ? parsed.data.staffNotesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    await prisma.dailyReport.upsert({
      where: {
        childId_date: { childId: parsed.data.childId, date: today },
      },
      update: {
        arrivalMood: parsed.data.arrivalMood,
        summary: parsed.data.summary,
        meals,
        rest,
        activities,
        staffNotes,
      },
      create: {
        childId: parsed.data.childId,
        date: today,
        arrivalMood: parsed.data.arrivalMood,
        summary: parsed.data.summary,
        meals,
        rest,
        activities,
        staffNotes,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "teacher.daily-report.upsert",
        subjectType: "DailyReport",
        subjectId: parsed.data.childId,
        details: { summary: parsed.data.summary.slice(0, 80) },
      },
    })

    revalidatePath("/teacher")
    revalidatePath("/teacher/daily-reports")
    revalidatePath(`/parent/child`)

    return getActionState({
      success: true,
      message: "Daily report saved.",
    })
  } catch (error) {
    return getActionState({
      error:
        error instanceof Error
          ? error.message
          : "We could not save this report right now.",
    })
  }
}
