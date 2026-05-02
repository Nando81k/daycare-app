import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { TeacherDailyReportForm } from "@/components/teacher/teacher-daily-report-form"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

export default async function TeacherDailyReportsPage() {
  const user = await requireRole("TEACHER")
  const profile = await prisma.staffProfile.findFirst({
    where: { userId: user.id },
    include: {
      classroom: {
        include: {
          children: {
            orderBy: { firstName: "asc" },
            include: {
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
        <h1 className="mt-2 text-3xl tracking-tight">Daily reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile?.classroom
            ? `${profile.classroom.name} · ${profile.classroom.children.length} children`
            : "No classroom assigned yet"}
        </p>
      </div>

      {!profile?.classroom ? (
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            You don&apos;t have a classroom assigned yet. Ask the director to
            add you to one from the Staff page.
          </p>
        </SurfaceCard>
      ) : profile.classroom.children.length === 0 ? (
        <SurfaceCard className="p-6">
          <p className="text-sm leading-7 text-muted-foreground">
            No children are enrolled in {profile.classroom.name} yet.
          </p>
        </SurfaceCard>
      ) : (
        <div className="space-y-4">
          {profile.classroom.children.map((child) => {
            const report = child.dailyReports[0]
            const meals = Array.isArray(report?.meals)
              ? (report?.meals as unknown[]).map(String)
              : []
            const rest = Array.isArray(report?.rest)
              ? (report?.rest as unknown[]).map(String)
              : []
            const activities = Array.isArray(report?.activities)
              ? (report?.activities as unknown[]).map(String)
              : []
            const staffNotes = Array.isArray(report?.staffNotes)
              ? (report?.staffNotes as unknown[]).map(String)
              : []

            return (
              <TeacherDailyReportForm
                key={child.id}
                initial={{
                  childId: child.id,
                  childName: `${child.firstName} ${child.lastName}`.trim(),
                  ageLabel: child.ageLabel,
                  arrivalMood: report?.arrivalMood ?? "",
                  summary: report?.summary ?? "",
                  meals,
                  rest,
                  activities,
                  staffNotes,
                }}
              />
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
