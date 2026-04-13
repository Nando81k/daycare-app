"use client"

import Link from "next/link"
import { useActionState } from "react"

import { reviewDocumentSubmission } from "@/app/actions/admin"
import { AdminSubmitButton } from "@/components/admin/admin-action-panel"
import { AdminSelectField, AdminTextareaField } from "@/components/admin/admin-form-fields"
import { AlertBanner } from "@/components/shared/alert-banner"
import type { AdminActionState, DocumentQueuePreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

export function AdminDocumentReviewEditor({
  document,
}: {
  document: DocumentQueuePreview
}) {
  const [state, formAction] = useActionState(reviewDocumentSubmission, initialState)

  return (
    <form action={formAction} className="rounded-3xl border border-border/60 bg-background/82 px-4 py-4">
      <input type="hidden" name="documentId" value={document.id} />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{document.title}</p>
          <p className="text-sm text-muted-foreground">
            {document.familyName} · {document.childName}
          </p>
        </div>
        <AdminSubmitButton size="sm" variant="outline" idleLabel="Save review" pendingLabel="Saving..." />
      </div>

      <div className="mt-4 grid gap-4">
        <AdminSelectField
          name="intent"
          label="Review decision"
          defaultValue={document.status === "submitted" ? "approve" : "request-resubmission"}
          options={[
            {
              label: "Approve",
              value: "approve",
            },
            {
              label: "Request resubmission",
              value: "request-resubmission",
            },
          ]}
          error={state.fieldErrors.intent}
        />
        <AdminTextareaField
          name="note"
          label="Family note"
          defaultValue={
            document.status === "submitted"
              ? "Approved and current on file."
              : document.note
          }
          rows={4}
          error={state.fieldErrors.note}
        />
      </div>

      {document.downloadUrl ? (
        <Link
          href={document.downloadUrl}
          target="_blank"
          className="mt-4 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Download submitted file
        </Link>
      ) : null}

      {state.error ? (
        <div className="mt-4">
          <AlertBanner tone="destructive" title="Review failed" description={state.error} />
        </div>
      ) : null}
      {state.success && state.message ? (
        <div className="mt-4">
          <AlertBanner tone="success" title="Saved" description={state.message} />
        </div>
      ) : null}
    </form>
  )
}
