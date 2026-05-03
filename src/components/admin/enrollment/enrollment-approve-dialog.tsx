"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, Loader2 } from "lucide-react"

import { acceptEnrollmentApplication } from "@/app/actions/admin"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import type { EnrollmentLeadDetail } from "@/lib/dal/admin"

type Lead = EnrollmentLeadDetail["lead"]
type Application = EnrollmentLeadDetail["application"]
type Classroom = EnrollmentLeadDetail["classrooms"][number]

const initialState: AdminActionState = initialMutationState

function todayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function pickDefaultClassroom(
  classrooms: Classroom[],
  ageLabel: string
): string {
  const lower = ageLabel.toLowerCase()
  const match = classrooms.find((c) =>
    c.ageGroup.toLowerCase().includes(lower) ||
    c.name.toLowerCase().includes(lower)
  )
  return (match ?? classrooms[0])?.id ?? ""
}

export function EnrollmentApproveDialog({
  lead,
  application,
  classrooms,
  trigger,
}: {
  lead: Lead
  application: Application
  classrooms: Classroom[]
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const fallbackFirst = useMemo(
    () => lead.childName.split(" ")[0] ?? "",
    [lead.childName]
  )
  const fallbackLast = useMemo(
    () => lead.childName.split(" ").slice(1).join(" ").trim(),
    [lead.childName]
  )

  const defaultFirst = application?.childFirstName || fallbackFirst
  const defaultLast = application?.childLastName || fallbackLast
  const defaultDob =
    application?.dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(application.dateOfBirth)
      ? application.dateOfBirth
      : ""
  const defaultAgeLabel =
    application?.childAgeLabel || lead.childAgeLabel || "Toddler"
  const defaultClassroom = pickDefaultClassroom(classrooms, defaultAgeLabel)

  const [classroomId, setClassroomId] = useState(defaultClassroom)
  const [firstName, setFirstName] = useState(defaultFirst)

  const [state, action, isPending] = useActionState<
    AdminActionState,
    FormData
  >(acceptEnrollmentApplication, initialState)

  /* eslint-disable react-hooks/set-state-in-effect -- mirrors the
     useActionState success → close-and-refresh pattern used elsewhere. */
  useEffect(() => {
    if (!state.success) return
    setOpen(false)
    router.refresh()
  }, [router, state.success])
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedClassroom = classrooms.find((c) => c.id === classroomId)
  const overCapacity =
    selectedClassroom != null &&
    selectedClassroom.enrolled >= selectedClassroom.capacity

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm">
            <CheckCircle2Icon className="h-3.5 w-3.5" />
            Approve & enroll
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Approve & enroll {firstName || lead.childName}
          </DialogTitle>
          <DialogDescription>
            Pick a classroom and confirm the child&apos;s details. We&apos;ll
            create the child record, place them in the room, and post the
            registration fee — all in one go.
          </DialogDescription>
        </DialogHeader>

        {classrooms.length === 0 ? (
          <AlertBanner
            tone="warning"
            title="No classrooms available"
            description="Add a classroom from the Care section before approving."
          />
        ) : null}

        {state.error ? (
          <AlertBanner
            tone="destructive"
            title="Could not approve"
            description={state.error}
          />
        ) : null}

        <form action={action} className="space-y-4">
          <input type="hidden" name="leadId" value={lead.id} />

          <div className="space-y-1.5">
            <Label htmlFor="approve-classroom" className="text-xs">
              Classroom
            </Label>
            <Select
              name="classroomId"
              value={classroomId}
              onValueChange={setClassroomId}
            >
              <SelectTrigger id="approve-classroom">
                <SelectValue placeholder="Pick a classroom…" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((room) => {
                  const full = room.enrolled >= room.capacity
                  return (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} · {room.enrolled}/{room.capacity}
                      {full ? " · at capacity" : ""} · {room.ageGroup}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {state.fieldErrors?.classroomId ? (
              <p className="text-xs text-red-700">
                {state.fieldErrors.classroomId}
              </p>
            ) : null}
            {overCapacity ? (
              <p className="text-xs text-amber-700">
                That classroom is at capacity. You can override (logged in
                audit) but consider a smaller-room transition.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="approve-first" className="text-xs">
                First name
              </Label>
              <Input
                id="approve-first"
                name="childFirstName"
                defaultValue={defaultFirst}
                onChange={(event) => setFirstName(event.target.value)}
              />
              {state.fieldErrors?.childFirstName ? (
                <p className="text-xs text-red-700">
                  {state.fieldErrors.childFirstName}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approve-last" className="text-xs">
                Last name
              </Label>
              <Input
                id="approve-last"
                name="childLastName"
                defaultValue={defaultLast}
              />
              {state.fieldErrors?.childLastName ? (
                <p className="text-xs text-red-700">
                  {state.fieldErrors.childLastName}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="approve-dob" className="text-xs">
                Date of birth
              </Label>
              <Input
                id="approve-dob"
                name="birthday"
                type="date"
                defaultValue={defaultDob}
                required
              />
              {state.fieldErrors?.birthday ? (
                <p className="text-xs text-red-700">
                  {state.fieldErrors.birthday}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approve-age-label" className="text-xs">
                Age label
              </Label>
              <Input
                id="approve-age-label"
                name="ageLabel"
                defaultValue={defaultAgeLabel}
              />
              {state.fieldErrors?.ageLabel ? (
                <p className="text-xs text-red-700">
                  {state.fieldErrors.ageLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="approve-start-date" className="text-xs">
              Start date <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="approve-start-date"
              name="startDate"
              type="date"
              defaultValue={todayIso()}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="approve-summary" className="text-xs">
              Care summary{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="approve-summary"
              name="summary"
              rows={2}
              placeholder="Quiet during transitions, comforted by classical music…"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || classrooms.length === 0}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Approve & enroll {firstName || "this child"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
