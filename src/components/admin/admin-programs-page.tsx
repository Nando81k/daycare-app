"use client"

import { useActionState, useState } from "react"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  DollarSignIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react"

import {
  upsertProgram,
  upsertSchedule,
  upsertProgramRate,
} from "@/app/actions/admin"
import { initialMutationState } from "@/lib/action-state"
import { formatCurrencyFromCents } from "@/lib/format"
import type {
  AdminProgramPreview,
  AdminProgramRatePreview,
  AdminSchedulePreview,
  PricingMatrixData,
} from "@/types/app"

import {
  AdminActionPanel,
  AdminSubmitButton,
} from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminProgramsPageViewProps = {
  programs: AdminProgramPreview[]
  schedules: AdminSchedulePreview[]
  rates: AdminProgramRatePreview[]
  pricingMatrix: PricingMatrixData
}

// ---------------------------------------------------------------------------
// Program Form
// ---------------------------------------------------------------------------

function ProgramForm({
  program,
  onDone,
}: {
  program?: AdminProgramPreview
  onDone: () => void
}) {
  const [state, formAction] = useActionState(
    upsertProgram,
    initialMutationState,
  )

  // Close panel on success
  if (state.success) {
    // Use a microtask so React finishes the render cycle first
    queueMicrotask(onDone)
  }

  return (
    <AdminActionPanel
      eyebrow={program ? "Edit Program" : "New Program"}
      title={program ? program.name : "Add Program"}
      description="Set the name, age range, and display order for this program."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {program && <input type="hidden" name="programId" value={program.id} />}
        <AdminFieldGroup>
          <AdminTextField
            name="name"
            label="Program Name"
            defaultValue={program?.name ?? ""}
            placeholder="e.g. Infant Care"
            error={state.fieldErrors.name}
          />
          <AdminTextField
            name="slug"
            label="Slug"
            defaultValue={program?.slug ?? ""}
            placeholder="e.g. infant-care"
            description="URL-safe identifier (lowercase, hyphens only)."
            error={state.fieldErrors.slug}
          />
          <AdminTextField
            name="ageRange"
            label="Age Range"
            defaultValue={program?.ageRange ?? ""}
            placeholder="e.g. 6 weeks – 12 months"
            error={state.fieldErrors.ageRange}
          />
          <AdminTextareaField
            name="description"
            label="Description"
            defaultValue={program?.description ?? ""}
            rows={3}
            error={state.fieldErrors.description}
          />
          <AdminTextField
            name="sortOrder"
            label="Sort Order"
            type="number"
            inputMode="numeric"
            defaultValue={String(program?.sortOrder ?? 0)}
            error={state.fieldErrors.sortOrder}
          />
          <AdminSelectField
            name="isActive"
            label="Status"
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
            defaultValue={program ? String(program.isActive) : "true"}
            error={state.fieldErrors.isActive}
          />
        </AdminFieldGroup>
        <div className="flex flex-wrap gap-3">
          <AdminSubmitButton
            idleLabel={program ? "Save Changes" : "Create Program"}
            pendingLabel="Saving…"
          />
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </AdminActionPanel>
  )
}

// ---------------------------------------------------------------------------
// Schedule Form
// ---------------------------------------------------------------------------

function ScheduleForm({
  schedule,
  onDone,
}: {
  schedule?: AdminSchedulePreview
  onDone: () => void
}) {
  const [state, formAction] = useActionState(
    upsertSchedule,
    initialMutationState,
  )

  if (state.success) {
    queueMicrotask(onDone)
  }

  return (
    <AdminActionPanel
      eyebrow={schedule ? "Edit Schedule" : "New Schedule"}
      title={schedule ? schedule.name : "Add Schedule"}
      description="Configure the schedule name, days, and display order."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {schedule && (
          <input type="hidden" name="scheduleId" value={schedule.id} />
        )}
        <AdminFieldGroup>
          <AdminTextField
            name="name"
            label="Schedule Name"
            defaultValue={schedule?.name ?? ""}
            placeholder="e.g. Full-Time (Mon–Fri)"
            error={state.fieldErrors.name}
          />
          <AdminTextField
            name="slug"
            label="Slug"
            defaultValue={schedule?.slug ?? ""}
            placeholder="e.g. full-time"
            description="URL-safe identifier (lowercase, hyphens only)."
            error={state.fieldErrors.slug}
          />
          <AdminTextareaField
            name="daysDescription"
            label="Days Description"
            defaultValue={schedule?.daysDescription ?? ""}
            rows={2}
            placeholder="e.g. Monday through Friday, 7 AM – 6 PM"
            error={state.fieldErrors.daysDescription}
          />
          <AdminTextField
            name="sortOrder"
            label="Sort Order"
            type="number"
            inputMode="numeric"
            defaultValue={String(schedule?.sortOrder ?? 0)}
            error={state.fieldErrors.sortOrder}
          />
          <AdminSelectField
            name="isActive"
            label="Status"
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
            defaultValue={schedule ? String(schedule.isActive) : "true"}
            error={state.fieldErrors.isActive}
          />
        </AdminFieldGroup>
        <div className="flex flex-wrap gap-3">
          <AdminSubmitButton
            idleLabel={schedule ? "Save Changes" : "Create Schedule"}
            pendingLabel="Saving…"
          />
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </AdminActionPanel>
  )
}

