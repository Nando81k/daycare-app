import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { TeacherAttendanceRow } from "@/components/teacher/teacher-attendance-row"
import { getTeacherDashboardData } from "@/lib/dal/teacher"

export default async function TeacherAttendancePage() {
  const data = await getTeacherDashboardData()

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
          {data.classroom
            ? `${data.classroom.name} · ${data.children.length} children`
            : "No classroom assigned yet"}
        </p>
      </div>

      {data.classroom === null ? (
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            You don&apos;t have a classroom assigned yet. Ask the director to
            add you to one from the Staff page.
          </p>
        </SurfaceCard>
      ) : data.children.length === 0 ? (
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            No children are enrolled in {data.classroom.name} yet.
          </p>
        </SurfaceCard>
      ) : (
        <div className="space-y-3">
          {data.children.map((child) => (
            <TeacherAttendanceRow
              key={child.id}
              child={{
                id: child.id,
                name: child.fullName,
                ageLabel: child.ageLabel,
                todayStatus: child.todayStatus,
                checkInAt: child.checkInAt
                  ? to24h(child.checkInAt)
                  : null,
                checkOutAt: child.checkOutAt
                  ? to24h(child.checkOutAt)
                  : null,
                todayNote: child.todayNote,
              }}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

/**
 * The DAL returns formatted "9:14 AM" strings; the time inputs need "HH:MM"
 * 24-hour format. Convert when the DAL value looks like a clock string.
 */
function to24h(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return ""
  let hour = Number.parseInt(match[1], 10)
  const minute = match[2]
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === "PM" && hour < 12) hour += 12
  if (meridiem === "AM" && hour === 12) hour = 0
  return `${String(hour).padStart(2, "0")}:${minute}`
}
