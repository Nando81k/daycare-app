"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ClipboardCheck, Eye, FilePlus2 } from "lucide-react"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminDocumentRequestEditor } from "@/components/admin/admin-document-request-editor"
import { AdminDocumentReviewEditor } from "@/components/admin/admin-document-review-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getDocumentVariant } from "@/components/admin/admin-status"
import {
  DocumentPreviewDialog,
  type DocumentPreviewMeta,
} from "@/components/shared/document-preview-dialog"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminDocuments,
  adminDocumentsPageContent,
} from "@/data/admin"
import type { AdminTableColumn, AdminTableRow, DocumentQueuePreview } from "@/types/app"

type StatusFilter = "all" | "required" | "submitted" | "approved" | "expired"

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "required", label: "Required" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "expired", label: "Expired" },
]

const columns: AdminTableColumn[] = [
  { key: "document", header: "Document" },
  { key: "family", header: "Family" },
  { key: "dueDate", header: "Due date" },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "end" },
]

function toPreviewMeta(document: DocumentQueuePreview): DocumentPreviewMeta {
  return {
    title: document.title,
    fileName: document.fileName,
    contentType: document.contentType,
    sizeLabel: document.sizeLabel,
    previewUrl: document.previewUrl,
    downloadUrl: document.downloadUrl,
    subtitle: `${document.familyName} · ${document.childName}${
      document.submittedAt ? ` · submitted ${document.submittedAt}` : ""
    }`,
  }
}

function getRows(
  documents: DocumentQueuePreview[],
  onPreview: (doc: DocumentQueuePreview) => void,
  onReview: (doc: DocumentQueuePreview) => void,
  onRequest: (doc: DocumentQueuePreview) => void
): AdminTableRow[] {
  return documents.map((document) => {
    const hasFile = Boolean(document.previewUrl || document.downloadUrl)
    const canReview =
      document.status === "submitted" || document.status === "required"
    return {
      document: {
        primary: document.title,
        secondary: `${document.childName} · ${document.note}`,
      },
      family: document.familyName,
      dueDate: document.dueDate,
      owner: document.owner,
      status: {
        label: formatAdminLabel(document.status),
        variant: getDocumentVariant(document.status),
      },
      actions: {
        type: "custom",
        searchValue: `${document.fileName ?? ""} review request`,
        content: (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              size="sm"
              variant="outline"
              disabled={!hasFile}
              onClick={() => onPreview(document)}
              title={hasFile ? "Preview file" : "No file uploaded yet"}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            {canReview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(document)}
                title="Review submission"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                Review
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRequest(document)}
              title={`Request another document from ${document.familyName}`}
            >
              <FilePlus2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    }
  })
}

export function AdminDocumentsPageView({
  documents = adminDocuments,
}: {
  documents?: DocumentQueuePreview[]
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [previewDoc, setPreviewDoc] = useState<DocumentQueuePreview | null>(null)
  const [reviewDoc, setReviewDoc] = useState<DocumentQueuePreview | null>(null)
  const [requestDoc, setRequestDoc] = useState<DocumentQueuePreview | null>(null)

  const counts = useMemo(
    () => ({
      all: documents.length,
      required: documents.filter((d) => d.status === "required").length,
      submitted: documents.filter((d) => d.status === "submitted").length,
      approved: documents.filter((d) => d.status === "approved").length,
      expired: documents.filter((d) => d.status === "expired").length,
    }),
    [documents]
  )

  const filtered = useMemo(() => {
    if (statusFilter === "all") return documents
    return documents.filter((d) => d.status === statusFilter)
  }, [documents, statusFilter])

  const ownerCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of documents) {
      counts.set(d.owner, (counts.get(d.owner) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [documents])

  const reviewQueue = useMemo(
    () =>
      documents.filter(
        (d) => d.status === "submitted" || d.status === "required"
      ),
    [documents]
  )

  const rows = getRows(filtered, setPreviewDoc, setReviewDoc, setRequestDoc)

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminDocumentsPageContent.eyebrow}
        title={adminDocumentsPageContent.title}
        description={adminDocumentsPageContent.description}
        actions={
          <>
            <Link
              href="/admin/families"
              className={buttonVariants({ variant: "outline" })}
            >
              Open families
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Required</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.required}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Expired</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.expired}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">
            Awaiting review
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.submitted}
          </p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Approved</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {counts.approved}
          </p>
        </div>
      </AdminPageHeader>

      <div className="space-y-3">
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <TabsList className="bg-muted/30">
            {STATUS_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="gap-1.5"
              >
                {filter.label}
                <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
                  {counts[filter.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AdminDataTable
          title="Document queue"
          description="Preview a submission, send it back for resubmission, or request a new document — all without leaving the page."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search document, family, owner, or status"
          searchKeys={["document", "family", "owner", "status", "actions"]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SurfaceCard className="gap-4 px-6 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Awaiting review
              </p>
              <h2 className="text-xl text-foreground">Submission backlog</h2>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {reviewQueue.length}
            </span>
          </div>
          {reviewQueue.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Nothing waiting on you. 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {reviewQueue.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => setReviewDoc(doc)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {doc.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.familyName} · {doc.childName}
                      </p>
                    </div>
                    <StatusBadge variant={getDocumentVariant(doc.status)}>
                      {formatAdminLabel(doc.status)}
                    </StatusBadge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <SurfaceCard className="gap-4 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Owners
            </p>
            <h2 className="text-xl text-foreground">Who&apos;s carrying the queue</h2>
          </div>
          {ownerCounts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              No owners assigned yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {ownerCounts.map(([owner, count]) => (
                <li
                  key={owner}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">{owner}</p>
                  <StatusBadge variant="secondary">{count} items</StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>
      </div>

      {/* Preview dialog */}
      <DocumentPreviewDialog
        open={previewDoc !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null)
        }}
        document={previewDoc ? toPreviewMeta(previewDoc) : null}
      />

      {/* Review drawer */}
      <Sheet
        open={reviewDoc !== null}
        onOpenChange={(open) => {
          if (!open) setReviewDoc(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          {reviewDoc && (
            <>
              <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                <SheetTitle className="text-lg">{reviewDoc.title}</SheetTitle>
                <SheetDescription>
                  {reviewDoc.familyName} · {reviewDoc.childName}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <AdminDocumentReviewEditor key={reviewDoc.id} document={reviewDoc} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New-request drawer (uses the row's familyId for context) */}
      <Sheet
        open={requestDoc !== null}
        onOpenChange={(open) => {
          if (!open) setRequestDoc(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          {requestDoc && (
            <>
              <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                <SheetTitle className="text-lg">
                  Request a document
                </SheetTitle>
                <SheetDescription>
                  Sent to {requestDoc.familyName}. They will see it on the parent
                  portal.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <AdminDocumentRequestEditor
                  familyId={requestDoc.id}
                  familyName={requestDoc.familyName}
                  onClear={() => setRequestDoc(null)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
