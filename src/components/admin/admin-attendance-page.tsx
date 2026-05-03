"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronRightIcon } from "lucide-react"

import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminAttendanceEditor } from "@/components/admin/admin-attendance-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
} from "@/components/admin/admin-status"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminAttendancePageContent, adminReportBars } from "@/data/admin"
import type { AttendanceChildRow, AttendanceForDate } from "@/lib/dal/attendance"
import { cn } from "@/lib/utils"
import type {
  AdminTableColumn,
  AdminTableRow,
  ReportBarPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "child", header: "Child" },
  { key: "classroom", header: "Classroom" },
  { key: "family", header: "Family" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "end" },
]

type StatusFilter = "all" | "present" | "absent" | "scheduled"

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "scheduled", label: "Scheduled" },
]

function getRows(
  children: AttendanceChildRow[],
  selectedChildId: string | null,
  onSelectChild: (childId: string) => void,
): AdminTableRow[] {
  return children.map((child) => ({
    _id: child.id,
    child: {
      primary: child.name,
      secondary: child.note ? `${child.ageLabel} · ${child.note}` : child.ageLabel,
    },
    classroom: child.classroomName,
    family: child.familyName,
    status: {
      label: formatAdminLabel(child.status),
      variant: getChildAttendanceVariant(child.status),
    },
    actions: {
      type: "custom",
      searchValue: `Edit ${child.name}`,
      content: (
        <Button
          size="sm"
          variant={selectedChildId === child.id ? "default" : "outline"}
          onClick={() => onSelectChild(child.id)}
        >
          {selectedChildId === child.id ? "Editing" : "Edit"}
        </Button>
      ),
    },
  }))
}

export function AdminAttendancePageView({
  attendance,
  attendanceBars = adminReportBars.attendance,
}: {
  attendance: AttendanceForDate
  attendanceBars?: ReportBarPreview[]
}) {
  const router = useRouter()
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const allChildren = useMemo(
    () => attendance.classrooms.flatMap((room) => room.children),
    [attendance.classrooms],
  )

  const filteredChildren = useMemo(() => {
    if (statusFilter === "all") return allChildren
    return allChildren.filter((child) => child.status === statusFilter)
  }, [allChildren, statusFilter])

  const rows = getRows(filteredChildren, selectedChildId, setSelectedChildId)
  const selectedChild =
    allChildren.find((child) => child.id === selectedChildId) ?? null
  const selectedClassroom =
    attendance.classrooms.find((room) => room.id === selectedClassroomId) ?? null

  const statusCounts = {
    all: allChildren.length,
    present: attendance.totals.present,
    absent: attendance.totals.absent,
    scheduled: attendance.totals.scheduled,
  }

  const isToday = attendance.date === todayIsoBrowser()

  function handleDateChange(next: string) {
    if (!next) return
    if (next === todayIsoBrowser()) {
      router.push("/admin/attendance")
    } else {
      router.push(`/admin/attendance?date=${next}`)
    }
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminAttendancePageContent.eyebrow}
        title={adminAttendancePageContent.title}
        description={adminAttendancePageContent.description}
        actions={
          <>
            <Link href="/admin/attendance/history" className={buttonVariants({ variant: "outline" })}>
              View 30-day history
            </Link>
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Open families
            </Link>
            <Link href="/admin/classrooms" className={buttonVariants({ variant: "default" })}>
              Open classrooms
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Expected</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendance.totals.expected}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Present</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendance.totals.present}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Absent</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendance.totals.absent}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendance.totals.scheduled}</p>
        </div>
      </AdminPageHeader>

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

      {/* Primary action surface — filter + roster table at the top */}
      <div className="space-y-3">
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <TabsList className="bg-muted/30">
            {STATUS_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="gap-1.5"
              >
                {filter.label}
                <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
                  {statusCounts[filter.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AdminDataTable
          title={`Roster · ${formatLongDate(attendance.date)}`}
          description="Click any child to update their attendance — the editor opens in a side panel so you don't lose your place."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search child, classroom, or status"
          searchKeys={["child", "classroom", "family", "status", "actions"]}
        />
      </div>

      {/* Secondary context — classroom board + chart below */}
      <div className="grid gap-4 xl:grid-cols-3">
        {attendance.classrooms.map((room) => {
          const isSelected = selectedClassroomId === room.id
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedClassroomId(room.id)}
              aria-pressed={isSelected}
              className={cn(
                "group rounded-2xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "hover:-translate-y-0.5",
              )}
            >
              <SurfaceCard
                density="compact"
                className={cn(
                  "h-full gap-3 px-5 py-5 transition-shadow group-hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]",
                  isSelected && "ring-1 ring-primary/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Attendance board</p>
                    <h2 className="text-xl text-foreground">{room.name}</h2>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Present" value={room.presentCount} />
                  <Stat label="Absent" value={room.absentCount} />
                  <Stat label="Scheduled" value={room.scheduledCount} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {room.children.length} of {room.capacity} seats · {room.ageGroup}
                </p>
              </SurfaceCard>
            </button>
          )
        })}
      </div>

      <AdminBarChart
        title="Attendance rate by room"
        description="A quick visual check helps identify coverage pressure without turning the page into a chart wall."
        data={attendanceBars}
      />

      {/* Classroom roster drawer — opens when a board card is clicked */}
      <Sheet
        open={selectedClassroom !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedClassroomId(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          {selectedClassroom && (
            <>
              <SheetHeader className="gap-2 border-b border-border/60 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Classroom roster
                </p>
                <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {selectedClassroom.name}
                </SheetTitle>
                <SheetDescription>
                  {selectedClassroom.children.length} child
                  {selectedClassroom.children.length === 1 ? "" : "ren"} · click any child to edit attendance.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {selectedClassroom.children.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No children are currently assigned to this classroom.
                  </p>
                ) : (
                  <ul className="-mx-2 flex flex-col">
                    {selectedClassroom.children.map((child) => (
                      <li key={child.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChildId(child.id)
                            setSelectedClassroomId(null)
                          }}
                          className="group flex w-full items-center justify-between gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted/40"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="truncate text-sm font-medium text-foreground">{child.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {child.ageLabel} · {child.familyName}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge variant={getChildAttendanceVariant(child.status)}>
                              {formatAdminLabel(child.status)}
                            </StatusBadge>
                            <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Editor opens in a right-side drawer so admins never lose the roster context */}
      <Sheet
        open={selectedChild !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedChildId(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          {selectedChild && (
            <>
              <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                <SheetTitle className="text-lg">{selectedChild.name}</SheetTitle>
                <SheetDescription>
                  {selectedChild.classroomName} · {selectedChild.familyName}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <AdminAttendanceEditor
                  key={`${selectedChild.id}-${attendance.date}`}
                  child={selectedChild}
                  date={attendance.date}
                  onClear={() => setSelectedChildId(null)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
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
