"use client"

import { useActionState, useState } from "react"
import { FileUpIcon, LoaderCircleIcon, XIcon } from "lucide-react"

import { createDocumentRequest } from "@/app/actions/admin"
import {
  AdminActionPanel,
  AdminSubmitButton,
} from "@/components/admin/admin-action-panel"
import {
  AdminFieldGroup,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/admin-form-fields"
import { AlertBanner } from "@/components/shared/alert-banner"
import { Button } from "@/components/ui/button"
import { getDocumentUploadPath } from "@/lib/blob"
import { isUploadEnabled, uploadFile } from "@/lib/upload"
import type { AdminActionState } from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

type TemplateAsset = {
  fileName: string
  blobPathname: string
  blobUrl: string
  blobDownloadUrl: string
  contentType: string
  sizeBytes: number
}

export function AdminDocumentRequestEditor({
  familyId,
  familyName,
  onClear,
}: {
  familyId: string
  familyName: string
  onClear?: () => void
}) {
  const [state, formAction] = useActionState(createDocumentRequest, initialState)
  const [template, setTemplate] = useState<TemplateAsset | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleTemplateChange(file: File | null) {
    setUploadError(null)
    if (!file) {
      setTemplate(null)
      return
    }
    if (!isUploadEnabled()) {
      setUploadError("File uploads are not configured in this environment yet.")
      return
    }

    try {
      setIsUploading(true)
      const ephemeralId = `template-${crypto.randomUUID()}`
      const result = await uploadFile(
        getDocumentUploadPath(ephemeralId, file.name),
        file,
        { access: "private", scope: "document" }
      )
      setTemplate({
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

  const formKey = `doc-request-${familyId}`

  return (
    <form key={formKey} action={formAction}>
      <input type="hidden" name="familyId" value={familyId} />
      <input
        type="hidden"
        name="template"
        value={template ? JSON.stringify(template) : ""}
      />
      <AdminActionPanel
        eyebrow="Document request"
        title={familyName}
        description="Request a document from this family. Optionally attach a blank form for them to download and sign in the portal."
        state={state}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {onClear ? (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Cancel
              </Button>
            ) : null}
            <AdminSubmitButton
              size="sm"
              idleLabel="Send request"
              pendingLabel="Sending..."
              disabled={isUploading}
            />
          </div>
        }
      >
        <AdminFieldGroup className="gap-4">
          <AdminTextField
            name="title"
            label="Document title"
            placeholder="e.g. 2026 Photo Release, Field Trip Permission"
            error={state.fieldErrors.title}
          />
          <AdminTextareaField
            name="note"
            label="Note to family"
            placeholder="Optional details about what is needed or when it is due."
            rows={3}
            error={state.fieldErrors.note}
          />

          {uploadError ? (
            <AlertBanner
              tone="destructive"
              title="Template upload failed"
              description={uploadError}
            />
          ) : null}

          {template ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {template.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Blank template ready to send · {template.contentType}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setTemplate(null)}
                aria-label="Remove template"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/40 px-4 py-3 transition-colors hover:border-primary/40">
              {isUploading ? (
                <LoaderCircleIcon className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <FileUpIcon className="h-5 w-5 text-primary" />
              )}
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {isUploading
                    ? "Uploading template..."
                    : "Attach blank form (optional)"}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  PDF, JPG, PNG, or WEBP up to 10 MB. Parents can preview and
                  type-to-sign.
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) =>
                  void handleTemplateChange(event.target.files?.[0] ?? null)
                }
              />
            </label>
          )}
        </AdminFieldGroup>
      </AdminActionPanel>
    </form>
  )
}
