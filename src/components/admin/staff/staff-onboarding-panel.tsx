"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { CheckCircle2, Circle, Download, Loader2 } from "lucide-react"

import {
  approveStaffDocument,
  loadStaffOnboardingForAdmin,
  rejectStaffDocument,
  type AdminStaffOnboardingDetail,
} from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { initialMutationState } from "@/lib/action-state"
import { useActionState } from "react"

const CATEGORY_LABELS: Record<string, string> = {
  BACKGROUND_CHECK: "Background check",
  FIRST_AID: "First-aid certification",
  GOVERNMENT_ID: "Government-issued ID",
  CERTIFICATION: "Professional certification",
  OFFER_LETTER: "Offer letter",
  OTHER: "Other document",
}

const STATUS_VARIANT: Record<
  string,
  "warning" | "info" | "success" | "destructive" | "secondary"
> = {
  REQUIRED: "warning",
  SUBMITTED: "info",
  APPROVED: "success",
  REJECTED: "destructive",
  EXPIRED: "warning",
}

export function StaffOnboardingPanel({ staffProfileId }: { staffProfileId: string }) {
  const [detail, setDetail] = useState<AdminStaffOnboardingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, startRefresh] = useTransition()

  async function refresh() {
    const next = await loadStaffOnboardingForAdmin(staffProfileId)
    setDetail(next)
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffProfileId])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border/65 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading onboarding…
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
        No onboarding record yet — this staff member doesn&apos;t have a portal account.
      </div>
    )
  }

  const docsTotal = detail.documents.length
  const docsSubmitted = detail.documents.filter(
    (doc) =>
      doc.status === "SUBMITTED" ||
      doc.status === "APPROVED" ||
      doc.status === "REJECTED",
  ).length
  const docsApproved = detail.documents.filter((doc) => doc.status === "APPROVED").length
  const policiesSigned = detail.policies.filter((p) => p.signedName).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/65 bg-card px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Onboarding
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {detail.status === "COMPLETE"
              ? "Complete"
              : detail.status === "IN_PROGRESS"
                ? "In progress"
                : "Not started"}
          </p>
          {detail.completedAt ? (
            <p className="text-xs text-muted-foreground">
              Finished {new Date(detail.completedAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <StatusBadge
          variant={
            detail.status === "COMPLETE"
              ? "success"
              : detail.status === "IN_PROGRESS"
                ? "info"
                : "secondary"
          }
        >
          {docsApproved}/{docsTotal} approved · {policiesSigned}/
          {detail.policies.length} signed
        </StatusBadge>
      </div>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Documents <span className="text-muted-foreground">({docsSubmitted}/{docsTotal} submitted)</span>
        </h4>
        {detail.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents required.</p>
        ) : (
          <ul className="space-y-2">
            {detail.documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-xl border border-border/65 bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </p>
                    {doc.fileName ? (
                      <p className="text-xs text-muted-foreground">
                        {doc.fileName}
                        {doc.submittedAt
                          ? ` · uploaded ${new Date(doc.submittedAt).toLocaleDateString()}`
                          : null}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Awaiting upload.</p>
                    )}
                    {doc.notes ? (
                      <p className="mt-1 text-xs text-destructive">Note to staff: {doc.notes}</p>
                    ) : null}
                  </div>
                  <StatusBadge variant={STATUS_VARIANT[doc.status] ?? "secondary"}>
                    {doc.status.toLowerCase()}
                  </StatusBadge>
                </div>
                <DocumentActions
                  doc={doc}
                  onChanged={() => startRefresh(() => void refresh())}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Policies <span className="text-muted-foreground">({policiesSigned}/{detail.policies.length} signed)</span>
        </h4>
        <ul className="space-y-2">
          {detail.policies.map((policy) => (
            <li
              key={policy.key}
              className="flex items-center gap-3 rounded-xl border border-border/65 bg-card px-4 py-3"
            >
              {policy.signedName ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{policy.title}</p>
                <p className="text-xs text-muted-foreground">
                  {policy.signedName
                    ? `Signed by ${policy.signedName}${
                        policy.signedAt
                          ? ` on ${new Date(policy.signedAt).toLocaleDateString()}`
                          : ""
                      }`
                    : "Not yet signed"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function DocumentActions({
  doc,
  onChanged,
}: {
  doc: AdminStaffOnboardingDetail["documents"][number]
  onChanged: () => void
}) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveStaffDocument,
    initialMutationState,
  )
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectStaffDocument,
    initialMutationState,
  )
  const [showReject, setShowReject] = useState(false)
  const handledSuccessRef = useRef(false)

  useEffect(() => {
    if (approveState.success || rejectState.success) {
      if (handledSuccessRef.current) return
      handledSuccessRef.current = true
      // Schedule the parent refresh in a microtask so React doesn't see this
      // as a synchronous state change inside an effect.
      queueMicrotask(() => {
        onChanged()
        setShowReject(false)
      })
    }
  }, [approveState.success, rejectState.success, onChanged])

  // Nothing to act on if no file has been uploaded yet, or already approved.
  if (!doc.fileName) return null
  if (doc.status === "APPROVED") {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Approved by {doc.reviewedByName ?? "an admin"}
        {doc.approvedAt ? ` on ${new Date(doc.approvedAt).toLocaleDateString()}` : ""}.
      </p>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {doc.blobDownloadUrl ? (
        <a
          href={doc.blobDownloadUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary underline-offset-4 hover:underline"
        >
          <Download className="size-3.5" /> View file
        </a>
      ) : null}

      <form action={approveAction}>
        <input type="hidden" name="documentId" value={doc.id} />
        <Button
          type="submit"
          size="sm"
          disabled={isApproving || isRejecting}
          className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
        >
          {isApproving ? "Approving…" : "Approve"}
        </Button>
      </form>

      {showReject ? (
        <form action={rejectAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="documentId" value={doc.id} />
          <Input
            name="reason"
            placeholder="Reason (visible to staff)"
            className="h-8 w-56 text-sm"
            required
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={isApproving || isRejecting}
          >
            {isRejecting ? "Rejecting…" : "Send rejection"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowReject(false)}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setShowReject(true)}
        >
          Reject
        </Button>
      )}

      {(approveState.error || rejectState.error) ? (
        <p className="w-full text-xs text-destructive">
          {approveState.error ?? rejectState.error}
        </p>
      ) : null}
    </div>
  )
}
