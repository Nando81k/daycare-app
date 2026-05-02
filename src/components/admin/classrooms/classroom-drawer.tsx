"use client"

import { useActionState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { createClassroom, updateClassroom } from "@/app/actions/admin"
import {
  AdminFieldGroup,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
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
} from "@/types/app"

export type ClassroomDrawerMode =
  | { kind: "create" }
  | { kind: "edit"; classroom: ClassroomSummaryPreview }

export function ClassroomDrawer({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  mode: ClassroomDrawerMode | null
}) {
  if (!mode) return null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {mode.kind === "create" ? (
          <CreateBody onDone={() => onOpenChange(false)} />
        ) : (
          <EditBody
            classroom={mode.classroom}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateBody({ onDone }: { onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(createClassroom, initialMutationState)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">Add classroom</SheetTitle>
        <SheetDescription>
          Define the room, age group, capacity, and lead teacher. Staff and
          children can be assigned to it after.
        </SheetDescription>
      </SheetHeader>
      <ClassroomFormBody state={state} />
      <FooterBar
        state={state}
        isPending={isPending}
        idleLabel="Add classroom"
        pendingLabel="Adding…"
        onCancel={onDone}
      />
    </form>
  )
}

function EditBody({
  classroom,
  onDone,
}: {
  classroom: ClassroomSummaryPreview
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(updateClassroom, initialMutationState)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <input type="hidden" name="classroomId" value={classroom.id} />
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">{classroom.name}</SheetTitle>
        <SheetDescription>
          {classroom.ageGroup} · {classroom.enrolled}/{classroom.capacity} enrolled
        </SheetDescription>
      </SheetHeader>
      <ClassroomFormBody state={state} classroom={classroom} />
      <FooterBar
        state={state}
        isPending={isPending}
        idleLabel="Save changes"
        pendingLabel="Saving…"
        onCancel={onDone}
      />
    </form>
  )
}

function ClassroomFormBody({
  state,
  classroom,
}: {
  state: AdminActionState
  classroom?: ClassroomSummaryPreview
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <AdminFieldGroup className="gap-4">
        <AdminTextField
          name="name"
          label="Classroom name"
          placeholder="Willow Infants, Sunrise Preschool…"
          defaultValue={classroom?.name}
          error={state.fieldErrors.name}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <AdminTextField
            name="ageGroup"
            label="Age group"
            placeholder="6 weeks – 15 months"
            defaultValue={classroom?.ageGroup}
            error={state.fieldErrors.ageGroup}
          />
          <AdminTextField
            name="capacity"
            label="Capacity"
            type="number"
            inputMode="numeric"
            defaultValue={classroom ? String(classroom.capacity) : "12"}
            error={state.fieldErrors.capacity}
          />
        </div>
        <AdminTextField
          name="leadTeacherName"
          label="Lead teacher"
          placeholder="Optional — assign in Staff later if unsure"
          defaultValue={classroom?.leadTeacher}
          error={state.fieldErrors.leadTeacherName}
        />
        <AdminTextField
          name="ratioLabel"
          label="Ratio"
          placeholder="e.g. 1:4 coverage on site"
          defaultValue={classroom?.ratio}
          error={state.fieldErrors.ratioLabel}
        />
        <AdminTextField
          name="nextEvent"
          label="Next event"
          placeholder="e.g. Outdoor sensory setup tomorrow"
          defaultValue={classroom?.nextEvent}
          error={state.fieldErrors.nextEvent}
        />
        <AdminTextareaField
          name="note"
          label="Internal note"
          placeholder="Any context staff should see when planning the room."
          rows={3}
          defaultValue={classroom?.note}
          error={state.fieldErrors.note}
        />
      </AdminFieldGroup>
    </div>
  )
}

function FooterBar({
  state,
  isPending,
  idleLabel,
  pendingLabel,
  onCancel,
}: {
  state: AdminActionState
  isPending: boolean
  idleLabel: string
  pendingLabel: string
  onCancel: () => void
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
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? pendingLabel : idleLabel}
        </Button>
      </div>
    </div>
  )
}
