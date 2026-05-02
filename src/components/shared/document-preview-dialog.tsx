"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ExternalLink, FileText } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type DocumentPreviewMeta = {
  /** Title shown in the dialog header. */
  title: string
  /** File name as uploaded (used to detect type when contentType is missing). */
  fileName?: string | null
  contentType?: string | null
  sizeLabel?: string | null
  /** URL the iframe / img reads from (typically the inline-renderable blob URL). */
  previewUrl?: string | null
  /** URL that triggers a download (typically the attachment-disposition blob URL). */
  downloadUrl?: string | null
  /** Optional small subtitle (e.g. "Brooks Family · submitted Apr 12"). */
  subtitle?: string
}

type Kind = "image" | "pdf" | "other"

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg",
])

function detectKind(
  fileName: string | null | undefined,
  contentType: string | null | undefined
): Kind {
  const type = (contentType ?? "").toLowerCase()
  if (type.startsWith("image/")) return "image"
  if (type === "application/pdf") return "pdf"
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? ""
  if (IMAGE_EXTENSIONS.has(ext)) return "image"
  if (ext === "pdf") return "pdf"
  return "other"
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
  className,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
  document: DocumentPreviewMeta | null
  className?: string
}) {
  const kind = detectKind(document?.fileName, document?.contentType)
  const previewUrl = document?.previewUrl ?? document?.downloadUrl ?? null
  const downloadUrl = document?.downloadUrl ?? document?.previewUrl ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] w-[min(96vw,72rem)] flex-col gap-0 p-0 sm:max-w-none",
          className
        )}
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <DialogTitle className="truncate text-base text-foreground sm:text-lg">
              {document?.title ?? "Document"}
            </DialogTitle>
            <p className="truncate text-xs text-muted-foreground">
              {[document?.fileName, document?.sizeLabel, document?.subtitle]
                .filter(Boolean)
                .join(" · ") || "No file information available."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {downloadUrl && (
              <Link
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </Link>
            )}
            {downloadUrl && (
              <Link
                href={downloadUrl}
                download={document?.fileName ?? true}
                className={buttonVariants({ size: "sm" })}
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Link>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {!previewUrl ? (
            <NoPreview message="No file is attached to this document yet." />
          ) : kind === "image" ? (
            <div className="flex h-full max-h-[78vh] items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={document?.title ?? "Document preview"}
                className="max-h-full max-w-full rounded-lg object-contain shadow-(--shadow-soft)"
              />
            </div>
          ) : kind === "pdf" ? (
            <iframe
              src={previewUrl}
              title={`${document?.title ?? "Document"} preview`}
              className="h-[78vh] w-full border-0 bg-white"
            />
          ) : (
            <NoPreview
              message={
                "This file type can't be previewed inline. Use Open or Download to view it."
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NoPreview({ message }: { message: string }) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FileText className="h-6 w-6" />
      </span>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">
        {message}
      </p>
    </div>
  )
}

/**
 * Convenience wrapper: a button that owns its own open/close state and renders
 * the preview dialog. Use this when you just want a plain "Preview" trigger;
 * use `DocumentPreviewDialog` directly if you need to control state externally.
 */
export function DocumentPreviewButton({
  document,
  size = "sm",
  variant = "outline",
  label = "Preview",
  className,
}: {
  document: DocumentPreviewMeta
  size?: "sm" | "default" | "lg"
  variant?: "outline" | "default" | "ghost" | "secondary"
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const disabled = !document.previewUrl && !document.downloadUrl
  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {label}
      </Button>
      <DocumentPreviewDialog
        open={open}
        onOpenChange={setOpen}
        document={document}
      />
    </>
  )
}
