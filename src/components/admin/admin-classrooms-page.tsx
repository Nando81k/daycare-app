"use client"

import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import {
  CalendarClock,
  ChevronRightIcon,
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
  formatAdminLabel,
  getChildAttendanceVariant,
} from "@/components/admin/admin-status"
import {
  ClassroomDrawer,
  type ClassroomDrawerMode,
} from "@/components/admin/classrooms/classroom-drawer"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { initialMutationState } from "@/lib/action-state"
import { cn } from "@/lib/utils"
import {
  adminAttendanceBoard,
  adminChildrenHub,
  adminClassrooms,
  adminClassroomsPageContent,
  adminReportBars,
} from "@/data/admin"
import type {
  AdminActionState,
  AdminChildHubRecord,
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
  childRecords = adminChildrenHub,
}: {
  classrooms?: ClassroomSummaryPreview[]
  attendanceBoard?: ClassroomAttendancePreview[]
  attendanceBars?: ReportBarPreview[]
  childRecords?: AdminChildHubRecord[]
}) {
  const [drawerMode, setDrawerMode] = useState<ClassroomDrawerMode | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rosterClassroomId, setRosterClassroomId] = useState<string | null>(null)
  const rosterClassroom =
    classrooms.find((room) => room.id === rosterClassroomId) ?? null
  const rosterChildren = useMemo(
    () =>
      rosterClassroomId
        ? childRecords.filter((child) => child.classroomId === rosterClassroomId)
        : [],
    [childRecords, rosterClassroomId],
  )
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
                role="button"
                tabIndex={0}
                onClick={() => setRosterClassroomId(room.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setRosterClassroomId(room.id)
                  }
                }}
                aria-label={`Open ${room.name} roster`}
                className={cn(
                  "group relative cursor-pointer gap-4 px-5 py-5 transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {room.ageGroup || "Age group not set"}
                    </p>
                    <h2 className="text-xl text-foreground">{room.name}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(room)
                        }}
                        aria-label={`Edit ${room.name}`}
                        title="Edit classroom"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleRemove(room)
                        }}
                        aria-label={`Remove ${room.name}`}
                        title="Remove classroom"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* Classroom roster drawer — opens when a classroom card is clicked */}
      <Sheet
        open={rosterClassroom !== null}
        onOpenChange={(open) => {
          if (!open) setRosterClassroomId(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          {rosterClassroom && (
            <>
              <SheetHeader className="gap-2 border-b border-border/60 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Classroom roster
                </p>
                <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {rosterClassroom.name}
                </SheetTitle>
                <SheetDescription>
                  {rosterChildren.length} of {rosterClassroom.capacity} seats filled
                  {rosterClassroom.leadTeacher
                    ? ` · Lead: ${rosterClassroom.leadTeacher}`
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {rosterChildren.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No children are currently assigned to this classroom.
                  </p>
                ) : (
                  <ul className="-mx-2 flex flex-col">
                    {rosterChildren.map((child) => (
                      <li key={child.id}>
                        <Link
                          href="/admin/families"
                          onClick={() => setRosterClassroomId(null)}
                          className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted/40"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="truncate text-sm font-medium text-foreground">
                              {child.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {child.ageLabel} · {child.familyName}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge variant={getChildAttendanceVariant(child.attendanceStatus)}>
                              {formatAdminLabel(child.attendanceStatus)}
                            </StatusBadge>
                            <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
