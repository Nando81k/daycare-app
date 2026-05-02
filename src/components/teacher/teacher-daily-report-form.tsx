"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import { teacherUpsertDailyReport } from "@/app/actions/teacher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { initialMutationState } from "@/lib/action-state"
import type { AdminActionState } from "@/types/app"

export type TeacherDailyReportInput = {
  childId: string
  childName: string
  ageLabel: string
  arrivalMood: string
  summary: string
  meals: string[]
  rest: string[]
  activities: string[]
  staffNotes: string[]
}

export function TeacherDailyReportForm({
  initial,
}: {
  initial: TeacherDailyReportInput
}) {
  const [state, action, isPending] = useActionState<AdminActionState, FormData>(
    teacherUpsertDailyReport,
    initialMutationState
  )

  return (
    <form
      action={action}
      className="rounded-2xl border border-border/60 bg-card p-5"
    >
      <input type="hidden" name="childId" value={initial.childId} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {initial.childName}
          </p>
          <p className="text-xs text-muted-foreground">{initial.ageLabel}</p>
        </div>
        {state.message && !state.error && (
          <p className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
            {state.message}
          </p>
        )}
        {state.error && (
          <p className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700">
            {state.error}
          </p>
        )}
      </header>

      <div className="mt-4 grid gap-4">
        <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
          <div className="space-y-1.5">
            <Label htmlFor={`mood-${initial.childId}`} className="text-xs">
              Arrival mood
            </Label>
            <Input
              id={`mood-${initial.childId}`}
              name="arrivalMood"
              defaultValue={initial.arrivalMood}
              placeholder="Cheerful, sleepy, clingy…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`summary-${initial.childId}`} className="text-xs">
              Day summary
            </Label>
            <Input
              id={`summary-${initial.childId}`}
              name="summary"
              defaultValue={initial.summary}
              placeholder="Short note families will see first"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            name="mealsText"
            label="Meals (one per line)"
            value={initial.meals.join("\n")}
            placeholder={"Breakfast – ate most of oatmeal\nLunch – tried pasta, asked for seconds"}
          />
          <Field
            name="restText"
            label="Rest (one per line)"
            value={initial.rest.join("\n")}
            placeholder={"Nap – 12:30–2:10 PM"}
          />
          <Field
            name="activitiesText"
            label="Activities (one per line)"
            value={initial.activities.join("\n")}
            placeholder={"Sensory bin\nOutdoor play\nStory time"}
          />
          <Field
            name="staffNotesText"
            label="Staff notes (one per line)"
            value={initial.staffNotes.join("\n")}
            placeholder={"Bandaid on left knee at 11:05 — small graze, no follow-up needed."}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save report
        </Button>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  value,
  placeholder,
}: {
  name: string
  label: string
  value: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs">
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={value}
        rows={4}
        placeholder={placeholder}
      />
    </div>
  )
}
