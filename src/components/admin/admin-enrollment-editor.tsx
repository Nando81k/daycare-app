"use client"

import { useActionState, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import {
  declineEnrollmentApplication,
  loadEnrollmentLeadDetail,
  updateEnrollmentLead,
} from "@/app/actions/admin"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { EnrollmentApplicationCards } from "@/components/admin/enrollment/enrollment-application-cards"
import { EnrollmentApproveDialog } from "@/components/admin/enrollment/enrollment-approve-dialog"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { initialMutationState } from "@/lib/action-state"
import type { EnrollmentLeadDetail } from "@/lib/dal/admin"
import { parseDashboardApplicationNote } from "@/lib/parent-enrollment"
import type { AdminActionState, EnrollmentLeadPreview } from "@/types/app"

const initialState: AdminActionState = initialMutationState

const stageOptions = [
  { label: "Contacted", value: "CONTACTED" },
  { label: "Application sent", value: "APPLICATION_SENT" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Denied", value: "DENIED" },
]

const priorityOptions = [
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Normal", value: "NORMAL" },
  { label: "Low", value: "LOW" },
]

function toStageValue(value: EnrollmentLeadPreview["stage"]) {
  switch (value) {
    case "contacted":
      return "CONTACTED"
    case "application-sent":
      return "APPLICATION_SENT"
    case "accepted":
      return "ACCEPTED"
    case "denied":
      return "DENIED"
  }
}

function toPriorityValue(value: EnrollmentLeadPreview["priority"]) {
  switch (value) {
    case "high":
      return "HIGH"
    case "medium":
      return "MEDIUM"
    case "normal":
      return "NORMAL"
    case "low":
      return "LOW"
  }
}

export function AdminEnrollmentEditor({
  lead,
  onClear,
}: {
  lead: EnrollmentLeadPreview
  onClear?: () => void
}) {
  const [updateState, updateAction] = useActionState(
    updateEnrollmentLead,
    initialState
  )
  const [declineState, declineAction] = useActionState(
    declineEnrollmentApplication,
    initialState
  )
  const [detail, setDetail] = useState<EnrollmentLeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { freeformNote } = parseDashboardApplicationNote(lead.note)
  const formKey = `${lead.id}-${lead.stage}-${lead.priority}-${lead.assignedTo}-${lead.note}`

  /* eslint-disable react-hooks/set-state-in-effect -- setState here is the
     reset that happens when the drawer mounts a different lead; it's the
     definition of effect-driven sync. */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setDetail(null)
    loadEnrollmentLeadDetail(lead.id).then((result) => {
      if (cancelled) return
      setDetail(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [lead.id])
  /* eslint-enable react-hooks/set-state-in-effect */

  const isAccepted = lead.stage === "accepted"
  const isDenied = lead.stage === "denied"

  return (
    <div className="space-y-5 px-5 py-4">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading application details…
        </div>
      ) : detail ? (
        <EnrollmentApplicationCards
          lead={detail.lead}
          application={detail.application}
        />
      ) : (
        <AlertBanner
          tone="warning"
          title="Couldn't load this application"
          description="Refresh the page or close and reopen the drawer."
        />
      )}

      <Separator />

      <form action={updateAction} key={formKey}>
        <input type="hidden" name="leadId" value={lead.id} />
        <div className="space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Lead metadata
          </p>
          <AdminFieldGroup className="gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <AdminSelectField
                name="stage"
                label="Lead stage"
                defaultValue={toStageValue(lead.stage)}
                options={stageOptions}
                error={updateState.fieldErrors.stage}
              />
              <AdminSelectField
                name="priority"
                label="Priority"
                defaultValue={toPriorityValue(lead.priority)}
                options={priorityOptions}
                error={updateState.fieldErrors.priority}
              />
            </div>
            <AdminTextField
              name="assignedTo"
              label="Assigned owner"
              defaultValue={lead.assignedTo}
              placeholder="Director or front office owner"
              error={updateState.fieldErrors.assignedTo}
            />
            <AdminTextareaField
              name="note"
              label="Internal note"
              defaultValue={freeformNote}
              placeholder="Capture the clearest next step or concern for this family."
              description="Keep the note actionable so the next follow-up does not depend on memory."
              error={updateState.fieldErrors.note}
              rows={4}
            />
          </AdminFieldGroup>
          {updateState.error ? (
            <AlertBanner
              tone="destructive"
              title="Save failed"
              description={updateState.error}
            />
          ) : null}
          {updateState.success && updateState.message ? (
            <AlertBanner tone="success" title="Saved" description={updateState.message} />
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="submit" variant="outline" size="sm">
              Save metadata
            </Button>
          </div>
        </div>
      </form>

      <Separator />

      <div className="space-y-3">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Decisions
        </p>

        {declineState.error ? (
          <AlertBanner
            tone="destructive"
            title="Couldn't reject"
            description={declineState.error}
          />
        ) : null}
        {declineState.success && declineState.message ? (
          <AlertBanner
            tone="success"
            title="Rejected"
            description={declineState.message}
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {onClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Close
            </Button>
          ) : null}

          <form action={declineAction} className="contents">
            <input type="hidden" name="leadId" value={lead.id} />
            <input
              type="hidden"
              name="note"
              value="Application declined from the enrollment drawer."
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isDenied || isAccepted}
            >
              Reject application
            </Button>
          </form>

          {detail && !isAccepted && !isDenied ? (
            <EnrollmentApproveDialog
              lead={detail.lead}
              application={detail.application}
              classrooms={detail.classrooms}
            />
          ) : null}
        </div>

        {isAccepted ? (
          <p className="text-xs text-emerald-700">
            This lead is already accepted. Manage the child from the families
            or classrooms page.
          </p>
        ) : null}
        {isDenied ? (
          <p className="text-xs text-muted-foreground">
            This lead has been rejected.
          </p>
        ) : null}
      </div>
    </div>
  )
}