// ---------------------------------------------------------------------------
// Rate Form (inline cell editor)
// ---------------------------------------------------------------------------

function RateForm({
  rateId,
  programId,
  programName,
  scheduleId,
  scheduleName,
  currentCents,
  currentLabel,
  onDone,
}: {
  rateId: string | null
  programId: string
  programName: string
  scheduleId: string
  scheduleName: string
  currentCents: number | null
  currentLabel: string | null
  onDone: () => void
}) {
  const [state, formAction] = useActionState(
    upsertProgramRate,
    initialMutationState,
  )

  if (state.success) {
    queueMicrotask(onDone)
  }

  return (
    <AdminActionPanel
      eyebrow="Set Rate"
      title={`${programName} × ${scheduleName}`}
      description="Enter the monthly tuition in cents and an optional billing label."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {rateId && <input type="hidden" name="rateId" value={rateId} />}
        <input type="hidden" name="programId" value={programId} />
        <input type="hidden" name="scheduleId" value={scheduleId} />
        <AdminFieldGroup>
          <AdminTextField
            name="rateCents"
            label="Rate (cents)"
            type="number"
            inputMode="numeric"
            defaultValue={currentCents != null ? String(currentCents) : ""}
            placeholder="e.g. 150000 for $1,500.00"
            error={state.fieldErrors.rateCents}
          />
          <AdminTextField
            name="billingLabel"
            label="Billing Label"
            defaultValue={currentLabel ?? ""}
            placeholder="e.g. Infant Full-Time Monthly"
            error={state.fieldErrors.billingLabel}
          />
        </AdminFieldGroup>
        <div className="flex flex-wrap gap-3">
          <AdminSubmitButton idleLabel="Save Rate" pendingLabel="Saving…" />
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </AdminActionPanel>
  )
}

// ---------------------------------------------------------------------------
// Programs Tab
// ---------------------------------------------------------------------------

