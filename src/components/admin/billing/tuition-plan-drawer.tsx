"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { createTuitionPlan, updateTuitionPlan } from "@/app/actions/admin"
import {
  AdminFieldGroup,
  AdminSelectField,
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
  AdminTuitionFamilyOption,
  AdminProgramRateOption,
  AdminTuitionPlanRow,
} from "@/lib/dal/admin-billing"
import type { AdminActionState } from "@/types/app"

export type TuitionPlanDrawerMode =
  | { kind: "create"; familyId?: string; childId?: string }
  | { kind: "edit"; plan: AdminTuitionPlanRow }

export function TuitionPlanDrawer({
  open,
  onOpenChange,
  mode,
  families,
  programRates,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  mode: TuitionPlanDrawerMode | null
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
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
            families={families}
            programRates={programRates}
            initialFamilyId={mode.familyId}
            initialChildId={mode.childId}
            onDone={() => onOpenChange(false)}
          />
        ) : (
          <EditBody
            plan={mode.plan}
            families={families}
            programRates={programRates}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

function CreateBody({
  families,
  programRates,
  initialFamilyId,
  initialChildId,
  onDone,
}: {
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
  initialFamilyId?: string
  initialChildId?: string
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(createTuitionPlan, initialMutationState)
  const [familyId, setFamilyId] = useState<string>(initialFamilyId ?? families[0]?.id ?? "")

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">New tuition plan</SheetTitle>
        <SheetDescription>
          Pick a family + child and the program/schedule rate. The cron at
          06:00 UTC each morning will emit the next invoice on the chosen day.
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <PlanFields
          families={families}
          programRates={programRates}
          familyId={familyId}
          onFamilyChange={setFamilyId}
          fieldErrors={state.fieldErrors}
          defaults={{
            childId: initialChildId,
            startDate: new Date().toISOString().slice(0, 10),
            invoiceDay: 1,
            dueDayOffset: 10,
          }}
        />
      </div>
      <FooterBar
        state={state}
        isPending={isPending}
        idleLabel="Create plan"
        pendingLabel="Creating…"
        onCancel={onDone}
      />
    </form>
  )
}

function EditBody({
  plan,
  families,
  programRates,
  onDone,
}: {
  plan: AdminTuitionPlanRow
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
  onDone: () => void
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(updateTuitionPlan, initialMutationState)
  const [familyId, setFamilyId] = useState(plan.familyId)

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [state.success, onDone])

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col">
      <input type="hidden" name="planId" value={plan.id} />
      <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
        <SheetTitle className="text-lg">Edit tuition plan</SheetTitle>
        <SheetDescription>
          {plan.familyName} · {plan.childName} · {plan.programName} · {plan.scheduleName}
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <PlanFields
          families={families}
          programRates={programRates}
          familyId={familyId}
          onFamilyChange={setFamilyId}
          fieldErrors={state.fieldErrors}
          defaults={{
            familyId: plan.familyId,
            childId: plan.childId,
            programRateId: programRates.find(
              (r) => r.programName === plan.programName && r.scheduleName === plan.scheduleName,
            )?.id,
            startDate: plan.startDate,
            endDate: plan.endDate ?? "",
            invoiceDay: plan.invoiceDay,
            dueDayOffset: plan.dueDayOffset,
            note: plan.note ?? "",
          }}
        />
      </div>
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

type PlanDefaults = {
  familyId?: string
  childId?: string
  programRateId?: string
  startDate?: string
  endDate?: string
  invoiceDay?: number
  dueDayOffset?: number
  note?: string
}

function PlanFields({
  families,
  programRates,
  familyId,
  onFamilyChange,
  fieldErrors,
  defaults,
}: {
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
  familyId: string
  onFamilyChange: (next: string) => void
  fieldErrors: Record<string, string>
  defaults: PlanDefaults
}) {
  const familyOptions = useMemo(
    () =>
      families.map((family) => ({ label: family.name, value: family.id })),
    [families],
  )
  const childOptions = useMemo(() => {
    const family = families.find((f) => f.id === familyId)
    return family
      ? family.children.map((c) => ({ label: c.name, value: c.id }))
      : []
  }, [families, familyId])
  const rateOptions = useMemo(
    () =>
      programRates.map((rate) => ({
        label: `${rate.programName} · ${rate.scheduleName} · ${rate.rateLabel}${
          rate.billingLabel ? ` (${rate.billingLabel})` : ""
        }`,
        value: rate.id,
      })),
    [programRates],
  )

  return (
    <AdminFieldGroup className="gap-4">
      <AdminSelectField
        name="familyId"
        label="Family"
        defaultValue={defaults.familyId ?? familyId}
        options={familyOptions}
        error={fieldErrors.familyId}
        onChange={(event) => onFamilyChange(event.target.value)}
      />
      <AdminSelectField
        name="childId"
        label="Child"
        defaultValue={defaults.childId}
        options={childOptions}
        error={fieldErrors.childId}
      />
      <AdminSelectField
        name="programRateId"
        label="Program · Schedule · Rate"
        defaultValue={defaults.programRateId}
        options={rateOptions}
        error={fieldErrors.programRateId}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextField
          name="startDate"
          label="Start date"
          type="date"
          defaultValue={defaults.startDate}
          error={fieldErrors.startDate}
        />
        <AdminTextField
          name="endDate"
          label="End date (optional)"
          type="date"
          defaultValue={defaults.endDate}
          error={fieldErrors.endDate}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminTextField
          name="invoiceDay"
          label="Invoice day (1–28)"
          type="number"
          inputMode="numeric"
          defaultValue={String(defaults.invoiceDay ?? 1)}
          error={fieldErrors.invoiceDay}
        />
        <AdminTextField
          name="dueDayOffset"
          label="Due offset (days, 0–28)"
          type="number"
          inputMode="numeric"
          defaultValue={String(defaults.dueDayOffset ?? 10)}
          error={fieldErrors.dueDayOffset}
        />
      </div>
      <AdminTextareaField
        name="note"
        label="Internal note (optional)"
        defaultValue={defaults.note ?? ""}
        rows={2}
        error={fieldErrors.note}
      />
    </AdminFieldGroup>
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
            state.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
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
