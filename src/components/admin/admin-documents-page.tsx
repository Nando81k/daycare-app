"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ChevronRightIcon,
  ClipboardCheck,
  Eye,
  FilePlus2,
  HouseIcon,
  UserRoundIcon,
} from "lucide-react"

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
import { Input } from "@/components/ui/input"
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
  adminFamilyHub,
} from "@/data/admin"
import { cn } from "@/lib/utils"
import type {
  AdminChildHubRecord,
  DocumentQueuePreview,
  FamilyHubRecord,
} from "@/types/app"

const HOUSEHOLD_KEY = "__household"
type StatusFilter = "all" | "needs-attention" | "submitted" | "approved"

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All families" },
  { value: "needs-attention", label: "Needs attention" },
  { value: "submitted", label: "Awaiting review" },
  { value: "approved", label: "All approved" },
]

type RequestTarget =
  | { kind: "create"; familyId: string; familyName: string; defaultChildId?: string }
  | null

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

type FamilyDocSummary = {
  family: FamilyHubRecord
  documents: DocumentQueuePreview[]
  required: number
  submitted: number
  approved: number
  expired: number
  needsAttention: number
}

function summarize(family: FamilyHubRecord, docs: DocumentQueuePreview[]): FamilyDocSummary {
  const required = docs.filter((d) => d.status === "required").length
  const submitted = docs.filter((d) => d.status === "submitted").length
  const approved = docs.filter((d) => d.status === "approved").length
  const expired = docs.filter((d) => d.status === "expired").length
  return {
    family,
    documents: docs,
    required,
    submitted,
    approved,
    expired,
    needsAttention: required + expired + submitted,
  }
}

