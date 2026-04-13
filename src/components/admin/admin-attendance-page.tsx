"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminAttendanceEditor } from "@/components/admin/admin-attendance-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  adminAttendanceBoard,
  adminAttendancePageContent,
  adminChildren,
  adminReportBars,
} from "@/data/admin"
import type {
  AdminChildRecordPreview,
  AdminTableColumn,
  AdminTableRow,
  ClassroomAttendancePreview,
  ReportBarPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "child", header: "Child" },
  { key: "classroom", header: "Classroom" },
  { key: "family", header: "Family" },
  { key: "status", header: "Status" },
  { key: "billing", header: "Billing" },
  { key: "documents", header: "Documents" },
  { key: "actions", header: "Actions", align: "end" },
]

function getRows(
  children: AdminChildRecordPreview[],
  selectedChildId: string | null,
  onSelectChild: (childId: string) => void
): AdminTableRow[] {
  return children.map((child) => ({
    child: {
      primary: child.name,
      secondary: `${child.ageLabel} · ${child.attendanceNote}`,
    },
    classroom: child.classroom,
    family: child.familyName,
    status: {
      label: formatAdminLabel(child.attendanceStatus),
      variant: getChildAttendanceVariant(child.attendanceStatus),
    },
    billing: {
      label: formatAdminLabel(child.balanceStatus),
      variant: getFamilyBalanceVariant(child.balanceStatus),
    },
    documents: {
      label: formatAdminLabel(child.documentsStatus),
      variant: getDocumentVariant(child.documentsStatus),
    },
    actions: {
      type: "custom",
      searchValue: `Edit ${child.name}`,
      content: (
        <Button
          size="sm"
          variant={selectedChildId === child.id ? "secondary" : "outline"}
          onClick={() => onSelectChild(child.id)}
        >
          {selectedChildId === child.id ? "Editing" : "Edit"}
        </Button>
      ),
    },
  }))
}

export function AdminAttendancePageView({
  attendanceBoard = adminAttendanceBoard,
  childRecords = adminChildren,
  attendanceBars = adminReportBars.attendance,
}: {
  attendanceBoard?: ClassroomAttendancePreview[]
  childRecords?: AdminChildRecordPreview[]
  attendanceBars?: ReportBarPreview[]
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(childRecords[0]?.id ?? null)
  const rows = getRows(childRecords, selectedChildId, setSelectedChildId)
  const selectedChild = childRecords.find((child) => child.id === selectedChildId) ?? null
  const expected = attendanceBoard.reduce((total, room) => total + room.expected, 0)
  const present = attendanceBoard.reduce((total, room) => total + room.present, 0)
  const absent = attendanceBoard.reduce((total, room) => total + room.absent, 0)
  const late = attendanceBoard.reduce((total, room) => total + room.late, 0)

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminAttendancePageContent.eyebrow}
        title={adminAttendancePageContent.title}
        description={adminAttendancePageContent.description}
        actions={
          <>
            <Link href="/admin/children" className={buttonVariants({ variant: "outline" })}>
              Open child roster
            </Link>
            <Link href="/admin/classrooms" className={buttonVariants({ variant: "default" })}>
              Open classrooms
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Expected today</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{expected}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Present</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{present}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Absent</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{absent}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Late arrivals</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{late}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="info"
        title="Attendance should support staffing decisions, not just counts"
        description="The board keeps room-level numbers obvious, then lets staff drill into child context when a classroom needs follow-up."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {attendanceBoard.map((room) => (
          <SurfaceCard key={room.classroom} density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Attendance board</p>
              <h2 className="text-xl text-foreground">{room.classroom}</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Present</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{room.present}</p>
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Absent</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{room.absent}</p>
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Late</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{room.late}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{room.note}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <AdminBarChart
          title="Attendance rate by room"
          description="A quick visual check helps identify coverage pressure without turning the page into a chart wall."
          data={attendanceBars}
        />

        {selectedChild ? (
          <AdminAttendanceEditor
            key={selectedChild.id}
            child={selectedChild}
            onClear={() => setSelectedChildId(null)}
          />
        ) : (
          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Attendance editor</p>
              <h2 className="text-xl text-foreground">Select a child to update</h2>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Use the row action in the attendance table to adjust today&apos;s status, times, and note. Parent-facing attendance views refresh after each save.
            </p>
          </SurfaceCard>
        )}
      </div>

      <AdminDataTable
        title="Child attendance context"
        description="Search the roster when a classroom board needs child-level follow-up."
        columns={columns}
        rows={rows}
        searchPlaceholder="Search child, classroom, or status"
        searchKeys={["child", "classroom", "family", "status", "actions"]}
      />
    </PageShell>
  )
}
