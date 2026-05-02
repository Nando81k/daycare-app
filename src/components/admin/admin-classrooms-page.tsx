"use client"

import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import {
  CalendarClock,
  Pencil,
  Plus,
  School,
  Trash2,
  Users2,
} from "lucide-react"

import { removeClassroom } from "@/app/actions/admin"
import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  ClassroomDrawer,
  type ClassroomDrawerMode,
} from "@/components/admin/classrooms/classroom-drawer"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { initialMutationState } from "@/lib/action-state"
import {
  adminAttendanceBoard,
  adminClassrooms,
  adminClassroomsPageContent,
  adminReportBars,
} from "@/data/admin"
import type {
  AdminActionState,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  ReportBarPreview,
  StatusBadgeVariant,
} from "@/types/app"

function getOccupancyTone(percent: number): StatusBadgeVariant {
  if (percent >= 100) return "destructive"
  if (percent >= 85) return "warning"
  if (percent >= 50) return "info"
  return "success"
}

function describeOccupancy(percent: number) {
  if (percent >= 100) return "At capacity"
  if (percent >= 85) return "Almost full"
  if (percent === 0) return "No children yet"
  return "Open spots"
}

export function AdminClassroomsPageView({
  classrooms = adminClassrooms,
  attendanceBoard = adminAttendanceBoard,
  attendanceBars = adminReportBars.attendance,
}: {
  classrooms?: ClassroomSummaryPreview[]
  attendanceBoard?: ClassroomAttendancePreview[]
  attendanceBars?: ReportBarPreview[]
}) {
  const [drawerMode, setDrawerMode] = useState<ClassroomDrawerMode | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [removeState, removeAction] = useActionState<AdminActionState, FormData>(
    removeClassroom,
    initialMutationState
  )

  const totalEnrolled = useMemo(
    () => classrooms.reduce((total, room) => total + room.enrolled, 0),
    [classrooms]
  )
  const totalCapacity = useMemo(
    () => classrooms.reduce((total, room) => total + room.capacity, 0),
    [classrooms]
  )
  const totalOpenings = totalCapacity - totalEnrolled
  const fullRooms = classrooms.filter(
    (room) => room.enrolled >= room.capacity && room.capacity > 0
  ).length

  function openCreate() {
    setDrawerMode({ kind: "create" })
    setDrawerOpen(true)
  }
  function openEdit(classroom: ClassroomSummaryPreview) {
    setDrawerMode({ kind: "edit", classroom })
    setDrawerOpen(true)
  }
  function handleRemove(classroom: ClassroomSummaryPreview) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Remove ${classroom.name}? Re-assign every child and staff member first.`
      )
    ) {
      return
    }
    const fd = new FormData()
    fd.append("classroomId", classroom.id)
    removeAction(fd)
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminClassroomsPageContent.eyebrow}
        title={adminClassroomsPageContent.title}
        description={adminClassroomsPageContent.description}
        actions={
          <>
            <Link
              href="/admin/attendance"
              className={buttonVariants({ variant: "outline" })}
            >
              Open attendance
            </Link>
            <Link
              href="/admin/staff"
              className={buttonVariants({ variant: "outline" })}
            >
              Manage staff
            </Link>
            <Button onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add classroom
            </Button>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Current enrollment
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {totalEnrolled} / {totalCapacity}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Open spots</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {totalOpenings}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Rooms at capacity
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {fullRooms}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Total rooms</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {classrooms.length}
          </p>
        </div>
      </AdminPageHeader>

      {(removeState.message || removeState.error) && (
        <p
          role={removeState.error ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-lg px-4 py-2 text-sm ${
            removeState.error
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {removeState.error ?? removeState.message}
        </p>
      )}

      {classrooms.length === 0 ? (
        <SurfaceCard className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <School className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">
              No classrooms yet
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Add your first classroom to start assigning children, staff, and
              schedules.
            </p>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add classroom
          </Button>
        </SurfaceCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((room) => {
            const percent =
              room.capacity > 0
                ? Math.round((room.enrolled / room.capacity) * 100)
                : 0
            const tone = getOccupancyTone(percent)
            const occupancyLabel = describeOccupancy(percent)
            return (
              <SurfaceCard
                key={room.id}
                className="group relative gap-4 px-5 py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {room.ageGroup || "Age group not set"}
                    </p>
                    <h2 className="text-xl text-foreground">{room.name}</h2>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(room)}
                      aria-label={`Edit ${room.name}`}
                      title="Edit classroom"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(room)}
                      aria-label={`Remove ${room.name}`}
                      title="Remove classroom"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Occupancy
                    </p>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {room.enrolled} / {room.capacity}
                      {room.capacity > 0 ? ` · ${percent}%` : ""}
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tone === "destructive"
                          ? "bg-destructive"
                          : tone === "warning"
                            ? "bg-amber-400"
                            : tone === "success"
                              ? "bg-success"
                              : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <StatusBadge variant={tone}>{occupancyLabel}</StatusBadge>
                </div>

                <ul className="grid gap-2 border-t border-border/40 pt-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Users2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      {room.leadTeacher ? (
                        <>
                          <span className="font-medium text-foreground">
                            {room.leadTeacher}
                          </span>{" "}
                          · lead teacher
                        </>
                      ) : (
                        <span className="italic">No lead teacher assigned</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <School className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{room.ratio || "Ratio not set"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{room.nextEvent || "No upcoming event"}</span>
                  </li>
                </ul>

                {room.note && (
                  <p className="rounded-lg bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
                    {room.note}
                  </p>
                )}
              </SurfaceCard>
            )
          })}
        </div>
      )}

      {attendanceBars.length > 0 && (
        <AdminBarChart
          title="Attendance by classroom"
          description="Today's room-level presence — useful for spotting coverage pressure."
          data={attendanceBars}
        />
      )}

      <ClassroomDrawer
        open={drawerOpen}
        onOpenChange={(next) => {
          setDrawerOpen(next)
          if (!next) setDrawerMode(null)
        }}
        mode={drawerMode}
      />
    </PageShell>
  )
}
