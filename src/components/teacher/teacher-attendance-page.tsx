"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { TeacherAttendanceRow } from "@/components/teacher/teacher-attendance-row"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AttendanceForDate } from "@/lib/dal/attendance"

export function TeacherAttendancePageView({
  attendance,
}: {
  attendance: AttendanceForDate
}) {
  const router = useRouter()
  const classroom = attendance.classrooms[0] ?? null
  const isToday = attendance.date === todayIsoBrowser()

  function handleDateChange(next: string) {
    if (!next) return
    if (next === todayIsoBrowser()) {
      router.push("/teacher/attendance")
    } else {
      router.push(`/teacher/attendance?date=${next}`)
    }
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div>
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {classroom
            ? `${classroom.name} · ${classroom.children.length} children`
            : "No classroom assigned yet"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/40 bg-muted/15 px-4 py-3 text-sm">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Date
        </span>
        <Input
          type="date"
          value={attendance.date}
          max={todayIsoBrowser()}
          onChange={(event) => handleDateChange(event.target.value)}
          className="h-9 w-[10rem] text-sm"
        />
        <span className="text-muted-foreground">{formatLongDate(attendance.date)}</span>
        {!isToday ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleDateChange(todayIsoBrowser())}
            className="ml-auto"
          >
            Jump to today
          </Button>
        ) : (
          <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Today
          </span>
        )}
      </div>

      {!classroom || classroom.children.length === 0 ? (
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            {classroom
              ? `No children are enrolled in ${classroom.name} yet.`
              : "No classroom assigned yet."}
          </p>
        </SurfaceCard>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Expected" value={attendance.totals.expected} />
          <Stat label="Present" value={attendance.totals.present} tone="present" />
          <Stat label="Absent" value={attendance.totals.absent} tone="absent" />
          <Stat label="Scheduled" value={attendance.totals.scheduled} />
        </div>
      )}

      {classroom && classroom.children.length > 0 && (
        <div className="space-y-3">
          {classroom.children.map((child) => (
            <TeacherAttendanceRow
              key={child.id}
              date={attendance.date}
              child={{
                id: child.id,
                name: child.name,
                ageLabel: child.ageLabel,
                todayStatus:
                  child.status === "present"
                    ? "PRESENT"
                    : child.status === "absent"
                      ? "ABSENT"
                      : "SCHEDULED",
                checkInAt: child.checkInValue,
                checkOutAt: child.checkOutValue,
                todayNote: child.note,
                history: child.history,
              }}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "present" | "absent"
}) {
  const accent =
    tone === "present"
      ? "text-emerald-700"
      : tone === "absent"
        ? "text-rose-700"
        : "text-foreground"
  return (
    <div className="rounded-md border border-border/50 bg-card px-3 py-2.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

function todayIsoBrowser() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatLongDate(iso: string) {
  const [year, month, day] = iso.split("-").map((p) => Number(p))
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}
