"use client"

import Link from "next/link"
import { FileUpIcon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { submitParentDocumentUpload } from "@/app/actions/parent"
import { ParentSubmitButton } from "@/components/parent/parent-action-panel"
import { AlertBanner } from "@/components/shared/alert-banner"
import { StatusBadge } from "@/components/shared/status-badge"
import { getDocumentUploadPath } from "@/lib/blob"
import { uploadFile, isUploadEnabled } from "@/lib/upload"
import { initialMutationState } from "@/lib/action-state"
import type { ParentDocumentPreview } from "@/types/app"

type UploadedAsset = {
  fileName: string
  blobPathname: string
  blobUrl: string
  blobDownloadUrl: string
  contentType: string
  sizeBytes: number
}

export function ParentDocumentUploadCard({
  document,
}: {
  document: ParentDocumentPreview
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(submitParentDocumentUpload, initialMutationState)
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!state.success) {
      return
    }

    setUploadedAsset(null)
    router.refresh()
  }, [router, state.success])

  async function handleFileChange(file: File | null) {
    setUploadError(null)
    setUploadedAsset(null)

    if (!file) {
      return
    }

    if (!isUploadEnabled()) {
      setUploadError("File uploads are not configured in this environment yet.")
      return
    }

    try {
      setIsUploading(true)

      const result = await uploadFile(getDocumentUploadPath(document.id, file.name), file, {
        access: "private",
        scope: "document",
      })

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

  return (
    <div className="rounded-3xl border border-border/60 bg-background/82 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{document.title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{document.note}</p>
        </div>
        <StatusBadge variant={document.status === "approved" ? "success" : "warning"}>
          {document.status}
        </StatusBadge>
      </div>

      <div className="mt-4 grid gap-3">
        {document.downloadUrl ? (
          <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-3 text-sm leading-6 text-muted-foreground">
            Current file:
            {" "}
            <Link href={document.downloadUrl} target="_blank" className="font-medium text-foreground underline-offset-4 hover:underline">
              {document.fileName ?? "Download latest file"}
            </Link>
            {document.submittedAt ? ` · submitted ${document.submittedAt}` : ""}
          </div>
        ) : null}

        {uploadError ? (
          <AlertBanner tone="destructive" title="Upload failed" description={uploadError} />
        ) : null}

        {state.error ? (
          <AlertBanner tone="destructive" title="Could not submit document" description={state.error} />
        ) : null}
        {state.success && state.message ? (
          <AlertBanner tone="success" title="Submitted" description={state.message} />
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/55 px-4 py-4 transition-colors hover:border-primary/40">
          <FileUpIcon className="size-5 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isUploading ? "Uploading file..." : "Choose a document to upload"}
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
          <div className="rounded-2xl border border-border/60 bg-muted/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Ready to submit:
            {" "}
            <span className="font-medium text-foreground">{uploadedAsset.fileName}</span>
          </div>
        ) : null}
      </div>

      <form action={formAction} className="mt-5 flex flex-wrap items-center gap-3">
        <input type="hidden" name="documentId" value={document.id} />
        <input type="hidden" name="fileName" value={uploadedAsset?.fileName ?? ""} />
        <input type="hidden" name="blobPathname" value={uploadedAsset?.blobPathname ?? ""} />
        <input type="hidden" name="blobUrl" value={uploadedAsset?.blobUrl ?? ""} />
        <input type="hidden" name="blobDownloadUrl" value={uploadedAsset?.blobDownloadUrl ?? ""} />
        <input type="hidden" name="contentType" value={uploadedAsset?.contentType ?? ""} />
        <input type="hidden" name="sizeBytes" value={uploadedAsset?.sizeBytes ?? ""} />
        <ParentSubmitButton
          idleLabel="Submit document"
          pendingLabel="Submitting..."
          disabled={!uploadedAsset || isUploading}
        />
        {isUploading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Upload in progress
          </div>
        ) : null}
        {!isUploadEnabled() ? (
          <div className="flex items-center gap-2 text-sm text-warning">
            <TriangleAlertIcon className="size-4" />
            Upload configuration required
          </div>
        ) : null}
      </form>
    </div>
  )
}
