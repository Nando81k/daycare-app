"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminChildrenEditor } from "@/components/admin/admin-children-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import {
  DrawerBody,
  DrawerSummary,
} from "@/components/admin/admin-detail-drawer"
import { AdminDocumentReviewEditor } from "@/components/admin/admin-document-review-editor"
import { AdminFamilyDetailPanel } from "@/components/admin/admin-family-detail-panel"
import {
  formatAdminLabel,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminClassrooms,
  adminDocuments,
  adminFamilyHub,
  adminFamilyHubPageContent,
} from "@/data/admin"
import type {
  AdminTableColumn,
  AdminTableRow,
  ClassroomSummaryPreview,
  DocumentQueuePreview,
  FamilyHubRecord,
} from "@/types/app"

/* ── Family columns & row mapper ────────────────────────── */

const familyColumns: AdminTableColumn[] = [
  { key: "family", header: "Household" },
  { key: "children", header: "Children" },
  { key: "email", header: "Primary email" },
  { key: "balance", header: "Balance" },
  { key: "documentsDue", header: "Docs due", align: "end" },
  { key: "stage", header: "Enrollment stage" },
]

function getFamilyRows(families: FamilyHubRecord[]): AdminTableRow[] {
  return families.map((family) => ({
    _id: family.id,
    family: {
      primary: family.familyName,
      secondary: family.guardians.join(" · "),
    },
    children: family.childRecords.map((c) => c.name).join(", ") || "—",
    email: family.primaryEmail,
    balance: {
      label:
        family.balanceStatus.charAt(0).toUpperCase() +
        family.balanceStatus.slice(1),
      variant: getFamilyBalanceVariant(family.balanceStatus),
    },
    documentsDue: family.documentsDue,
    stage: family.enrollmentStage,
  }))
}

/* ── Document columns & row mapper ──────────────────────── */

const documentColumns: AdminTableColumn[] = [
  { key: "document", header: "Document" },
  { key: "family", header: "Family" },
  { key: "dueDate", header: "Due date" },
  { key: "owner", header: "Owner" },
  { key: "status", header: "Status" },
  { key: "note", header: "Note" },
]

function getDocumentRows(documents: DocumentQueuePreview[]): AdminTableRow[] {
  return documents.map((document) => ({
    _id: document.id,
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

/* ── Unified family hub view ────────────────────────────── */

export function AdminFamiliesHubPageView({
  familyRecords = adminFamilyHub,
  classrooms = adminClassrooms,
  documents = adminDocuments,
}: {
  familyRecords?: FamilyHubRecord[]
  classrooms?: ClassroomSummaryPreview[]
  documents?: DocumentQueuePreview[]
}) {
  const [selectedFamily, setSelectedFamily] = useState<FamilyHubRecord | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const familyRows = getFamilyRows(familyRecords)
  const documentRows = getDocumentRows(documents)

  const selectedChild =
    selectedFamily?.childRecords.find((c) => c.id === selectedChildId) ?? null
  const selectedDoc = documents.find((d) => d.id === selectedDocId) ?? null

  const totalChildren = familyRecords.reduce(
    (sum, f) => sum + f.childRecords.length,
    0,
  )
  const balanceFollowUpCount = familyRecords.filter(
    (f) => f.balanceStatus !== "current",
  ).length
  const documentsDueCount = familyRecords.reduce(
    (sum, f) => sum + f.documentsDue,
    0,
  )

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminFamilyHubPageContent.eyebrow}
          </p>
          <CardTitle>{adminFamilyHubPageContent.title}</CardTitle>
          <CardDescription>{adminFamilyHubPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/enrollment" className={buttonVariants({ variant: "outline" })}>
              Open enrollment pipeline
            </Link>
            <Link href="/admin/children" className={buttonVariants({ variant: "outline" })}>
              Open child directory
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Households</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{familyRecords.length}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Children</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{totalChildren}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Balance follow-up</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{balanceFollowUpCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Documents due</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{documentsDueCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertBanner
        tone="info"
        title="Family hub"
        description="Click any row to view children, billing, documents, and enrollment for that household."
      />

      <Tabs defaultValue="families">
        <TabsList>
          <TabsTrigger value="families">Families ({familyRecords.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="families" className="mt-4">
          <AdminDataTable
            title="Family directory"
            description="All households, children, and billing in one place."
            columns={familyColumns}
            rows={familyRows}
            searchPlaceholder="Search family, guardian, or email"
            searchKeys={["family", "children", "email", "stage"]}
            onRowClick={(row) => {
              const fam = familyRecords.find((f) => f.id === row._id)
              if (fam) {
                setSelectedFamily(fam)
                setSelectedChildId(null)
              }
            }}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <AdminDataTable
            title="Document queue"
            description="Search by document title, family, child, owner, or status."
            columns={documentColumns}
            rows={documentRows}
            searchPlaceholder="Search document, family, or owner"
            searchKeys={["document", "family", "owner", "status", "note"]}
            onRowClick={(row) => setSelectedDocId(row._id as string)}
          />
        </TabsContent>
      </Tabs>

      {/* Family detail sheet */}
      <Sheet
        open={!!selectedFamily && !selectedChildId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFamily(null)
            setSelectedChildId(null)
          }
        }}
      >
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-2xl">
          <SheetHeader className="border-b border-border/60 px-5 py-3">
            <SheetTitle className="text-base">Family details</SheetTitle>
          </SheetHeader>
          {selectedFamily && (
            <AdminFamilyDetailPanel
              family={selectedFamily}
              documents={documents.filter(
                (d) => d.familyName === selectedFamily.familyName,
              )}
              onChildSelect={(childId) => setSelectedChildId(childId)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Document review sheet */}
      <Sheet
        open={!!selectedDoc}
        onOpenChange={(open) => {
          if (!open) setSelectedDocId(null)
        }}
      >
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b border-border/60 px-5 py-3">
            <SheetTitle className="text-base">Review document</SheetTitle>
          </SheetHeader>
          {selectedDoc && (
            <DrawerBody>
              <DrawerSummary
                title={selectedDoc.title}
                subtitle={`${selectedDoc.childName} · ${selectedDoc.familyName}`}
                badges={
                  <StatusBadge variant={getDocumentVariant(selectedDoc.status)}>
                    {formatAdminLabel(selectedDoc.status)}
                  </StatusBadge>
                }
                meta={
                  <>
                    <span>Due {selectedDoc.dueDate}</span>
                    <span>Owner · {selectedDoc.owner}</span>
                  </>
                }
              />
              <AdminDocumentReviewEditor
                key={selectedDoc.id}
                document={selectedDoc}
              />
            </DrawerBody>
          )}
        </SheetContent>
      </Sheet>

      {/* Child profile dialog (deep-dive from family sheet) */}
      <Dialog
        open={!!selectedChild}
        onOpenChange={(open) => {
          if (!open) setSelectedChildId(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          {selectedChild && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedChild.name}</DialogTitle>
                <DialogDescription>
                  {selectedChild.ageLabel} · {selectedChild.classroom}
                </DialogDescription>
              </DialogHeader>
              <AdminChildrenEditor
                child={selectedChild}
                classrooms={classrooms}
                onClear={() => setSelectedChildId(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
