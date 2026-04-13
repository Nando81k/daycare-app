import Link from "next/link"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getStaffVariant } from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  adminClassrooms,
  adminStaffPageContent,
  adminStaffProfiles,
} from "@/data/admin"
import type {
  AdminTableColumn,
  AdminTableRow,
  ClassroomSummaryPreview,
  StaffProfilePreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "staff", header: "Staff" },
  { key: "classroom", header: "Classroom" },
  { key: "certification", header: "Certification" },
  { key: "status", header: "Status" },
  { key: "note", header: "Note" },
]

function getRows(staffProfiles: StaffProfilePreview[]): AdminTableRow[] {
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

export function AdminStaffPageView({
  staffProfiles = adminStaffProfiles,
  classrooms = adminClassrooms,
}: {
  staffProfiles?: StaffProfilePreview[]
  classrooms?: ClassroomSummaryPreview[]
}) {
  const rows = getRows(staffProfiles)
  const scheduledCount = staffProfiles.filter((profile) => profile.status === "scheduled").length
  const coverageNeededCount = staffProfiles.filter((profile) => profile.status === "coverage-needed").length
  const outCount = staffProfiles.filter((profile) => profile.status === "out").length
  const roomCount = new Set(staffProfiles.map((profile) => profile.classroom)).size

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminStaffPageContent.eyebrow}
        title={adminStaffPageContent.title}
        description={adminStaffPageContent.description}
        actions={
          <>
            <Link href="/admin/classrooms" className={buttonVariants({ variant: "outline" })}>
              Open classrooms
            </Link>
            <Link href="/admin/attendance" className={buttonVariants({ variant: "default" })}>
              Check attendance
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Staff in sample view</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{staffProfiles.length}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{scheduledCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Coverage pressure</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{coverageNeededCount + outCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Room assignments</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{roomCount}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="warning"
        title="Coverage needs should be visible before ratios get tight"
        description="One team member is out and another still needs coverage planning. The staff page should surface that immediately."
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminDataTable
          title="Staff directory"
          description="Search by teacher, room, or status when the day starts shifting."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search staff, room, or certification"
          searchKeys={["staff", "classroom", "certification", "status"]}
        />

        <div className="grid gap-6">
          <SurfaceCard className="gap-4 px-6 py-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Coverage actions</p>
              <h2 className="text-2xl text-foreground">What needs planning today</h2>
            </div>
            <div className="grid gap-3">
              {staffProfiles
                .filter((profile) => profile.status !== "scheduled")
                .map((profile) => (
                  <div key={profile.id} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                      <StatusBadge variant={getStaffVariant(profile.status)}>
                        {formatAdminLabel(profile.status)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.role} · {profile.classroom}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{profile.note}</p>
                  </div>
                ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="gap-4 px-6 py-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Lead rooms</p>
              <h2 className="text-2xl text-foreground">Classroom ownership snapshot</h2>
            </div>
            <div className="grid gap-3">
              {classrooms.map((room) => (
                <div key={room.id} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.leadTeacher}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{room.ratio}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageShell>
  )
}
