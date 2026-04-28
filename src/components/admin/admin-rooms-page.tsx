"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminAttendanceEditor } from "@/components/admin/admin-attendance-editor"
import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import {
  DrawerBody,
  DrawerSummary,
} from "@/components/admin/admin-detail-drawer"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
  getStaffVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminAttendanceBoard,
  adminChildren,
  adminClassrooms,
  adminReportBars,
  adminRoomsPageContent,
  adminStaffProfiles,
} from "@/data/admin"
import type {
  AdminChildRecordPreview,
  AdminTableColumn,
  AdminTableRow,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  ReportBarPreview,
  StaffProfilePreview,
} from "@/types/app"

/* ── Attendance columns & row mapper ────────────────────── */

const attendanceColumns: AdminTableColumn[] = [
  { key: "child", header: "Child" },
  { key: "classroom", header: "Classroom" },
  { key: "family", header: "Family" },
  { key: "status", header: "Status" },
  { key: "billing", header: "Billing" },
  { key: "documents", header: "Documents" },
]

function getAttendanceRows(children: AdminChildRecordPreview[]): AdminTableRow[] {
  return children.map((child) => ({
    _id: child.id,
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
  }))
}

/* ── Staff columns & row mapper ─────────────────────────── */

const staffColumns: AdminTableColumn[] = [
  { key: "staff", header: "Staff" },
  { key: "classroom", header: "Classroom" },
  { key: "certification", header: "Certification" },
  { key: "status", header: "Status" },
  { key: "note", header: "Note" },
]

function getStaffRows(staffProfiles: StaffProfilePreview[]): AdminTableRow[] {
  return staffProfiles.map((profile) => ({
    staff: {
      primary: profile.name,
      secondary: profile.role,
    },
    classroom: profile.classroom,
    certification: profile.certification,
    status: {
      label: formatAdminLabel(profile.status),
      variant: getStaffVariant(profile.status),
    },
    note: profile.note,
  }))
}

/* ── Unified rooms & operations view ────────────────────── */

