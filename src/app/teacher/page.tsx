import Link from "next/link"
import {
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  Sparkles,
  Users,
} from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { getTeacherDashboardData } from "@/lib/dal/teacher"
import type { StatusBadgeVariant } from "@/types/app"

function statusTone(
  status: "PRESENT" | "ABSENT" | "SCHEDULED" | null
): StatusBadgeVariant {
  switch (status) {
    case "PRESENT":
      return "success"
    case "ABSENT":
      return "destructive"
    case "SCHEDULED":
      return "info"
    default:
      return "secondary"
  }
}

function statusLabel(status: "PRESENT" | "ABSENT" | "SCHEDULED" | null) {
  if (!status) return "Not marked"
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export default async function TeacherDashboardPage() {
  const data = await getTeacherDashboardData()

  if (!data.classroom) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <SurfaceCard className="space-y-4 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="text-2xl text-foreground">
            Welcome, {data.teacher.name.split(" ")[0]}!
          </h1>
          <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">
            Your account is set up but no classroom is assigned yet. Ask the
            director to add you to a classroom from the Staff page.
          </p>
        </SurfaceCard>
      </PageShell>
    )
  }

  const { classroom, children, presentCount, absentCount, scheduledCount, reportsPostedToday } = data

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Today · {classroom.name}
          </p>
          <h1 className="mt-1 text-3xl tracking-tight">
            Hi, {data.teacher.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {classroom.ageGroup} · {classroom.enrolled}/{classroom.capacity} enrolled
            {classroom.ratio ? ` · ${classroom.ratio}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/attendance"
            className={buttonVariants({ variant: "outline" })}
          >
            <CalendarCheck className="h-4 w-4" />
            Mark attendance
          </Link>
          <Link
            href="/teacher/daily-reports"
            className={buttonVariants()}
          >
            <ClipboardList className="h-4 w-4" />
            Post daily reports
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Present" value={presentCount} tone="success" />
        <Stat label="Absent" value={absentCount} tone="destructive" />
        <Stat label="Scheduled" value={scheduledCount} tone="info" />
        <Stat
          label="Reports posted"
          value={`${reportsPostedToday} / ${children.length}`}
          tone={reportsPostedToday === children.length ? "success" : "secondary"}
        />
      </div>

      <SurfaceCard className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Roster
            </p>
            <h2 className="mt-1 text-xl">Today&apos;s roster</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {children.length} children
          </span>
        </div>

        {children.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No children assigned to this classroom yet.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {children.map((child) => {
              const hasReport = !!child.todayReportSummary
              const tone = statusTone(child.todayStatus)
              return (
                <li
                  key={child.id}
                  className="rounded-xl border border-border/60 bg-background/80 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                          {child.firstName.charAt(0)}
                          {child.lastName.charAt(0)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {child.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {child.ageLabel}
                            {child.checkInAt
                              ? ` · arrived ${child.checkInAt}`
                              : ""}
                            {child.checkOutAt
                              ? ` · picked up ${child.checkOutAt}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge variant={tone}>
                        {statusLabel(child.todayStatus)}
                      </StatusBadge>
                      <StatusBadge variant={hasReport ? "success" : "secondary"}>
                        {hasReport ? "Report posted" : "No report"}
                      </StatusBadge>
                      {child.allergies.length > 0 && (
                        <StatusBadge variant="warning">
                          <HeartPulse className="h-3 w-3" />
                          Allergy
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                  {(child.allergies.length > 0 ||
                    child.medicalNotes.length > 0) && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                      <span>
                        {[
                          child.allergies.length > 0
                            ? `Allergies: ${child.allergies.join(", ")}`
                            : null,
                          child.medicalNotes.length > 0
                            ? `Medical: ${child.medicalNotes.join(", ")}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </SurfaceCard>
    </PageShell>
  )
}

function Stat({
  label,
  value,
  tone = "secondary",
}: {
  label: string
  value: number | string
  tone?: StatusBadgeVariant
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <StatusBadge variant={tone}>·</StatusBadge>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  )
}