function ProgramsTab({ programs }: { programs: AdminProgramPreview[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null)

  if (editing) {
    const target = programs.find((p) => p.id === editing)
    return (
      <ProgramForm
        program={target}
        onDone={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <PlusIcon className="mr-1.5 size-4" />
          Add Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <SurfaceCard tone="muted" className="px-5 py-8 text-center text-sm text-muted-foreground">
          No programs yet. Add one to get started.
        </SurfaceCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <SurfaceCard
              key={p.id}
              density="compact"
              interactive
              className="cursor-pointer px-5 py-4"
              onClick={() => setEditing(p.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.ageRange && (
                    <span className="text-xs text-muted-foreground">
                      {p.ageRange}
                    </span>
                  )}
                </div>
                <StatusBadge variant={p.isActive ? "success" : "secondary"}>
                  {p.isActive ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.rateCount} rate{p.rateCount !== 1 ? "s" : ""}</span>
                <span>Order: {p.sortOrder}</span>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <PencilIcon className="size-3" />
                  Edit
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Schedules Tab
// ---------------------------------------------------------------------------

function SchedulesTab({ schedules }: { schedules: AdminSchedulePreview[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null)

  if (editing) {
    const target = schedules.find((s) => s.id === editing)
    return (
      <ScheduleForm
        schedule={target}
        onDone={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing("new")}>
          <PlusIcon className="mr-1.5 size-4" />
          Add Schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <SurfaceCard tone="muted" className="px-5 py-8 text-center text-sm text-muted-foreground">
          No schedules yet. Add one to get started.
        </SurfaceCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => (
            <SurfaceCard
              key={s.id}
              density="compact"
              interactive
              className="cursor-pointer px-5 py-4"
              onClick={() => setEditing(s.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{s.name}</span>
                  {s.daysDescription && (
                    <span className="text-xs text-muted-foreground">
                      {s.daysDescription}
                    </span>
                  )}
                </div>
                <StatusBadge variant={s.isActive ? "success" : "secondary"}>
                  {s.isActive ? "Active" : "Inactive"}
                </StatusBadge>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{s.rateCount} rate{s.rateCount !== 1 ? "s" : ""}</span>
                <span>Order: {s.sortOrder}</span>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <PencilIcon className="size-3" />
                  Edit
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pricing Matrix Tab
// ---------------------------------------------------------------------------

function PricingMatrixTab({
  matrix,
  programs,
}: {
  matrix: PricingMatrixData
  programs: AdminProgramPreview[]
}) {
  const [editingCell, setEditingCell] = useState<{
    rateId: string | null
    programId: string
    programName: string
    scheduleId: string
    scheduleName: string
    rateCents: number | null
    billingLabel: string | null
  } | null>(null)

  if (editingCell) {
    return (
      <RateForm
        rateId={editingCell.rateId}
        programId={editingCell.programId}
        programName={editingCell.programName}
        scheduleId={editingCell.scheduleId}
        scheduleName={editingCell.scheduleName}
        currentCents={editingCell.rateCents}
        currentLabel={editingCell.billingLabel}
        onDone={() => setEditingCell(null)}
      />
    )
  }

  if (matrix.schedules.length === 0 || matrix.rows.length === 0) {
    return (
      <SurfaceCard tone="muted" className="px-5 py-8 text-center text-sm text-muted-foreground">
        Add at least one program and one schedule to see the pricing matrix.
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard density="compact" className="overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Program
            </th>
            {matrix.schedules.map((sched) => (
              <th
                key={sched.id}
                className="px-4 py-3 text-right font-medium text-muted-foreground"
              >
                {sched.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr
              key={row.programId}
              className="border-b border-border/40 last:border-0"
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium">{row.programName}</span>
                  {row.ageRange && (
                    <span className="text-xs text-muted-foreground">
                      {row.ageRange}
                    </span>
                  )}
                </div>
              </td>
              {matrix.schedules.map((sched) => {
                const cell = row.cells[sched.id]
                return (
                  <td key={sched.id} className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCell({
                          rateId: cell?.rateId ?? null,
                          programId: row.programId,
                          programName: row.programName,
                          scheduleId: sched.id,
                          scheduleName: sched.name,
                          rateCents: cell?.rateCents ?? null,
                          billingLabel: cell?.billingLabel ?? null,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
                    >
                      {cell?.rateCents != null ? (
                        <span className="font-medium tabular-nums">
                          {formatCurrencyFromCents(cell.rateCents)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      <PencilIcon className="size-3 text-muted-foreground" />
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </SurfaceCard>
  )
}

// ---------------------------------------------------------------------------
// Main Page View (exported for the server component)
// ---------------------------------------------------------------------------

export function AdminProgramsPageView({
  programs,
  schedules,
  rates,
  pricingMatrix,
}: AdminProgramsPageViewProps) {
  const activePrograms = programs.filter((p) => p.isActive).length
  const activeSchedules = schedules.filter((s) => s.isActive).length
  const totalRates = rates.length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Programs & Pricing"
        description="Manage age-group programs, weekly schedules, and tuition rates. Parents select from these options during enrollment."
      >
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Programs</span>
            <span className="text-lg font-semibold">{activePrograms}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Schedules</span>
            <span className="text-lg font-semibold">{activeSchedules}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Rates</span>
            <span className="text-lg font-semibold">{totalRates}</span>
          </div>
        </div>
      </AdminPageHeader>

      <Tabs defaultValue="programs">
        <TabsList variant="line">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="mt-4">
          <ProgramsTab programs={programs} />
        </TabsContent>

        <TabsContent value="schedules" className="mt-4">
          <SchedulesTab schedules={schedules} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <PricingMatrixTab matrix={pricingMatrix} programs={programs} />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
