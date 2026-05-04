"use client"

import { useActionState, useState } from "react"
import {
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  UsersRoundIcon,
} from "lucide-react"

import {
  upsertProgram,
  upsertSchedule,
  upsertProgramRate,
} from "@/app/actions/admin"
import { initialMutationState } from "@/lib/action-state"
import { cn } from "@/lib/utils"
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
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminProgramsPageViewProps = {
  programs: AdminProgramPreview[]
  schedules: AdminSchedulePreview[]
  rates: AdminProgramRatePreview[]
  pricingMatrix: PricingMatrixData
}

type EditorTarget =
  | { kind: "program"; program?: AdminProgramPreview }
  | { kind: "schedule"; schedule?: AdminSchedulePreview }
  | {
      kind: "rate"
      rateId: string | null
      programId: string
      programName: string
      scheduleId: string
      scheduleName: string
      rateCents: number | null
      billingLabel: string | null
    }

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

function ProgramForm({
  program,
  onDone,
}: {
  program?: AdminProgramPreview
  onDone: () => void
}) {
  const [state, formAction] = useActionState(upsertProgram, initialMutationState)

  if (state.success) {
    queueMicrotask(onDone)
  }

  return (
    <AdminActionPanel
      eyebrow={program ? "Edit program" : "New program"}
      title={program ? program.name : "Add program"}
      description="Set the name, age range, and display order for this program."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {program && <input type="hidden" name="programId" value={program.id} />}
        <AdminFieldGroup>
          <AdminTextField
            name="name"
            label="Program name"
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
            label="Age range"
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
            label="Sort order"
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
            idleLabel={program ? "Save changes" : "Create program"}
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

function ScheduleForm({
  schedule,
  onDone,
}: {
  schedule?: AdminSchedulePreview
  onDone: () => void
}) {
  const [state, formAction] = useActionState(upsertSchedule, initialMutationState)

  if (state.success) {
    queueMicrotask(onDone)
  }

  return (
    <AdminActionPanel
      eyebrow={schedule ? "Edit schedule" : "New schedule"}
      title={schedule ? schedule.name : "Add schedule"}
      description="Configure the schedule name, days, and display order."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {schedule && <input type="hidden" name="scheduleId" value={schedule.id} />}
        <AdminFieldGroup>
          <AdminTextField
            name="name"
            label="Schedule name"
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
            label="Days description"
            defaultValue={schedule?.daysDescription ?? ""}
            rows={2}
            placeholder="e.g. Monday through Friday, 7 AM – 6 PM"
            error={state.fieldErrors.daysDescription}
          />
          <AdminTextField
            name="sortOrder"
            label="Sort order"
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
            idleLabel={schedule ? "Save changes" : "Create schedule"}
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
      eyebrow="Set rate"
      title={`${programName} × ${scheduleName}`}
      description="Set the monthly tuition (cents) and an optional invoice label."
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
            label="Invoice label"
            defaultValue={currentLabel ?? ""}
            placeholder="e.g. Infant Full-Time Monthly"
            error={state.fieldErrors.billingLabel}
          />
        </AdminFieldGroup>
        <div className="flex flex-wrap gap-3">
          <AdminSubmitButton idleLabel="Save rate" pendingLabel="Saving…" />
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </AdminActionPanel>
  )
}

// ---------------------------------------------------------------------------
// Pricing matrix (hero)
// ---------------------------------------------------------------------------

function PricingMatrix({
  matrix,
  onEditCell,
}: {
  matrix: PricingMatrixData
  onEditCell: (target: Extract<EditorTarget, { kind: "rate" }>) => void
}) {
  if (matrix.schedules.length === 0 || matrix.rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/60 bg-muted/15 px-6 py-10 text-center text-sm text-muted-foreground">
        Add at least one program and one schedule to start building the tuition
        matrix.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border/60 bg-card">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <tr>
            <th className="sticky left-0 z-10 bg-muted/30 px-4 py-3 text-left font-semibold">
              Program
            </th>
            {matrix.schedules.map((sched) => (
              <th
                key={sched.id}
                className="px-3 py-3 text-right font-semibold"
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
              className="border-t border-border/40 transition-colors hover:bg-muted/15"
            >
              <td className="sticky left-0 z-10 bg-card px-4 py-3 group-hover:bg-muted/15">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {row.programName}
                  </span>
                  {row.ageRange ? (
                    <span className="text-xs text-muted-foreground">
                      {row.ageRange}
                    </span>
                  ) : null}
                </div>
              </td>
              {matrix.schedules.map((sched) => {
                const cell = row.cells[sched.id]
                const hasRate = cell?.rateCents != null
                return (
                  <td key={sched.id} className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onEditCell({
                          kind: "rate",
                          rateId: cell?.rateId ?? null,
                          programId: row.programId,
                          programName: row.programName,
                          scheduleId: sched.id,
                          scheduleName: sched.name,
                          rateCents: cell?.rateCents ?? null,
                          billingLabel: cell?.billingLabel ?? null,
                        })
                      }
                      className={cn(
                        "group inline-flex w-full max-w-40 flex-col items-end gap-0.5 rounded-md px-3 py-2 text-right transition-all hover:bg-primary/10",
                        hasRate ? "text-foreground" : "text-muted-foreground/70",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums transition-colors",
                          hasRate
                            ? "text-foreground group-hover:text-primary"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {hasRate
                          ? formatCurrencyFromCents(cell.rateCents!)
                          : "—"}
                      </span>
                      <span className="flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
                        {cell && cell.enrolledCount > 0 ? (
                          <>
                            <UsersRoundIcon className="h-3 w-3" />
                            {cell.enrolledCount}
                          </>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <PencilIcon className="h-3 w-3" />
                          </span>
                        )}
                      </span>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Program & schedule cards
// ---------------------------------------------------------------------------

function ProgramCard({
  program,
  onEdit,
}: {
  program: AdminProgramPreview
  onEdit: () => void
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex flex-col gap-3 rounded-md border border-border/50 bg-card px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
            {program.ageRange ?? "Age group not set"}
          </p>
          <h3 className="text-base font-semibold text-foreground">
            {program.name}
          </h3>
        </div>
        <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      {program.description ? (
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {program.description}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge variant={program.isActive ? "success" : "secondary"}>
          {program.isActive ? "Active" : "Inactive"}
        </StatusBadge>
        <StatusBadge variant="secondary">
          {program.rateCount} rate{program.rateCount === 1 ? "" : "s"}
        </StatusBadge>
        {program.enrolledCount > 0 ? (
          <StatusBadge variant="info">
            {program.enrolledCount} enrolled
          </StatusBadge>
        ) : null}
      </div>
    </button>
  )
}

function ScheduleCard({
  schedule,
  onEdit,
}: {
  schedule: AdminSchedulePreview
  onEdit: () => void
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group flex flex-col gap-2 rounded-md border border-border/50 bg-card px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{schedule.name}</h3>
          {schedule.daysDescription ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {schedule.daysDescription}
            </p>
          ) : null}
        </div>
        <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge variant={schedule.isActive ? "success" : "secondary"}>
          {schedule.isActive ? "Active" : "Inactive"}
        </StatusBadge>
        <StatusBadge variant="secondary">
          {schedule.rateCount} rate{schedule.rateCount === 1 ? "" : "s"}
        </StatusBadge>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page view
// ---------------------------------------------------------------------------

export function AdminProgramsPageView({
  programs,
  schedules,
  rates,
  pricingMatrix,
}: AdminProgramsPageViewProps) {
  const [editor, setEditor] = useState<EditorTarget | null>(null)

  const activePrograms = programs.filter((p) => p.isActive).length
  const activeSchedules = schedules.filter((s) => s.isActive).length
  const totalRates = rates.length
  const totalEnrolled = programs.reduce(
    (sum, p) => sum + p.enrolledCount,
    0,
  )

  function closeEditor() {
    setEditor(null)
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Configuration
          </p>
          <CardTitle className="font-heading text-3xl tracking-tight">
            Programs &amp; tuition
          </CardTitle>
          <CardDescription>
            The tuition matrix is the source of truth for what families pay. Click
            any cell to set or update a rate; programs and schedules are managed
            below.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setEditor({ kind: "program" })}
              className="gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New program
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditor({ kind: "schedule" })}
              className="gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Active programs</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{activePrograms}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Active schedules</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{activeSchedules}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Tuition rates</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{totalRates}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Enrolled families</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{totalEnrolled}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero: tuition matrix */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
              Tuition matrix
            </p>
            <h2 className="font-heading text-xl tracking-tight text-foreground">
              Rate by program × schedule
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Click a cell to edit. Numbers under each price show how many enrolled
            families currently sit on that combination.
          </p>
        </div>
        <PricingMatrix
          matrix={pricingMatrix}
          onEditCell={(target) => setEditor(target)}
        />
      </section>

      {/* Programs + schedules */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                Programs
              </p>
              <h2 className="font-heading text-xl tracking-tight text-foreground">
                Age groups &amp; classrooms
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditor({ kind: "program" })}
              className="gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New program
            </Button>
          </div>
          {programs.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/60 bg-muted/15 px-6 py-8 text-center text-sm text-muted-foreground">
              No programs yet. Add one to start building the tuition matrix.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onEdit={() => setEditor({ kind: "program", program })}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                Schedules
              </p>
              <h2 className="font-heading text-xl tracking-tight text-foreground">
                Weekly attendance options
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditor({ kind: "schedule" })}
              className="gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New schedule
            </Button>
          </div>
          {schedules.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/60 bg-muted/15 px-6 py-8 text-center text-sm text-muted-foreground">
              No schedules yet. Add one — full-time, part-time, etc.
            </div>
          ) : (
            <div className="grid gap-3">
              {schedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onEdit={() => setEditor({ kind: "schedule", schedule })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Editor drawer (program / schedule / rate) */}
      <Sheet
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open) closeEditor()
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          {editor && (
            <>
              <SheetHeader className="gap-1 border-b border-border/60 bg-muted/20 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {editor.kind === "program"
                    ? "Program"
                    : editor.kind === "schedule"
                      ? "Schedule"
                      : "Tuition rate"}
                </p>
                <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {editor.kind === "program"
                    ? editor.program?.name ?? "New program"
                    : editor.kind === "schedule"
                      ? editor.schedule?.name ?? "New schedule"
                      : `${editor.programName} × ${editor.scheduleName}`}
                </SheetTitle>
                <SheetDescription>
                  {editor.kind === "program"
                    ? "Programs publish on the marketing site and appear in the enrollment wizard."
                    : editor.kind === "schedule"
                      ? "Schedules pair with programs to produce tuition rates."
                      : "Update the monthly tuition for this combination — saves immediately."}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {editor.kind === "program" ? (
                  <ProgramForm program={editor.program} onDone={closeEditor} />
                ) : editor.kind === "schedule" ? (
                  <ScheduleForm schedule={editor.schedule} onDone={closeEditor} />
                ) : (
                  <RateForm
                    rateId={editor.rateId}
                    programId={editor.programId}
                    programName={editor.programName}
                    scheduleId={editor.scheduleId}
                    scheduleName={editor.scheduleName}
                    currentCents={editor.rateCents}
                    currentLabel={editor.billingLabel}
                    onDone={closeEditor}
                  />
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