export function AdminRoomsPageView({
  classrooms = adminClassrooms,
  attendanceBoard = adminAttendanceBoard,
  attendanceBars = adminReportBars.attendance,
  childRecords = adminChildren,
  staffProfiles = adminStaffProfiles,
}: {
  classrooms?: ClassroomSummaryPreview[]
  attendanceBoard?: ClassroomAttendancePreview[]
  attendanceBars?: ReportBarPreview[]
  childRecords?: AdminChildRecordPreview[]
  staffProfiles?: StaffProfilePreview[]
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  const attendanceRows = getAttendanceRows(childRecords)
  const staffRows = getStaffRows(staffProfiles)

  const selectedChild = childRecords.find((c) => c.id === selectedChildId) ?? null

  const totalEnrolled = classrooms.reduce((sum, r) => sum + r.enrolled, 0)
  const totalCapacity = classrooms.reduce((sum, r) => sum + r.capacity, 0)
  const totalOpenings = totalCapacity - totalEnrolled
  const present = attendanceBoard.reduce((sum, r) => sum + r.present, 0)
  const coveragePressure = staffProfiles.filter((p) => p.status !== "scheduled").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminRoomsPageContent.eyebrow}
          </p>
          <CardTitle>{adminRoomsPageContent.title}</CardTitle>
          <CardDescription>{adminRoomsPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/enrollment" className={buttonVariants({ variant: "outline" })}>
              Enrollment pipeline
            </Link>
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Family hub
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Enrollment</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {totalEnrolled}/{totalCapacity}
              </p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Open spots</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{totalOpenings}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Present today</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{present}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Coverage alerts</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{coveragePressure}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {coveragePressure > 0 && (
        <AlertBanner
          tone="warning"
          title="Coverage needs should be visible before ratios get tight"
          description={`${coveragePressure} staff member${coveragePressure > 1 ? "s" : ""} need${coveragePressure === 1 ? "s" : ""} coverage planning. Check the Staff tab to review assignments.`}
        />
      )}

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms ({classrooms.length})</TabsTrigger>
          <TabsTrigger value="attendance">Attendance ({childRecords.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({staffProfiles.length})</TabsTrigger>
        </TabsList>

        {/* Rooms tab */}
        <TabsContent value="rooms" className="mt-4 space-y-6">
          <div className="grid gap-4 xl:grid-cols-3">
            {classrooms.map((room) => {
              const board = attendanceBoard.find((b) => b.classroom === room.name)
              const width = room.capacity > 0
                ? Math.round((room.enrolled / room.capacity) * 100)
                : 0

              return (
                <Card key={room.id}>
                  <CardHeader className="pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {room.ageGroup}
                    </p>
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-foreground">Occupancy</span>
                        <span className="text-muted-foreground">
                          {room.enrolled}/{room.capacity}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted/80">
                        <div
                          className="h-full rounded-full bg-primary/80"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                    {board && (
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <p className="text-xs text-muted-foreground">Present</p>
                          <p className="text-sm font-semibold">{board.present}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <p className="text-xs text-muted-foreground">Absent</p>
                          <p className="text-sm font-semibold">{board.absent}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-2 py-2">
                          <p className="text-xs text-muted-foreground">Late</p>
                          <p className="text-sm font-semibold">{board.late}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid gap-1 text-sm leading-6 text-muted-foreground">
                      <p>Lead: {room.leadTeacher}</p>
                      <p>{room.ratio}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <AdminBarChart
            title="Attendance by classroom"
            description="A fast visual check for room-level presence before staff start jumping between tabs."
            data={attendanceBars}
          />
        </TabsContent>

        {/* Attendance tab */}
        <TabsContent value="attendance" className="mt-4">
          <AdminDataTable
            title="Child attendance"
            description="Search the roster when a classroom board needs child-level follow-up."
            columns={attendanceColumns}
            rows={attendanceRows}
            searchPlaceholder="Search child, classroom, or status"
            searchKeys={["child", "classroom", "family", "status"]}
            onRowClick={(row) => setSelectedChildId(row._id as string)}
          />
        </TabsContent>

        {/* Staff tab */}
        <TabsContent value="staff" className="mt-4 space-y-6">
          <AdminDataTable
            title="Staff directory"
            description="Search by teacher, room, or status when the day starts shifting."
            columns={staffColumns}
            rows={staffRows}
            searchPlaceholder="Search staff, room, or certification"
            searchKeys={["staff", "classroom", "certification", "status"]}
          />

          {staffProfiles.some((p) => p.status !== "scheduled") && (
            <Card>
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Coverage actions
                </p>
                <CardTitle className="text-xl">What needs planning today</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {staffProfiles
                  .filter((profile) => profile.status !== "scheduled")
                  .map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {profile.role} · {profile.classroom}
                        </p>
                      </div>
                      <StatusBadge variant={getStaffVariant(profile.status)}>
                        {formatAdminLabel(profile.status)}
                      </StatusBadge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Attendance editor sheet */}
      <Sheet
        open={!!selectedChild}
        onOpenChange={(open) => {
          if (!open) setSelectedChildId(null)
        }}
      >
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b border-border/60 px-5 py-3">
            <SheetTitle className="text-base">Update attendance</SheetTitle>
          </SheetHeader>
          {selectedChild && (
            <DrawerBody>
              <DrawerSummary
                title={selectedChild.name}
                subtitle={`${selectedChild.ageLabel} · ${selectedChild.classroom}`}
                badges={
                  <StatusBadge variant={getChildAttendanceVariant(selectedChild.attendanceStatus)}>
                    {formatAdminLabel(selectedChild.attendanceStatus)}
                  </StatusBadge>
                }
                meta={<span>{selectedChild.familyName}</span>}
              />
              <AdminAttendanceEditor
                key={selectedChild.id}
                child={selectedChild}
                onClear={() => setSelectedChildId(null)}
              />
            </DrawerBody>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
