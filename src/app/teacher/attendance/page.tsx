import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import { TeacherAttendancePageView } from "@/components/teacher/teacher-attendance-page"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { getTeacherAttendanceForDate, todayIso } from "@/lib/dal/attendance"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const requested = params.date && ISO_DATE_PATTERN.test(params.date) ? params.date : undefined
  const date = requested ?? todayIso()
  const data = await getTeacherAttendanceForDate(date)

  if (!data.hasClassroom) {
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
        </div>
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            You don&apos;t have a classroom assigned yet. Ask the director to
            add you to one from the Staff page.
          </p>
        </SurfaceCard>
      </PageShell>
    )
  }

  return <TeacherAttendancePageView attendance={data} />
}
