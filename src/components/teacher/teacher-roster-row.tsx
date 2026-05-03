"use client"

import { useActionState, useState } from "react"
import { AlertTriangle, ClipboardList, Loader2 } from "lucide-react"

import { teacherUpsertAttendance } from "@/app/actions/teacher"
import { TeacherDailyReportForm } from "@/components/teacher/teacher-daily-report-form"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { initialMutationState } from "@/lib/action-state"
import { cn } from "@/lib/utils"
import type { TeacherChildRow } from "@/lib/dal/teacher"
import type { AdminActionState, StatusBadgeVariant } from "@/types/app"

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "SCHEDULED", label: "Scheduled" },
] as const

function statusTone(
  status: TeacherChildRow["todayStatus"]
): StatusBadgeVariant {
  switch (status) {
    case "PRESENT":
      return "success"
    case "ABSENT":
      return "destructive"
    case "SCHEDULED":
      return "info"
    default:
      return "secondary"
  }
}

function to24h(value: string | null): string {
  if (!value) return ""
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return ""
  let hour = Number.parseInt(match[1], 10)
  const minute = match[2]
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === "PM" && hour < 12) hour += 12
  if (meridiem === "AM" && hour === 12) hour = 0
  return `${String(hour).padStart(2, "0")}:${minute}`
}

export function TeacherRosterRow({ child }: { child: TeacherChildRow }) {
  const [reportOpen, setReportOpen] = useState(false)
  const [showNote, setShowNote] = useState(child.todayNote.length > 0)

  const [state, action, isPending] = useActionState<AdminActionState, FormData>(
    teacherUpsertAttendance,
    initialMutationState
  )

  const hasReport = !!child.todayReportSummary
  const hasWarnings =
    child.allergies.length > 0 || child.medicalNotes.length > 0
  const reportInitial = child.todayReport ?? {
    arrivalMood: "",
    summary: "",
    meals: [] as string[],
    rest: [] as string[],
    activities: [] as string[],
    staffNotes: [] as string[],
  }

  return (
    <li className="rounded-2xl border border-border/60 bg-background/80 p-4">
      <form action={action} className="space-y-3">
        <input type="hidden" name="childId" value={child.id} />

        <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1.6fr)_140px_120px_120px_auto]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                {child.firstName.charAt(0)}
                {child.lastName.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {child.fullName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {child.ageLabel}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusBadge variant={statusTone(child.todayStatus)}>
                {child.todayStatus
                  ? child.todayStatus.charAt(0) +
                    child.todayStatus.slice(1).toLowerCase()
                  : "Not marked"}
              </StatusBadge>
              {hasReport ? (
                <StatusBadge variant="success">Report posted</StatusBadge>
              ) : null}
              {child.allergies.length > 0 ? (
                <StatusBadge variant="warning">Allergy</StatusBadge>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor={`status-${child.id}`}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Status
            </Label>
            <Select name="status" defaultValue={child.todayStatus ?? "PRESENT"}>
              <SelectTrigger id={`status-${child.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor={`checkin-${child.id}`}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              In
            </Label>
            <Input
              id={`checkin-${child.id}`}
              name="checkInAt"
              type="time"
              defaultValue={to24h(child.checkInAt)}
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor={`checkout-${child.id}`}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Out
            </Label>
            <Input
              id={`checkout-${child.id}`}
              name="checkOutAt"
              type="time"
              defaultValue={to24h(child.checkOutAt)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Save
            </Button>
            <Button
              type="button"
              variant={hasReport ? "outline" : "default"}
              size="sm"
              onClick={() => setReportOpen(true)}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {hasReport ? "Update report" : "Post report"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setShowNote((value) => !value)}
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            {showNote ? "Hide note" : "Add note"}
          </button>
          {state.message && !state.error ? (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {state.message}
            </span>
          ) : null}
          {state.error ? (
            <span className="rounded-md bg-red-50 px-2 py-0.5 text-red-700">
              {state.error}
            </span>
          ) : null}
        </div>

        {showNote ? (
          <div className="space-y-1">
            <Label
              htmlFor={`note-${child.id}`}
              className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
            >
              Note
            </Label>
            <Textarea
              id={`note-${child.id}`}
              name="note"
              rows={2}
              defaultValue={child.todayNote}
              placeholder="Late arrival, planned absence, pickup change…"
            />
          </div>
        ) : (
          // Always submit the existing note so editing other fields doesn't
          // wipe it. Hidden when the textarea is collapsed.
          <input type="hidden" name="note" value={child.todayNote} />
        )}
      </form>

      {hasWarnings ? (
        <p
          className={cn(
            "mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"
          )}
        >
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
          <span>
            {[
              child.allergies.length > 0
                ? `Allergies: ${child.allergies.join(", ")}`
                : null,
              child.medicalNotes.length > 0
                ? `Medical: ${child.medicalNotes.join(", ")}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </p>
      ) : null}

      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 p-0 sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-border/60 px-6 py-4">
            <SheetTitle>Today&apos;s report · {child.fullName}</SheetTitle>
            <SheetDescription>
              Save the daily report — parents see it on their portal.
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto p-6">
            <TeacherDailyReportForm
              initial={{
                childId: child.id,
                childName: child.fullName,
                ageLabel: child.ageLabel,
                arrivalMood: reportInitial.arrivalMood,
                summary: reportInitial.summary,
                meals: reportInitial.meals,
                rest: reportInitial.rest,
                activities: reportInitial.activities,
                staffNotes: reportInitial.staffNotes,
              }}
              onSuccess={() => setReportOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </li>
  )
}
