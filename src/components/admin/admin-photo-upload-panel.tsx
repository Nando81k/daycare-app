"use client"

import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { uploadChildDailyReportPhoto } from "@/app/actions/admin"
import { AdminActionPanel, AdminSubmitButton } from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminSelectField,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { getDailyReportPhotoUploadPath } from "@/lib/blob"
import { uploadFile, isUploadEnabled } from "@/lib/upload"
import type { AdminActionState, AdminChildRecordPreview } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

type UploadedAsset = {
  fileName: string
  blobPathname: string
  blobUrl: string
  blobDownloadUrl: string
  contentType: string
  sizeBytes: number
}

export function AdminPhotoUploadPanel({
  childRecords,
}: {
  childRecords: AdminChildRecordPreview[]
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(uploadChildDailyReportPhoto, initialState)
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedChildSlug, setSelectedChildSlug] = useState(childRecords[0]?.slug ?? "")

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

    if (!file || !selectedChildSlug) {
      return
    }

    if (!isUploadEnabled()) {
      setUploadError("File uploads are not configured in this environment.")
      return
    }

    try {
      setIsUploading(true)

      const result = await uploadFile(getDailyReportPhotoUploadPath(selectedChildSlug, file.name), file, {
        access: "public",
        scope: "daily-report-photo",
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
    <AdminActionPanel
      eyebrow="Photo manager"
      title="Add a daily report photo"
      description="Upload a child photo into the latest daily report so the parent dashboard and child page show real media instead of placeholder captions."
      state={state}
    >
      <form action={formAction} className="flex flex-col gap-5">
        <AdminFieldGroup>
          <AdminSelectField
            name="childSlug"
            label="Child"
            defaultValue={selectedChildSlug}
            onChange={(event) => {
              setSelectedChildSlug(event.target.value)
            }}
            options={childRecords.map((child) => ({
              label: `${child.name} · ${child.classroom}`,
              value: child.slug,
            }))}
            error={state.fieldErrors.childSlug}
          />
          <AdminTextField
            name="title"
            label="Photo title"
            placeholder="Garden walk"
            error={state.fieldErrors.title}
          />
          <AdminTextareaField
            name="caption"
            label="Caption"
            placeholder="Short context for what the family is seeing."
            rows={3}
            error={state.fieldErrors.caption}
          />
        </AdminFieldGroup>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/55 px-4 py-4 transition-colors hover:border-primary/40">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isUploading ? "Uploading photo..." : "Choose photo"}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              JPG, PNG, WEBP, or HEIC up to 8 MB.
            </p>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="sr-only"
            onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
          />
        </label>

        {uploadedAsset ? (
          <div className="rounded-2xl border border-border/60 bg-muted/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Ready to attach:
            {" "}
            <span className="font-medium text-foreground">{uploadedAsset.fileName}</span>
          </div>
        ) : null}

        {uploadError ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            {uploadError}
          </div>
        ) : null}

        <input type="hidden" name="fileName" value={uploadedAsset?.fileName ?? ""} />
        <input type="hidden" name="blobPathname" value={uploadedAsset?.blobPathname ?? ""} />
        <input type="hidden" name="blobUrl" value={uploadedAsset?.blobUrl ?? ""} />
        <input type="hidden" name="blobDownloadUrl" value={uploadedAsset?.blobDownloadUrl ?? ""} />
        <input type="hidden" name="contentType" value={uploadedAsset?.contentType ?? ""} />
        <input type="hidden" name="sizeBytes" value={uploadedAsset?.sizeBytes ?? ""} />

        <div className="flex flex-wrap items-center gap-3">
          <AdminSubmitButton
            idleLabel="Add photo"
            pendingLabel="Saving..."
            disabled={!uploadedAsset || isUploading}
          />
          {isUploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Upload in progress
            </div>
          ) : null}
          {!isUploadEnabled() ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TriangleAlertIcon className="size-4" />
              Upload configuration required
            </div>
          ) : null}
        </div>
      </form>
    </AdminActionPanel>
  )
}
