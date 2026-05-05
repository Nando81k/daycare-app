import Link from "next/link"
import { CircleAlertIcon, FileCheck2Icon, FilesIcon, FileSearchIcon } from "lucide-react"

import { ParentDocumentUploadCard } from "@/components/parent/parent-document-upload-card"
import { ParentDocumentsTable } from "@/components/parent/parent-documents-table"
import { getDocumentBadgeVariant } from "@/components/parent/parent-status"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageShell } from "@/components/shared/page-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentDocuments, parentFormsPageContent } from "@/data/parent"
import type { ParentDocumentPreview } from "@/types/app"

function SummaryStat({
  label,
  value,
  tone = "secondary",
}: {
  label: string
  value: number
  tone?: "secondary" | "success" | "warning" | "info"
}) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-muted/16 px-4 py-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <Badge variant={tone}>{label}</Badge>
      </div>
    </div>
  )
}

function PendingReviewList({
  documents,
}: {
  documents: ParentDocumentPreview[]
}) {
  if (!documents.length) {
    return (
      <Empty className="rounded-[1rem] border-border/60 bg-muted/18 py-8">
        <EmptyHeader>
          <EmptyTitle>No documents pending review</EmptyTitle>
          <EmptyDescription>
            Once a family upload has been submitted, it will stay here until the school finishes review.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-border/60 bg-background/88">
      {documents.map((document, index) => (
        <div key={document.id}>
          <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">{document.title}</p>
                <StatusBadge variant={getDocumentBadgeVariant(document.status)}>
                  {document.status}
                </StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">{document.category}</p>
              <p className="text-sm leading-6 text-muted-foreground">{document.note}</p>
            </div>
            <div className="shrink-0 text-sm text-muted-foreground">Updated {document.lastUpdated}</div>
          </div>
          {index < documents.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  )
}

export function ParentFormsPageView({
  documents = parentDocuments,
}: {
  documents?: ParentDocumentPreview[]
}) {
  const requiredDocuments = documents.filter((document) => document.status === "required")
  const reviewDocuments = documents.filter((document) => document.status === "submitted")
  const approvedDocuments = documents.filter((document) => document.status === "approved")
  const archivedDocuments = documents.filter((document) => document.status === "expired")
  const defaultTab = requiredDocuments.length
    ? "required"
    : reviewDocuments.length
      ? "review"
      : "all"

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentFormsPageContent.eyebrow}
        title={parentFormsPageContent.title}
        description={parentFormsPageContent.description}
        actions={
          <>
            <Link href="/parent/calendar" className={buttonVariants({ variant: "outline" })}>
              View calendar
            </Link>
            <Link href="/parent/messages" className={buttonVariants({ variant: "ghost" })}>
              Ask a question
            </Link>
          </>
        }
      />

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="gap-4 pb-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">Forms overview</Badge>
              <div className="space-y-1.5">
                <CardTitle>School paperwork grouped by action instead of scattered across cards.</CardTitle>
                <CardDescription>
                  Required items stay easy to finish, pending reviews stay visible, and the full document history stays in one searchable table instead of a separate archive area.
                </CardDescription>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The goal here is one quick pass: know what needs attention now, what the school is reviewing, and what is already safely on file.
            </p>
          </div>
        </CardHeader>

        <CardContent className="gap-6 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryStat label="Required now" value={requiredDocuments.length} tone="warning" />
            <SummaryStat label="Pending review" value={reviewDocuments.length} tone="info" />
            <SummaryStat label="Approved on file" value={approvedDocuments.length} tone="success" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]">
            <div className="rounded-[1.2rem] border border-primary/14 bg-primary/6 px-5 py-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-primary [&_svg]:size-4">
                  <CircleAlertIcon />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-blue">
                    Next step
                  </p>
                  {requiredDocuments.length ? (
                    <>
                      <p className="text-lg font-semibold text-foreground">
                        {requiredDocuments[0].title}
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {requiredDocuments[0].note}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {requiredDocuments[0].dueDate ? (
                          <Badge variant="warning">Due {requiredDocuments[0].dueDate}</Badge>
                        ) : null}
                        <p className="text-sm text-muted-foreground">
                          {requiredDocuments.length > 1
                            ? `${requiredDocuments.length - 1} more required document${requiredDocuments.length - 1 === 1 ? "" : "s"} waiting below.`
                            : "The upload flow stays directly in the Required tab below."}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-foreground">No document is blocking today.</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Current required paperwork is clear. Families can use the table below to review approved files or check anything still pending.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.05rem] border border-border/60 bg-muted/16 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-primary [&_svg]:size-4">
                    <FilesIcon />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">School review</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {reviewDocuments.length
                        ? `${reviewDocuments.length} submitted document${reviewDocuments.length === 1 ? "" : "s"} still need school confirmation.`
                        : "Nothing is waiting on school review right now."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.05rem] border border-border/60 bg-muted/16 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-primary [&_svg]:size-4">
                    <FileCheck2Icon />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground">On file</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {approvedDocuments.length} approved document{approvedDocuments.length === 1 ? "" : "s"} already cleared for classroom and office reference.
                      {archivedDocuments.length ? ` ${archivedDocuments.length} archived item${archivedDocuments.length === 1 ? "" : "s"} remain visible in the table.` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="gap-4 pb-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Document workspace</CardTitle>
              <CardDescription>
                Finish required uploads, watch anything under review, and keep the full document record in one place.
              </CardDescription>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The tabs keep the page focused, while the full document list now uses a searchable, sortable TanStack table instead of a static grid.
            </p>
          </div>
        </CardHeader>

        <CardContent className="gap-5 pt-5">
          <Tabs defaultValue={defaultTab} className="gap-5">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-[1rem] bg-muted/40 p-1.5">
              <TabsTrigger value="required" className="min-w-[8rem] flex-none px-3 py-2">
                Required {requiredDocuments.length ? `(${requiredDocuments.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="review" className="min-w-[8rem] flex-none px-3 py-2">
                Pending review {reviewDocuments.length ? `(${reviewDocuments.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="all" className="min-w-[8rem] flex-none px-3 py-2">
                All documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="required" className="pt-1">
              {requiredDocuments.length ? (
                <div className="grid gap-4 2xl:grid-cols-2">
                  {requiredDocuments.map((document) => (
                    <ParentDocumentUploadCard key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <Empty className="rounded-[1rem] border-border/60 bg-muted/18 py-10">
                  <EmptyHeader>
                    <EmptyTitle>No required uploads right now</EmptyTitle>
                    <EmptyDescription>
                      Current family paperwork is clear. Use the All Documents tab if you want to review what is already on file.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </TabsContent>

            <TabsContent value="review" className="pt-1">
              <PendingReviewList documents={reviewDocuments} />
            </TabsContent>

            <TabsContent value="all" className="pt-1">
              <div className="flex flex-col gap-4">
                <div className="rounded-[1rem] border border-border/60 bg-muted/18 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-primary [&_svg]:size-4">
                      <FileSearchIcon />
                    </span>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-foreground">Searchable document record</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Search by title, category, notes, or status, then sort locally by clicking the column headers.
                      </p>
                    </div>
                  </div>
                </div>
                <ParentDocumentsTable documents={documents} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageShell>
  )
}
