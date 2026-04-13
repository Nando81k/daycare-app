import Link from "next/link"

import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import {
  adminAttendanceBoard,
  adminClassrooms,
  adminClassroomsPageContent,
  adminReportBars,
} from "@/data/admin"
import type {
  AdminTableColumn,
  AdminTableRow,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  ReportBarPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "classroom", header: "Classroom" },
  { key: "leadTeacher", header: "Lead teacher" },
  { key: "enrollment", header: "Enrollment", align: "end" },
  { key: "ratio", header: "Ratio" },
  { key: "nextEvent", header: "Next event" },
]

function getRows(classrooms: ClassroomSummaryPreview[]): AdminTableRow[] {
  return classrooms.map((room) => ({
    classroom: {
      primary: room.name,
      secondary: room.ageGroup,
    },
    leadTeacher: room.leadTeacher,
    enrollment: `${room.enrolled}/${room.capacity}`,
    ratio: room.ratio,
    nextEvent: {
      primary: room.nextEvent,
      secondary: room.note,
    },
  }))
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
  const rows = getRows(classrooms)
  const totalEnrolled = classrooms.reduce((total, room) => total + room.enrolled, 0)
  const totalCapacity = classrooms.reduce((total, room) => total + room.capacity, 0)
  const totalOpenings = totalCapacity - totalEnrolled
  const fullRooms = classrooms.filter((room) => room.enrolled === room.capacity).length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminClassroomsPageContent.eyebrow}
        title={adminClassroomsPageContent.title}
        description={adminClassroomsPageContent.description}
        actions={
          <>
            <Link href="/admin/attendance" className={buttonVariants({ variant: "outline" })}>
              Open attendance
            </Link>
            <Link href="/admin/waitlist" className={buttonVariants({ variant: "default" })}>
              Review waitlist fit
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Current enrollment</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {totalEnrolled}/{totalCapacity}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Open spots</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{totalOpenings}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Rooms at capacity</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{fullRooms}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Daily room board</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendanceBoard.length} classrooms</p>
        </div>
      </AdminPageHeader>

      <div className="grid gap-4 xl:grid-cols-3">
        {classrooms.map((room) => {
          const width = Math.round((room.enrolled / room.capacity) * 100)

          return (
            <SurfaceCard key={room.id} className="gap-4 px-6 py-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{room.ageGroup}</p>
                <h2 className="text-2xl text-foreground">{room.name}</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">Occupancy</span>
                  <span className="text-muted-foreground">
                    {room.enrolled}/{room.capacity}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted/80">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${width}%` }} />
                </div>
              </div>
              <div className="grid gap-2 text-sm leading-6 text-muted-foreground">
                <p>Lead teacher: {room.leadTeacher}</p>
                <p>{room.ratio}</p>
                <p>{room.nextEvent}</p>
                <p>{room.note}</p>
              </div>
            </SurfaceCard>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <AdminDataTable
          title="Classroom planning"
          description="Room summaries should make enrollment, staffing, and near-term scheduling easy to compare."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search classroom, teacher, or event"
          searchKeys={["classroom", "leadTeacher", "nextEvent"]}
        />
        <AdminBarChart
          title="Attendance by classroom"
          description="A fast visual check for room-level presence before staff start jumping between tabs."
          data={attendanceBars}
        />
      </div>
    </PageShell>
  )
}
