import Link from "next/link"
import { ClipboardList, Sparkles, Users } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { TeacherRosterRow } from "@/components/teacher/teacher-roster-row"
import { buttonVariants } from "@/components/ui/button"
import { getTeacherDashboardData } from "@/lib/dal/teacher"

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

  const {
    classroom,
    children,
    presentCount,
    absentCount,
    scheduledCount,
    reportsPostedToday,
  } = data

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
            {classroom.ageGroup} · {classroom.enrolled}/{classroom.capacity}{" "}
            enrolled
            {classroom.ratio ? ` · ${classroom.ratio}` : ""}
          </p>
        </div>
        <Link
          href="/teacher/daily-reports"
          className={buttonVariants({ variant: "outline" })}
        >
          <ClipboardList className="h-4 w-4" />
          Bulk reports view
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl border border-border/60 bg-card px-5 py-3 text-sm">
        <Metric
          label="Present"
          value={presentCount}
          tone="text-emerald-700"
        />
        <Metric label="Absent" value={absentCount} tone="text-red-700" />
        <Metric
          label="Scheduled"
          value={scheduledCount}
          tone="text-sky-700"
        />
        <Metric
          label="Reports"
          value={`${reportsPostedToday} / ${children.length}`}
          tone={
            reportsPostedToday === children.length && children.length > 0
              ? "text-emerald-700"
              : "text-muted-foreground"
          }
        />
      </div>

      <SurfaceCard className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Roster
            </p>
            <h2 className="mt-1 text-xl">Today&apos;s roster</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {children.length} {children.length === 1 ? "child" : "children"}
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
          <ul className="space-y-3">
            {children.map((child) => (
              <TeacherRosterRow key={child.id} child={child} />
            ))}
          </ul>
        )}
      </SurfaceCard>
    </PageShell>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: string
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className={`text-base font-semibold tabular-nums ${tone}`}>
        {value}
      </span>
    </div>
  )
}
