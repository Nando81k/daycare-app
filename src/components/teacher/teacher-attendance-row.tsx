"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import { teacherUpsertAttendance } from "@/app/actions/teacher"
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
import { Textarea } from "@/components/ui/textarea"
import { initialMutationState } from "@/lib/action-state"
import type { AdminActionState } from "@/types/app"

type ChildRow = {
  id: string
  name: string
  ageLabel: string
  todayStatus: "PRESENT" | "ABSENT" | "SCHEDULED" | null
  checkInAt: string | null
  checkOutAt: string | null
  todayNote: string
}

const STATUS = ["PRESENT", "ABSENT", "SCHEDULED"] as const

export function TeacherAttendanceRow({ child }: { child: ChildRow }) {
  const [state, action, isPending] = useActionState<AdminActionState, FormData>(
    teacherUpsertAttendance,
    initialMutationState
  )

  return (
    <form
      action={action}
      className="rounded-xl border border-border/60 bg-card p-4"
    >
      <input type="hidden" name="childId" value={child.id} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{child.name}</p>
          <p className="text-xs text-muted-foreground">{child.ageLabel}</p>
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
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="space-y-1.5">
          <Label htmlFor={`status-${child.id}`} className="text-xs">
            Status
          </Label>
          <Select name="status" defaultValue={child.todayStatus ?? "PRESENT"}>
            <SelectTrigger id={`status-${child.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`checkin-${child.id}`} className="text-xs">
            Check-in
          </Label>
          <Input
            id={`checkin-${child.id}`}
            name="checkInAt"
            type="time"
            defaultValue={child.checkInAt ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`checkout-${child.id}`} className="text-xs">
            Check-out
          </Label>
          <Input
            id={`checkout-${child.id}`}
            name="checkOutAt"
            type="time"
            defaultValue={child.checkOutAt ?? ""}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <Label htmlFor={`note-${child.id}`} className="text-xs">
          Note (optional)
        </Label>
        <Textarea
          id={`note-${child.id}`}
          name="note"
          rows={2}
          defaultValue={child.todayNote}
          placeholder="Late arrival, planned absence, pickup change…"
        />
      </div>
    </form>
  )
}
