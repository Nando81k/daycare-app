"use client"

import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { Plus, RotateCw, Trash2, UserPlus2 } from "lucide-react"

import { removeStaffMember, resendStaffInvite } from "@/app/actions/admin"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  formatAdminLabel,
  getStaffVariant,
} from "@/components/admin/admin-status"
import {
  StaffMemberDrawer,
  type StaffDrawerMode,
} from "@/components/admin/staff/staff-member-drawer"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminClassrooms,
  adminStaffPageContent,
  adminStaffProfiles,
} from "@/data/admin"
import { initialMutationState } from "@/lib/action-state"
import type {
  AdminActionState,
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
  { key: "actions", header: "Actions", align: "end" },
]

type StatusFilter = "all" | "scheduled" | "coverage-needed" | "out"

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "coverage-needed", label: "Coverage" },
  { value: "out", label: "Out" },
]

function getRows(
  staffProfiles: StaffProfilePreview[],
  onEdit: (profile: StaffProfilePreview) => void,
  onRemove: (profile: StaffProfilePreview) => void,
  onResend: (profile: StaffProfilePreview) => void
): AdminTableRow[] {
  return staffProfiles.map((profile) => {
    const onboardingBadge = profile.onboarding
      ? profile.onboarding.status === "COMPLETE"
        ? " · onboarding ✓"
        : ` · onboarding ${profile.onboarding.completedSteps}/${profile.onboarding.totalSteps}`
      : ""
    return {
    staff: {
      primary: profile.name,
      secondary: `${profile.role}${onboardingBadge}`,
    },
    classroom: profile.classroom || "Unassigned",
    certification: profile.certification || "—",
    status: {
      label: formatAdminLabel(profile.status),
      variant: getStaffVariant(profile.status),
    },
    actions: {
      type: "custom",
      searchValue: `Edit ${profile.name}`,
      content: (
        <RowActions
          profile={profile}
          onEdit={() => onEdit(profile)}
          onRemove={() => onRemove(profile)}
          onResend={() => onResend(profile)}
        />
      ),
    },
    }
  })
}

function RowActions({
  profile,
  onEdit,
  onResend,
  onRemove,
}: {
  profile: StaffProfilePreview
  onEdit: () => void
  onResend: () => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        onClick={onResend}
        title="Resend portal invite"
        aria-label={`Resend invite for ${profile.name}`}
      >
        <RotateCw className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        title="Remove from staff"
        aria-label={`Remove ${profile.name}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
    </div>
  )
}

export function AdminStaffPageView({
  staffProfiles = adminStaffProfiles,
  classrooms = adminClassrooms,
}: {
  staffProfiles?: StaffProfilePreview[]
  classrooms?: ClassroomSummaryPreview[]
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [drawerMode, setDrawerMode] = useState<StaffDrawerMode | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Toast-style banner for resend / remove feedback that happens outside the drawer.
  const [resendState, resendAction] = useActionState<AdminActionState, FormData>(
    resendStaffInvite,
    initialMutationState
  )
  const [removeState, removeAction] = useActionState<AdminActionState, FormData>(
    removeStaffMember,
    initialMutationState
  )

  const filtered = useMemo(() => {
    if (statusFilter === "all") return staffProfiles
    return staffProfiles.filter((p) => p.status === statusFilter)
  }, [staffProfiles, statusFilter])

  function openCreate() {
    setDrawerMode({ kind: "create" })
    setDrawerOpen(true)
  }
  function openEdit(profile: StaffProfilePreview) {
    setDrawerMode({ kind: "edit", staff: profile })
    setDrawerOpen(true)
  }
  function handleResend(profile: StaffProfilePreview) {
    const fd = new FormData()
    fd.append("staffId", profile.id)
    resendAction(fd)
  }
  function handleRemove(profile: StaffProfilePreview) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Remove ${profile.name} from the staff roster?`)
    ) {
      return
    }
    const fd = new FormData()
    fd.append("staffId", profile.id)
    removeAction(fd)
  }

  const rows = getRows(filtered, openEdit, handleRemove, handleResend)

  const counts = useMemo(
    () => ({
      all: staffProfiles.length,
      scheduled: staffProfiles.filter((p) => p.status === "scheduled").length,
      "coverage-needed": staffProfiles.filter(
        (p) => p.status === "coverage-needed"
      ).length,
      out: staffProfiles.filter((p) => p.status === "out").length,
    }),
    [staffProfiles]
  )

  const coverageActions = staffProfiles.filter(
    (profile) => profile.status !== "scheduled"
  )

  const flashMessage = removeState.message ?? resendState.message
  const flashError = removeState.error ?? resendState.error

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminStaffPageContent.eyebrow}
        title={adminStaffPageContent.title}
        description={adminStaffPageContent.description}
        actions={
          <>
            <Link
              href="/admin/classrooms"
              className={buttonVariants({ variant: "outline" })}
            >
              Open classrooms
            </Link>
            <Button onClick={openCreate} className="gap-1.5">
              <UserPlus2 className="h-4 w-4" />
              Add staff member
            </Button>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Total staff</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.all}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.scheduled}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Coverage pressure
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts["coverage-needed"] + counts.out}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Classrooms covered
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {new Set(staffProfiles.map((p) => p.classroom).filter(Boolean)).size}
          </p>
        </div>
      </AdminPageHeader>

      {(flashMessage || flashError) && (
        <p
          role={flashError ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-lg px-4 py-2 text-sm ${
            flashError
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {flashError ?? flashMessage}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
                    {counts[filter.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button onClick={openCreate} variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add staff
          </Button>
        </div>

        <AdminDataTable
          title="Staff directory"
          description="Edit a member to update their role, classroom, status, or to resend their portal invite."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search staff, room, or certification"
          searchKeys={["staff", "classroom", "certification", "status"]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard className="gap-4 px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Coverage actions
            </p>
            <h2 className="text-xl text-foreground">What needs planning today</h2>
          </div>
          {coverageActions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              All staff are scheduled. 🎉
            </p>
          ) : (
            <div className="grid gap-3">
              {coverageActions.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => openEdit(profile)}
                  className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {profile.name}
                    </p>
                    <StatusBadge variant={getStaffVariant(profile.status)}>
                      {formatAdminLabel(profile.status)}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {profile.role} · {profile.classroom || "Unassigned"}
                  </p>
                  {profile.note && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {profile.note}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard className="gap-4 px-6 py-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Classroom roster
            </p>
            <h2 className="text-xl text-foreground">Lead by room</h2>
          </div>
          <div className="grid gap-3">
            {classrooms.map((room) => (
              <div
                key={room.id}
                className="surface-panel-quiet rounded-[1.2rem] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {room.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {room.leadTeacher}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {room.ratio}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <StaffMemberDrawer
        open={drawerOpen}
        onOpenChange={(next) => {
          setDrawerOpen(next)
          if (!next) setDrawerMode(null)
        }}
        mode={drawerMode}
        classrooms={classrooms}
      />
    </PageShell>
  )
}
