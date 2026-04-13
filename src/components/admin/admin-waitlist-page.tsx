"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminWaitlistEditor } from "@/components/admin/admin-waitlist-editor"
import {
  formatAdminLabel,
  getPriorityVariant,
  getWaitlistStatusVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  adminWaitlistEntries,
  adminWaitlistPageContent,
} from "@/data/admin"
import type {
  AdminTableColumn,
  AdminTableRow,
  WaitlistEntryPreview,
} from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "family", header: "Family" },
  { key: "schedule", header: "Schedule need" },
  { key: "requestedStart", header: "Requested start" },
  { key: "priority", header: "Priority" },
  { key: "status", header: "Status" },
  { key: "assignedTo", header: "Assigned" },
]

function getRows(
  waitlistEntries: WaitlistEntryPreview[]
): AdminTableRow[] {
  return waitlistEntries.map((entry) => ({
    _id: entry.id,
    family: {
      primary: entry.familyName,
      secondary: `${entry.childName} · ${entry.ageLabel}`,
    },
    schedule: entry.scheduleNeed,
    requestedStart: entry.requestedStart,
    priority: {
      label: formatAdminLabel(entry.priority),
      variant: getPriorityVariant(entry.priority),
    },
    status: {
      label: formatAdminLabel(entry.status),
      variant: getWaitlistStatusVariant(entry.status),
    },
    assignedTo: {
      primary: entry.assignedTo,
      secondary: entry.note,
    },
  }))
}

export function AdminWaitlistPageView({
  waitlistEntries = adminWaitlistEntries,
}: {
  waitlistEntries?: WaitlistEntryPreview[]
}) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const rows = getRows(waitlistEntries)
  const selectedEntry = waitlistEntries.find((entry) => entry.id === selectedEntryId) ?? null
  const offerReadyCount = waitlistEntries.filter((entry) => entry.status === "offer-ready").length
  const highPriorityCount = waitlistEntries.filter((entry) => entry.priority === "high").length
  const longRangeCount = waitlistEntries.filter((entry) => entry.status === "long-range").length
  const partTimeCount = waitlistEntries.filter((entry) => entry.scheduleNeed !== "Full time").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminWaitlistPageContent.eyebrow}
        title={adminWaitlistPageContent.title}
        description={adminWaitlistPageContent.description}
        actions={
          <>
            <Link href="/admin/enrollment" className={buttonVariants({ variant: "outline" })}>
              Open enrollment
            </Link>
            <Link href="/waitlist" className={buttonVariants({ variant: "default" })}>
              View public waitlist form
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Offer-ready families</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{offerReadyCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">High-priority review</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{highPriorityCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Part-time requests</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{partTimeCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Long-range planning</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{longRangeCount}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="warning"
        title="One infant-family offer is close to decision time"
        description="The Santos family likely aligns with the next infant opening, so the waitlist should help the director act before that placement window drifts."
        action={
          <Link href="/admin/classrooms" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Review openings
          </Link>
        }
      />

      <AdminDataTable
        title="Waitlist queue"
        description="Compare requested timing, schedule fit, and placement readiness without flattening every family into the same urgency."
        columns={columns}
        rows={rows}
        searchPlaceholder="Search family, schedule, or note"
        searchKeys={["family", "schedule", "status", "assignedTo"]}
        onRowClick={(row) => {
          const id = row._id as string
          setSelectedEntryId(id)
        }}
      />

      <Dialog
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntryId(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update waitlist entry</DialogTitle>
            <DialogDescription>
              {selectedEntry
                ? `${selectedEntry.familyName} · ${selectedEntry.childName}`
                : "Edit entry details"}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <AdminWaitlistEditor
              key={selectedEntry.id}
              entry={selectedEntry}
              onClear={() => setSelectedEntryId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
