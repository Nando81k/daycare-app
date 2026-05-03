"use client"

import { useActionState } from "react"
import { ListChecks, MessageCircleWarning, XCircle } from "lucide-react"

import {
  declineEnrollmentApplication,
  updateEnrollmentLead,
} from "@/app/actions/admin"
import { EnrollmentApproveDialog } from "@/components/admin/enrollment/enrollment-approve-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { initialMutationState } from "@/lib/action-state"
import type { EnrollmentLeadDetail } from "@/lib/dal/admin"
import type { AdminActionState } from "@/types/app"

const STAGE_OPTIONS = [
  { value: "CONTACTED", label: "Contacted (draft)" },
  { value: "APPLICATION_SENT", label: "Submitted" },
  { value: "ACCEPTED", label: "Approved" },
  { value: "DENIED", label: "Rejected" },
] as const

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const

type Props = {
  lead: {
    id: string
    stage: "CONTACTED" | "APPLICATION_SENT" | "ACCEPTED" | "DENIED"
    priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW"
    assignedTo: string
    note: string
  }
  detail: EnrollmentLeadDetail
}

export function EnrollmentActionPanel({ lead, detail }: Props) {
  const [updateState, updateAction, isUpdating] = useActionState<
    AdminActionState,
    FormData
  >(updateEnrollmentLead, initialMutationState)
  const [declineState, declineAction, isDeclining] = useActionState<
    AdminActionState,
    FormData
  >(declineEnrollmentApplication, initialMutationState)

  const isPending = isUpdating || isDeclining
  const feedback =
    declineState.message ||
    updateState.message ||
    declineState.error ||
    updateState.error
  const feedbackTone = declineState.error || updateState.error
    ? "error"
    : "success"

  return (
    <div className="space-y-5">
      {/* Quick decisions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Decisions
        </p>
        {lead.stage === "ACCEPTED" || lead.stage === "DENIED" ? null : (
          <EnrollmentApproveDialog
            lead={detail.lead}
            application={detail.application}
            classrooms={detail.classrooms}
            trigger={
              <Button
                type="button"
                className="w-full justify-center bg-emerald-600 hover:bg-emerald-700"
              >
                Approve &amp; enroll
              </Button>
            }
          />
        )}
        <form action={declineAction} className="space-y-2">
          <input type="hidden" name="leadId" value={lead.id} />
          <input type="hidden" name="note" value="Declined from admin enrollment detail." />
          <Button
            type="submit"
            variant="outline"
            disabled={isPending || lead.stage === "DENIED" || lead.stage === "ACCEPTED"}
            className="w-full justify-center"
          >
            <XCircle className="h-4 w-4" />
            Reject application
          </Button>
        </form>
      </div>

      {/* Update lead state */}
      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="leadId" value={lead.id} />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Lead details
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="stage" className="text-xs text-slate-600">
            Stage
          </Label>
          <Select name="stage" defaultValue={lead.stage}>
            <SelectTrigger id="stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priority" className="text-xs text-slate-600">
            Priority
          </Label>
          <Select name="priority" defaultValue={lead.priority}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assignedTo" className="text-xs text-slate-600">
            Assigned to
          </Label>
          <input
            id="assignedTo"
            name="assignedTo"
            defaultValue={lead.assignedTo}
            placeholder="Director name"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note" className="text-xs text-slate-600">
            Internal note
          </Label>
          <Textarea
            id="note"
            name="note"
            defaultValue={lead.note}
            rows={4}
            placeholder="Add context for the next reviewer…"
          />
        </div>

        <Button type="submit" variant="outline" disabled={isPending} className="w-full justify-center">
          <ListChecks className="h-4 w-4" />
          Save details
        </Button>
      </form>

      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs ${
            feedbackTone === "error"
              ? "bg-red-50 text-red-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <MessageCircleWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {feedback}
        </p>
      )}
    </div>
  )
}
