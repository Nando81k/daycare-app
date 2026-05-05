"use client"

import { useActionState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
  createStaffMember,
  updateStaffMember,
} from "@/app/actions/admin"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { StaffOnboardingPanel } from "@/components/admin/staff/staff-onboarding-panel"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { initialMutationState } from "@/lib/action-state"
import type {
  AdminActionState,
  ClassroomSummaryPreview,
  StaffProfilePreview,
} from "@/types/app"

const STATUS_OPTIONS = [
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Coverage needed", value: "COVERAGE_NEEDED" },
  { label: "Out", value: "OUT" },
] as const

const ACCOUNT_KIND_OPTIONS = [
  { label: "No portal account", value: "NONE" },
  { label: "Teacher (portal)", value: "TEACHER" },
  { label: "Admin (portal)", value: "ADMIN" },
] as const

function toStatusValue(status: StaffProfilePreview["status"]) {
  switch (status) {
    case "scheduled":
      return "SCHEDULED"
    case "coverage-needed":
      return "COVERAGE_NEEDED"
    case "out":
      return "OUT"
  }
}

export type StaffDrawerMode =
  | { kind: "create" }
  | { kind: "edit"; staff: StaffProfilePreview & { id: string } }

export function StaffMemberDrawer({
  open,
  onOpenChange,
  mode,
  classrooms,
  selectedClassroomId,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  mode: StaffDrawerMode | null
  classrooms: ClassroomSummaryPreview[]
  selectedClassroomId?: string | null
}) {
  if (!mode) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {mode.kind === "create" ? (
          <CreateBody
            classrooms={classrooms}
            selectedClassroomId={selectedClassroomId ?? null}
            onDone={() => onOpenChange(false)}
          />
        ) : (
          <EditBody
            staff={mode.staff}
            classrooms={classrooms}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateBody({
  classrooms,
  selectedClassroomId,
  onDone,
}: {
  classrooms: ClassroomSummaryPreview[]
  selectedClassroomId: string | null
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(createStaffMember, initialMutationState)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  const classroomOptions = [
    { label: "Unassigned", value: "" },
    ...classrooms.map((c) => ({ label: c.name, value: c.id })),
  ]

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">Add staff member</SheetTitle>
        <SheetDescription>
          Create a roster entry, assign a classroom, and (optionally) send a
          portal invite for an admin or teacher account.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AdminFieldGroup className="gap-4">
          <AdminTextField
            name="name"
            label="Full name"
            placeholder="e.g. Avery Thompson"
            error={state.fieldErrors.name}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextField
              name="roleLabel"
              label="Role label"
              placeholder="Lead teacher, Aide, Cook…"
              error={state.fieldErrors.roleLabel}
            />
            <AdminSelectField
              name="classroomId"
              label="Classroom"
              defaultValue={selectedClassroomId ?? ""}
              options={classroomOptions}
              error={state.fieldErrors.classroomId}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminTextField
              name="certification"
              label="Certification"
              placeholder="CDA, ECE, CPR…"
              error={state.fieldErrors.certification}
            />
            <AdminSelectField
              name="status"
              label="Schedule status"
              defaultValue="SCHEDULED"
              options={[...STATUS_OPTIONS]}
              error={state.fieldErrors.status}
            />
          </div>
          <AdminTextareaField
            name="note"
            label="Internal note"
            placeholder="Schedule, coverage context, or onboarding notes."
            rows={3}
            error={state.fieldErrors.note}
          />

          <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/15 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Portal account
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminSelectField
                name="accountKind"
                label="Account type"
                defaultValue="NONE"
                options={[...ACCOUNT_KIND_OPTIONS]}
                description="Choose Teacher or Admin to send a portal invite. Pick None for off-system staff (cooks, aides, etc.)."
                error={state.fieldErrors.accountKind}
              />
              <AdminTextField
                name="email"
                label="Email"
                type="email"
                placeholder="staff@yourschool.com"
                error={state.fieldErrors.email}
              />
            </div>
          </div>
        </AdminFieldGroup>
      </div>

      <FooterBar
        state={state}
        isPending={isPending}
        idleLabel="Add staff member"
        pendingLabel="Adding…"
        onCancel={onDone}
      />
    </form>
  )
}

function EditBody({
  staff,
  classrooms,
  onDone,
}: {
  staff: StaffProfilePreview & { id: string }
  classrooms: ClassroomSummaryPreview[]
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(updateStaffMember, initialMutationState)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  const classroomOptions = [
    { label: "Unassigned", value: "" },
    ...classrooms.map((c) => ({ label: c.name, value: c.id })),
  ]
  const matchedClassroomId =
    classrooms.find((c) => c.name === staff.classroom)?.id ?? ""

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">{staff.name}</SheetTitle>
        <SheetDescription>
          {staff.role} · {staff.classroom || "Unassigned"}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <form
          action={formAction}
          id={`staff-edit-${staff.id}`}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="staffId" value={staff.id} />
          <AdminFieldGroup className="gap-4">
            <AdminTextField
              name="name"
              label="Full name"
              defaultValue={staff.name}
              error={state.fieldErrors.name}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <AdminTextField
                name="roleLabel"
                label="Role label"
                defaultValue={staff.role}
                error={state.fieldErrors.roleLabel}
              />
              <AdminSelectField
                name="classroomId"
                label="Classroom"
                defaultValue={matchedClassroomId}
                options={classroomOptions}
                error={state.fieldErrors.classroomId}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminTextField
                name="certification"
                label="Certification"
                defaultValue={staff.certification}
                error={state.fieldErrors.certification}
              />
              <AdminSelectField
                name="status"
                label="Schedule status"
                defaultValue={toStatusValue(staff.status)}
                options={[...STATUS_OPTIONS]}
                error={state.fieldErrors.status}
              />
            </div>
            <AdminTextareaField
              name="note"
              label="Internal note"
              defaultValue={staff.note}
              rows={3}
              error={state.fieldErrors.note}
            />
          </AdminFieldGroup>
        </form>

        {staff.onboarding ? (
          <div className="mt-7 border-t border-border/60 pt-6">
            <StaffOnboardingPanel staffProfileId={staff.id} />
          </div>
        ) : null}
      </div>

      <FooterBar
        state={state}
        isPending={isPending}
        idleLabel="Save changes"
        pendingLabel="Saving…"
        onCancel={onDone}
        formId={`staff-edit-${staff.id}`}
      />
    </div>
  )
}

function FooterBar({
  state,
  isPending,
  idleLabel,
  pendingLabel,
  onCancel,
  formId,
}: {
  state: AdminActionState
  isPending: boolean
  idleLabel: string
  pendingLabel: string
  onCancel: () => void
  /** When set, the submit button targets that form id. Lets the EditBody
   * keep its onboarding panel outside the edit form. */
  formId?: string
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border/60 bg-popover/95 px-5 py-3">
      {(state.error || state.message) && (
        <p
          role={state.error ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-md px-3 py-2 text-xs ${
            state.error
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.error ?? state.message}
        </p>
      )}
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending} form={formId}>
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? pendingLabel : idleLabel}
        </Button>
      </div>
    </div>
  )
}
