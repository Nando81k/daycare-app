"use client"

import { useState } from "react"
import Link from "next/link"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminDocumentRequestEditor } from "@/components/admin/admin-document-request-editor"
import { AdminDocumentReviewEditor } from "@/components/admin/admin-document-review-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getDocumentVariant } from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  adminDocuments,
  adminDocumentsPageContent,
} from "@/data/admin"
import type { AdminTableColumn, AdminTableRow, DocumentQueuePreview } from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "document", header: "Document" },
  { key: "family", header: "Family" },
  { key: "dueDate", header: "Due date" },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status" },
  { key: "note", header: "Note" },
]

function getRows(documents: DocumentQueuePreview[]): AdminTableRow[] {
  return documents.map((document) => ({
    document: {
      primary: document.title,
      secondary: document.childName,
    },
    family: document.familyName,
    dueDate: document.dueDate,
    owner: document.owner,
    status: {
      label: formatAdminLabel(document.status),
      variant: getDocumentVariant(document.status),
    },
    note: document.note,
  }))
}

export function AdminDocumentsPageView({
  documents = adminDocuments,
}: {
  documents?: DocumentQueuePreview[]
}) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentQueuePreview | null>(null)
  const rows = getRows(documents)
  const requiredCount = documents.filter((document) => document.status === "required").length
  const expiredCount = documents.filter((document) => document.status === "expired").length
  const submittedCount = documents.filter((document) => document.status === "submitted").length
  const approvedCount = documents.filter((document) => document.status === "approved").length
  const reviewQueue = documents.filter((document) => document.status === "required" || document.status === "submitted")

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminDocumentsPageContent.eyebrow}
        title={adminDocumentsPageContent.title}
        description={adminDocumentsPageContent.description}
        actions={
          <>
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Open families
            </Link>
            <Link href="/admin/children" className={buttonVariants({ variant: "default" })}>
              Open child directory
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Required</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{requiredCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Expired</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{expiredCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Submitted</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{submittedCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Approved</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{approvedCount}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="warning"
        title="Paperwork queues should feel organized, not hidden"
        description="Required and expired items need stronger visibility than submitted or approved documents so follow-up stays proportional."
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminDataTable
          title="Document queue"
          description="Search by document title, family, child, owner, or status."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search document, family, or owner"
          searchKeys={["document", "family", "owner", "status", "note"]}
          onRowClick={(row) => {
            const doc = documents.find(
              (d) => d.familyName === (row.document as { primary: string; secondary: string }).secondary,
            )
            if (doc) setSelectedDocument(doc)
          }}
        />

        <div className="grid gap-6">
          {selectedDocument ? (
            <AdminDocumentRequestEditor
              familyId={selectedDocument.id}
              familyName={selectedDocument.familyName}
              onClear={() => setSelectedDocument(null)}
            />
          ) : (
            <SurfaceCard density="compact" className="gap-3 px-5 py-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">New request</p>
                <h2 className="text-xl text-foreground">Select a family to create a document request</h2>
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Click any row in the document queue to open the request form for that family. The form will pre-fill with the selected family context.
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Review queue</p>
              <h2 className="text-xl text-foreground">Approve or send back for resubmission</h2>
            </div>
            <div className="grid gap-3">
              {reviewQueue.map((document) => (
                <AdminDocumentReviewEditor key={document.id} document={document} />
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Owner view</p>
              <h2 className="text-xl text-foreground">Who is carrying the queue</h2>
            </div>
            <div className="grid gap-3">
              {Array.from(new Set(documents.map((document) => document.owner))).map((owner) => {
                const count = documents.filter((document) => document.owner === owner).length

                return (
                  <div key={owner} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{owner}</p>
                      <StatusBadge variant="secondary">{count} items</StatusBadge>
                    </div>
                  </div>
                )
              })}
            </div>
          </SurfaceCard>

          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Queue standard</p>
              <h2 className="text-xl text-foreground">What should stay true here</h2>
            </div>
            <div className="grid gap-3">
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Required documents need due dates and ownership that are visible without opening another screen.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Expired documents are operationally different from merely missing ones and should read that way.
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Approval should calm the page down instead of competing visually with urgent follow-up states.
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageShell>
  )
}
