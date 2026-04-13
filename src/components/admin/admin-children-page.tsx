"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminChildrenEditor } from "@/components/admin/admin-children-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPhotoUploadPanel } from "@/components/admin/admin-photo-upload-panel"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  formatAdminLabel,
  getChildAttendanceVariant,
  getDocumentVariant,
  getFamilyBalanceVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  adminChildrenHub,
  adminChildrenPageContent,
  adminClassrooms,
} from "@/data/admin"
import type {
  AdminChildHubRecord,
  AdminTableColumn,
  AdminTableRow,
  ClassroomSummaryPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "child", header: "Child" },
  { key: "classroom", header: "Classroom" },
  { key: "family", header: "Family" },
  { key: "attendance", header: "Attendance" },
  { key: "allergies", header: "Allergies" },
  { key: "billing", header: "Billing" },
  { key: "documents", header: "Documents" },
]

function getRows(children: AdminChildHubRecord[]): AdminTableRow[] {
  return children.map((child) => ({
    _id: child.id,
    child: {
      primary: child.name,
      secondary: child.ageLabel,
    },
    classroom: child.classroom,
    family: child.familyName,
    attendance: {
      label: formatAdminLabel(child.attendanceStatus),
      variant: getChildAttendanceVariant(child.attendanceStatus),
    },
    allergies: child.allergies.length ? child.allergies.join(", ") : "None listed",
    billing: {
      label: formatAdminLabel(child.balanceStatus),
      variant: getFamilyBalanceVariant(child.balanceStatus),
    },
    documents: {
      label: formatAdminLabel(child.documentsStatus),
      variant: getDocumentVariant(child.documentsStatus),
    },
  }))
}

export function AdminChildrenPageView({
  childRecords = adminChildrenHub,
  classrooms = adminClassrooms,
}: {
  childRecords?: AdminChildHubRecord[]
  classrooms?: ClassroomSummaryPreview[]
}) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const rows = getRows(childRecords)
  const selectedChild = childRecords.find((child) => child.id === selectedChildId) ?? null
  const pendingDocumentsCount = childRecords.filter((child) => child.documentsStatus === "pending").length
  const balanceDueCount = childRecords.filter((child) => child.balanceStatus === "due").length
  const allergyCount = childRecords.filter((child) => child.allergies.length > 0).length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminChildrenPageContent.eyebrow}
        title={adminChildrenPageContent.title}
        description={adminChildrenPageContent.description}
        actions={
          <>
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Open families
            </Link>
            <Link href="/admin/documents" className={buttonVariants({ variant: "default" })}>
              Review documents
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Children in sample roster</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{childRecords.length}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Pending documents</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{pendingDocumentsCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Balances due</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{balanceDueCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Allergy visibility</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{allergyCount} profiles flagged</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="warning"
        title="Care context and follow-up need to stay connected"
        description="A child roster is only useful when classroom placement, family context, billing, and paperwork stay visible in the same workflow."
      />

      <AdminDataTable
        title="Child directory"
        description="Search the roster by child, family, classroom, or follow-up state."
        columns={columns}
        rows={rows}
        searchPlaceholder="Search child, classroom, or family"
        searchKeys={["child", "classroom", "family", "allergies"]}
        onRowClick={(row) => {
          const id = row._id as string
          setSelectedChildId(id)
        }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPhotoUploadPanel childRecords={childRecords} />

        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Classroom split</p>
            <h2 className="text-xl text-foreground">Roster distribution by room</h2>
          </div>
          <div className="grid gap-3">
            {classrooms.map((room) => {
              const count = childRecords.filter((child) => child.classroom === room.name).length

              return (
                <div key={room.id} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{count} shown in sample roster</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{room.note}</p>
                </div>
              )
            })}
          </div>
        </SurfaceCard>
      </div>

      <Dialog
        open={!!selectedChild}
        onOpenChange={(open) => {
          if (!open) setSelectedChildId(null)
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          {selectedChild && (
            <AdminChildrenEditor
              child={selectedChild}
              classrooms={classrooms}
              onClear={() => setSelectedChildId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
