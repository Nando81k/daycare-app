"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, FileUp, Loader2, TriangleAlert } from "lucide-react"

import { submitStaffDocument } from "@/app/actions/staff-onboarding"
import { AlertBanner } from "@/components/shared/alert-banner"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { initialMutationState } from "@/lib/action-state"
import { getStaffDocumentUploadPath } from "@/lib/blob"
import { isUploadEnabled, uploadFile } from "@/lib/upload"
import type { StaffDocument } from "@prisma/client"

const CATEGORY_LABELS: Record<StaffDocument["category"], string> = {
  BACKGROUND_CHECK: "Background check",
  FIRST_AID: "First-aid certification",
  GOVERNMENT_ID: "Government-issued ID",
  CERTIFICATION: "Professional certification",
  OFFER_LETTER: "Signed offer letter",
  OTHER: "Other document",
}

const CATEGORY_HELP: Record<StaffDocument["category"], string> = {
  BACKGROUND_CHECK: "A recent police clearance or background-check report.",
  FIRST_AID:
    "Your current paediatric first-aid + CPR certificate. Include the expiry date if known.",
  GOVERNMENT_ID:
    "A clear photo of the photo page of your passport, national ID, or driver's licence.",
  CERTIFICATION:
    "Any teaching, ECE, or specialist qualification you'd like on file.",
  OFFER_LETTER: "A signed copy of your employment offer letter.",
  OTHER: "Anything else the director has asked you to upload.",
}

const STATUS_VARIANT: Record<StaffDocument["status"], "warning" | "info" | "success" | "destructive"> = {
  REQUIRED: "warning",
  SUBMITTED: "info",
  APPROVED: "success",
  REJECTED: "destructive",
  EXPIRED: "warning",
}

type UploadedAsset = {
  fileName: string
  blobPathname: string
  blobUrl: string
  blobDownloadUrl: string
  contentType: string
  sizeBytes: number
}

export function StaffDocumentUploadCard({ document }: { document: StaffDocument }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    submitStaffDocument,
    initialMutationState,
  )
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (state.success) {
      setUploadedAsset(null)
      router.refresh()
    }
  }, [router, state.success])

  async function handleFileChange(file: File | null) {
    setUploadError(null)
    setUploadedAsset(null)
    if (!file) return
    if (!isUploadEnabled()) {
      setUploadError("File uploads are not configured in this environment yet.")
      return
    }
    try {
      setIsUploading(true)
      const result = await uploadFile(
        getStaffDocumentUploadPath(document.id, file.name),
        file,
        { access: "private", scope: "document" },
      )
      setUploadedAsset({
        fileName: file.name,
        blobPathname: result.pathname,
        blobUrl: result.url,
        blobDownloadUrl: result.downloadUrl,
        contentType: result.contentType,
        sizeBytes: file.size,
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  const label = CATEGORY_LABELS[document.category]
  const help = CATEGORY_HELP[document.category]
  const isApproved = document.status === "APPROVED"
  const wasRejected = document.status === "REJECTED"

  return (
    <div className="rounded-2xl border border-border/65 bg-card p-5 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{label}</p>
          <p className="text-sm leading-6 text-muted-foreground">{help}</p>
        </div>
        <StatusBadge variant={STATUS_VARIANT[document.status]}>
          {document.status.toLowerCase()}
        </StatusBadge>
      </div>

      {document.fileName && document.blobDownloadUrl ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          <span>
            On file:{" "}
            <a
              href={document.blobDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {document.fileName}
            </a>
            {document.submittedAt
              ? ` · uploaded ${new Date(document.submittedAt).toLocaleDateString()}`
              : null}
          </span>
        </div>
      ) : null}

      {wasRejected && document.notes ? (
        <div className="mt-3">
          <AlertBanner
            tone="destructive"
            title="Director asked for a replacement"
            description={document.notes}
          />
        </div>
      ) : null}

      {uploadError ? (
        <div className="mt-3">
          <AlertBanner tone="destructive" title="Upload failed" description={uploadError} />
        </div>
      ) : null}
      {state.error ? (
        <div className="mt-3">
          <AlertBanner tone="destructive" title="Could not submit" description={state.error} />
        </div>
      ) : null}

      {!isApproved ? (
        <>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/45 px-4 py-4 transition-colors hover:border-primary/40">
            <FileUp className="size-5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {isUploading
                  ? "Uploading file..."
                  : uploadedAsset
                    ? "Choose a different file"
                    : document.fileName
                      ? "Replace this document"
                      : "Choose a document to upload"}
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                PDF, JPG, PNG, or WEBP up to 10 MB.
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {uploadedAsset ? (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
              Ready to submit:{" "}
              <span className="font-medium text-foreground">{uploadedAsset.fileName}</span>
            </div>
          ) : null}

          <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="documentId" value={document.id} />
            <input type="hidden" name="fileName" value={uploadedAsset?.fileName ?? ""} />
            <input type="hidden" name="blobPathname" value={uploadedAsset?.blobPathname ?? ""} />
            <input type="hidden" name="blobUrl" value={uploadedAsset?.blobUrl ?? ""} />
            <input
              type="hidden"
              name="blobDownloadUrl"
              value={uploadedAsset?.blobDownloadUrl ?? ""}
            />
            <input
              type="hidden"
              name="contentType"
              value={uploadedAsset?.contentType ?? ""}
            />
            <input
              type="hidden"
              name="sizeBytes"
              value={uploadedAsset?.sizeBytes ?? ""}
            />
            <Button
              type="submit"
              disabled={!uploadedAsset || isUploading || isPending}
              className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
            >
              {isPending ? "Submitting..." : "Submit document"}
            </Button>
            {isUploading ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Upload in progress
              </span>
            ) : null}
            {!isUploadEnabled() ? (
              <span className="inline-flex items-center gap-2 text-sm text-warning-foreground">
                <TriangleAlert className="size-4" />
                Upload configuration required
              </span>
            ) : null}
          </form>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Approved by {document.reviewedByName ?? "the director"}
          {document.approvedAt
            ? ` on ${new Date(document.approvedAt).toLocaleDateString()}`
            : ""}.
        </p>
      )}
    </div>
  )
}