export function AdminDocumentsPageView({
  documents = adminDocuments,
  families = adminFamilyHub,
}: {
  documents?: DocumentQueuePreview[]
  families?: FamilyHubRecord[]
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [previewDoc, setPreviewDoc] = useState<DocumentQueuePreview | null>(null)
  const [reviewDoc, setReviewDoc] = useState<DocumentQueuePreview | null>(null)
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null)
  const [requestTarget, setRequestTarget] = useState<RequestTarget>(null)

  const familySummaries = useMemo<FamilyDocSummary[]>(() => {
    return families
      .map((family) => {
        const docs = documents.filter((doc) => doc.familyId === family.id)
        return summarize(family, docs)
      })
      .sort((a, b) => {
        if (a.needsAttention !== b.needsAttention) {
          return b.needsAttention - a.needsAttention
        }
        return a.family.familyName.localeCompare(b.family.familyName)
      })
  }, [documents, families])

  const filteredFamilies = useMemo(() => {
    const trimmed = search.trim().toLowerCase()
    return familySummaries.filter((entry) => {
      if (statusFilter === "needs-attention" && entry.required + entry.expired === 0) {
        return false
      }
      if (statusFilter === "submitted" && entry.submitted === 0) {
        return false
      }
      if (statusFilter === "approved") {
        if (entry.documents.length === 0) return false
        if (entry.required + entry.expired + entry.submitted > 0) return false
      }
      if (!trimmed) return true
      const haystack = [
        entry.family.familyName,
        entry.family.guardians.join(" "),
        entry.family.children.join(" "),
        ...entry.documents.map((doc) => doc.title),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(trimmed)
    })
  }, [familySummaries, search, statusFilter])

  const totals = useMemo(() => {
    return familySummaries.reduce(
      (acc, entry) => {
        acc.required += entry.required
        acc.submitted += entry.submitted
        acc.approved += entry.approved
        acc.expired += entry.expired
        return acc
      },
      { required: 0, submitted: 0, approved: 0, expired: 0 },
    )
  }, [familySummaries])

  const counts: Record<StatusFilter, number> = {
    all: familySummaries.length,
    "needs-attention": familySummaries.filter(
      (e) => e.required + e.expired > 0,
    ).length,
    submitted: familySummaries.filter((e) => e.submitted > 0).length,
    approved: familySummaries.filter(
      (e) => e.documents.length > 0 && e.required + e.expired + e.submitted === 0,
    ).length,
  }

  const openFamily = familySummaries.find((e) => e.family.id === openFamilyId) ?? null

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminDocumentsPageContent.eyebrow}
        title={adminDocumentsPageContent.title}
        description={adminDocumentsPageContent.description}
        actions={
          <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
            Open families
          </Link>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Required</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{totals.required}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Expired</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{totals.expired}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Awaiting review</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{totals.submitted}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Approved</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{totals.approved}</p>
        </div>
      </AdminPageHeader>

      <div className="flex flex-col gap-3">
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <TabsList className="bg-muted/30">
            {STATUS_FILTERS.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value} className="gap-1.5">
                {filter.label}
                <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-muted-foreground">
                  {counts[filter.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search family, guardian, child, or document title"
            className="h-9 max-w-md text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {filteredFamilies.length} of {familySummaries.length} families
          </p>
        </div>

        {filteredFamilies.length === 0 ? (
          <SurfaceCard className="border-dashed bg-muted/20 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No families match the current filter or search.
            </p>
          </SurfaceCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredFamilies.map((entry) => (
              <FamilyDocCard
                key={entry.family.id}
                entry={entry}
                onOpen={() => setOpenFamilyId(entry.family.id)}
                onRequest={() =>
                  setRequestTarget({
                    kind: "create",
                    familyId: entry.family.id,
                    familyName: entry.family.familyName,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Family-level document detail sheet */}
      <Sheet
        open={openFamily !== null}
        onOpenChange={(open) => {
          if (!open) setOpenFamilyId(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
        >
          {openFamily && (
            <>
              <SheetHeader className="gap-2 border-b border-border/60 bg-muted/20 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Documents
                </p>
                <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {openFamily.family.familyName}
                </SheetTitle>
                <SheetDescription>
                  {openFamily.documents.length} document
                  {openFamily.documents.length === 1 ? "" : "s"} · {openFamily.required} required ·{" "}
                  {openFamily.expired} expired · {openFamily.submitted} awaiting review
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <FamilyDocumentList
                  family={openFamily.family}
                  documents={openFamily.documents}
                  onPreview={setPreviewDoc}
                  onReview={setReviewDoc}
                  onRequestForChild={(childId) =>
                    setRequestTarget({
                      kind: "create",
                      familyId: openFamily.family.id,
                      familyName: openFamily.family.familyName,
                      defaultChildId: childId,
                    })
                  }
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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

      {/* New-request drawer with optional pre-selected child */}
      <Sheet
        open={requestTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRequestTarget(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          {requestTarget && (
            <>
              <SheetHeader className="border-b border-border/60 bg-muted/20 px-5 py-4">
                <SheetTitle className="text-lg">Request a document</SheetTitle>
                <SheetDescription>
                  Sent to {requestTarget.familyName}
                  {requestTarget.defaultChildId
                    ? ` for ${
                        families
                          .find((f) => f.id === requestTarget.familyId)
                          ?.childRecords.find(
                            (c) => c.id === requestTarget.defaultChildId,
                          )?.name ?? "their child"
                      }`
                    : ""}
                  . They will see it on the parent portal.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <AdminDocumentRequestEditor
                  key={`${requestTarget.familyId}-${requestTarget.defaultChildId ?? "household"}`}
                  familyId={requestTarget.familyId}
                  familyName={requestTarget.familyName}
                  defaultChildId={requestTarget.defaultChildId}
                  roster={
                    families
                      .find((f) => f.id === requestTarget.familyId)
                      ?.childRecords.map((child) => ({
                        id: child.id,
                        name: child.name,
                      })) ?? []
                  }
                  onClear={() => setRequestTarget(null)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}

function FamilyDocCard({
  entry,
  onOpen,
  onRequest,
}: {
  entry: FamilyDocSummary
  onOpen: () => void
  onRequest: () => void
}) {
  const { family, documents, required, expired, submitted, approved, needsAttention } = entry

  return (
    <SurfaceCard
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      aria-label={`Open ${family.familyName} documents`}
      className={cn(
        "group cursor-pointer gap-4 px-5 py-5 transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Household
          </p>
          <h2 className="text-xl text-foreground">{family.familyName}</h2>
          <p className="text-xs text-muted-foreground">
            {family.guardians.join(" · ")}
          </p>
        </div>
        <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {required > 0 ? (
          <StatusBadge variant={getDocumentVariant("required")}>{required} required</StatusBadge>
        ) : null}
        {expired > 0 ? (
          <StatusBadge variant={getDocumentVariant("expired")}>{expired} expired</StatusBadge>
        ) : null}
        {submitted > 0 ? (
          <StatusBadge variant={getDocumentVariant("submitted")}>{submitted} review</StatusBadge>
        ) : null}
        {approved > 0 ? (
          <StatusBadge variant={getDocumentVariant("approved")}>{approved} approved</StatusBadge>
        ) : null}
        {documents.length === 0 ? (
          <StatusBadge variant="secondary">No documents yet</StatusBadge>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        {family.childRecords.length} child
        {family.childRecords.length === 1 ? "" : "ren"}
        {needsAttention > 0
          ? ` · ${needsAttention} item${needsAttention === 1 ? "" : "s"} need attention`
          : documents.length > 0
            ? " · everything is up to date"
            : ""}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation()
            onRequest()
          }}
          className="gap-1.5"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          Request document
        </Button>
      </div>
    </SurfaceCard>
  )
}

function FamilyDocumentList({
  family,
  documents,
  onPreview,
  onReview,
  onRequestForChild,
}: {
  family: FamilyHubRecord
  documents: DocumentQueuePreview[]
  onPreview: (doc: DocumentQueuePreview) => void
  onReview: (doc: DocumentQueuePreview) => void
  onRequestForChild: (childId: string | undefined) => void
}) {
  // Group documents by household-vs-child. Household docs have no childId.
  const groups = new Map<string, DocumentQueuePreview[]>()
  groups.set(HOUSEHOLD_KEY, [])
  for (const child of family.childRecords) {
    groups.set(child.id, [])
  }
  for (const doc of documents) {
    const key = doc.childId && groups.has(doc.childId) ? doc.childId : HOUSEHOLD_KEY
    groups.get(key)?.push(doc)
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-5">
      <DocumentGroup
        title="Household"
        subtitle="Family-level forms (parents)"
        icon={<HouseIcon className="h-4 w-4" />}
        documents={groups.get(HOUSEHOLD_KEY) ?? []}
        onPreview={onPreview}
        onReview={onReview}
        onRequest={() => onRequestForChild(undefined)}
        requestLabel="Request from family"
      />

      {family.childRecords.map((child) => (
        <DocumentGroup
          key={child.id}
          title={child.name}
          subtitle={`${child.ageLabel} · ${child.classroom}`}
          icon={<UserRoundIcon className="h-4 w-4" />}
          documents={groups.get(child.id) ?? []}
          onPreview={onPreview}
          onReview={onReview}
          onRequest={() => onRequestForChild(child.id)}
          requestLabel={`Request for ${child.firstName ?? child.name.split(" ")[0]}`}
          child={child}
        />
      ))}
    </div>
  )
}

function DocumentGroup({
  title,
  subtitle,
  icon,
  documents,
  onPreview,
  onReview,
  onRequest,
  requestLabel,
  child,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  documents: DocumentQueuePreview[]
  onPreview: (doc: DocumentQueuePreview) => void
  onReview: (doc: DocumentQueuePreview) => void
  onRequest: () => void
  requestLabel: string
  child?: AdminChildHubRecord
}) {
  const dueCount = documents.filter(
    (doc) => doc.status === "required" || doc.status === "expired",
  ).length

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRequest}
          className="gap-1.5"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          {requestLabel}
        </Button>
      </div>

      {documents.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-3 py-3 text-xs leading-5 text-muted-foreground">
          {child
            ? `No documents on file for ${child.firstName ?? child.name}. Use “${requestLabel}” to send the first one.`
            : "No household-level documents yet. Family-wide forms (financial agreement, photo release, etc.) go here."}
        </p>
      ) : (
        <ul className="flex flex-col rounded-md border border-border/40">
          {dueCount > 0 ? (
            <li className="border-b border-border/40 bg-amber-50/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
              {dueCount} pending · {documents.length} total
            </li>
          ) : null}
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              onPreview={() => onPreview(doc)}
              onReview={() => onReview(doc)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function DocumentRow({
  document,
  onPreview,
  onReview,
}: {
  document: DocumentQueuePreview
  onPreview: () => void
  onReview: () => void
}) {
  const hasFile = Boolean(document.previewUrl || document.downloadUrl)
  const canReview = document.status === "submitted" || document.status === "required"

  return (
    <li className="flex flex-col gap-2 border-b border-border/40 px-3 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{document.title}</p>
          <StatusBadge variant={getDocumentVariant(document.status)}>
            {formatAdminLabel(document.status)}
          </StatusBadge>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          Due {document.dueDate} · Owner · {document.owner}
          {document.note ? ` · ${document.note}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!hasFile}
          onClick={onPreview}
          title={hasFile ? "Preview file" : "No file uploaded yet"}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
        {canReview ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onReview}
            title="Review submission"
          >
            <ClipboardCheck className="h-3.5 w-3.5" />
            Review
          </Button>
        ) : null}
      </div>
    </li>
  )
}
