"use client"

import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { FilePlus2Icon, Loader2Icon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type EnrollmentDocumentType =
  | "IMMUNIZATION_RECORD"
  | "HEALTH_FORM"
  | "EMERGENCY_CONTACT"
  | "PHOTO_RELEASE"
  | "OTHER"

type UploadedEnrollmentDocument = {
  blobUrl: string
  blobPath: string
  fileName: string
  mimeType: string
  sizeBytes: number
  type: EnrollmentDocumentType
}

export function EnrollmentDocumentUploader() {
  const [documents, setDocuments] = useState<UploadedEnrollmentDocument[]>([])
  const [documentType, setDocumentType] = useState<EnrollmentDocumentType>("OTHER")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) {
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploaded: UploadedEnrollmentDocument[] = []

      for (const file of files) {
        const pathname = `enrollment/${Date.now()}-${file.name.replaceAll(/\s+/g, "-")}`
        const result = await upload(pathname, file, {
          access: "private",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({
            type: documentType,
          }),
        })

        uploaded.push({
          blobUrl: result.url,
          blobPath: result.pathname,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          type: documentType,
        })
      }

      setDocuments((prev) => [...prev, ...uploaded])
      event.target.value = ""
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="documents" value={JSON.stringify(documents)} />

      <div className="grid gap-2 sm:grid-cols-[0.42fr_0.58fr]">
        <div className="grid gap-2">
          <Label htmlFor="document-type">Document type</Label>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value as EnrollmentDocumentType)}
          >
            <SelectTrigger id="document-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMMUNIZATION_RECORD">Immunization record</SelectItem>
              <SelectItem value="HEALTH_FORM">Health form</SelectItem>
              <SelectItem value="EMERGENCY_CONTACT">Emergency contact</SelectItem>
              <SelectItem value="PHOTO_RELEASE">Photo release</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="documents-upload">Upload files</Label>
          <label
            htmlFor="documents-upload"
            className="flex h-10 cursor-pointer items-center justify-between rounded-xl border border-border/65 bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <span className="inline-flex items-center gap-2">
              <FilePlus2Icon className="size-4" />
              Select files
            </span>
            {uploading ? <Loader2Icon className="size-4 animate-spin" /> : null}
          </label>
          <input
            id="documents-upload"
            type="file"
            multiple
            onChange={onFilesSelected}
            className="sr-only"
            disabled={uploading}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-2">
        {documents.length ? (
          documents.map((document, index) => (
            <Card key={`${document.blobPath}-${index}`} className="border-border/60 bg-background/80 px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{document.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.type.replaceAll("_", " ").toLowerCase()} •{" "}
                    {Math.ceil(document.sizeBytes / 1024)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No files uploaded yet. Add immunization or health documents before submission.
          </p>
        )}
      </div>
    </div>
  )
}
