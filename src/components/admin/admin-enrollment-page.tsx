"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminEnrollmentEditor } from "@/components/admin/admin-enrollment-editor"
import { AdminWaitlistEditor } from "@/components/admin/admin-waitlist-editor"
import {
  formatAdminLabel,
  getEnrollmentStageVariant,
  getPriorityVariant,
  getWaitlistStatusVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  adminEnrollmentLeads,
  adminEnrollmentPageContent,
  adminWaitlistEntries,
} from "@/data/admin"
import type {
  AdminTableColumn,
  AdminTableRow,
  EnrollmentLeadPreview,
  WaitlistEntryPreview,
} from "@/types/app"

/* ── Enrollment columns & row mapper ────────────────────── */

const enrollmentColumns: AdminTableColumn[] = [
  { key: "family", header: "Family" },
  { key: "requestedStart", header: "Requested start" },
  { key: "source", header: "Source" },
  { key: "stage", header: "Stage" },
  { key: "priority", header: "Priority" },
  { key: "assignedTo", header: "Assigned" },
]

function getEnrollmentRows(leads: EnrollmentLeadPreview[]): AdminTableRow[] {
  return leads.map((lead) => ({
    _id: lead.id,
    family: {
      primary: lead.familyName,
      secondary: `${lead.childName} · ${lead.programInterest}`,
    },
    requestedStart: {
      primary: lead.requestedStart,
      secondary: lead.childAgeLabel,
    },
    source: {
      primary: lead.source,
      secondary: `Submitted ${lead.submittedAt}`,
    },
    stage: {
      label: formatAdminLabel(lead.stage),
      variant: getEnrollmentStageVariant(lead.stage),
    },
    priority: {
      label: formatAdminLabel(lead.priority),
      variant: getPriorityVariant(lead.priority),
    },
    assignedTo: {
      primary: lead.assignedTo,
      secondary: lead.note,
    },
  }))
}

/* ── Waitlist columns & row mapper ──────────────────────── */

const waitlistColumns: AdminTableColumn[] = [
  { key: "family", header: "Family" },
  { key: "schedule", header: "Schedule need" },
  { key: "requestedStart", header: "Requested start" },
  { key: "priority", header: "Priority" },
  { key: "status", header: "Status" },
  { key: "assignedTo", header: "Assigned" },
]

function getWaitlistRows(entries: WaitlistEntryPreview[]): AdminTableRow[] {
  return entries.map((entry) => ({
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

/* ── Unified enrollment pipeline view ───────────────────── */

export function AdminEnrollmentPageView({
  enrollmentLeads = adminEnrollmentLeads,
  waitlistEntries = adminWaitlistEntries,
}: {
  enrollmentLeads?: EnrollmentLeadPreview[]
  waitlistEntries?: WaitlistEntryPreview[]
}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)

  const enrollmentRows = getEnrollmentRows(enrollmentLeads)
  const waitlistRows = getWaitlistRows(waitlistEntries)

  const selectedLead = enrollmentLeads.find((l) => l.id === selectedLeadId) ?? null
  const selectedEntry = waitlistEntries.find((e) => e.id === selectedEntryId) ?? null

  const contactedCount = enrollmentLeads.filter((l) => l.stage === "contacted").length
  const applicationSentCount = enrollmentLeads.filter((l) => l.stage === "application-sent").length
  const highPriorityCount = enrollmentLeads.filter((l) => l.priority === "high").length
  const offerReadyCount = waitlistEntries.filter((e) => e.status === "offer-ready").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminEnrollmentPageContent.eyebrow}
          </p>
          <CardTitle>{adminEnrollmentPageContent.title}</CardTitle>
          <CardDescription>{adminEnrollmentPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/waitlist" className={buttonVariants({ variant: "default" })}>
              View public waitlist form
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Active leads</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{enrollmentLeads.length}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Contacted</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{contactedCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">High-priority follow-up</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{highPriorityCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Offer-ready families</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{offerReadyCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertBanner
        tone="warning"
        title="Two leads still need fast follow-up this week"
        description="Families asking about May and June starts are close enough to capacity decisions that delays will weaken the enrollment experience."
        action={
          <Link href="/admin/rooms" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Check classroom capacity
          </Link>
        }
      />

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads ({enrollmentLeads.length})</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({waitlistEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4">
          <AdminDataTable
            title="Lead pipeline"
            description="Search and sort by family, stage, or owner before leads get buried in follow-up."
            columns={enrollmentColumns}
            rows={enrollmentRows}
            searchPlaceholder="Search families, programs, or stage"
            searchKeys={["family", "source", "stage", "assignedTo"]}
            onRowClick={(row) => setSelectedLeadId(row._id as string)}
          />
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <AdminDataTable
            title="Waitlist queue"
            description="Compare requested timing, schedule fit, and placement readiness without flattening every family into the same urgency."
            columns={waitlistColumns}
            rows={waitlistRows}
            searchPlaceholder="Search family, schedule, or status"
            searchKeys={["family", "schedule", "status", "assignedTo"]}
            onRowClick={(row) => setSelectedEntryId(row._id as string)}
          />
        </TabsContent>
      </Tabs>

      <Sheet
        open={!!selectedLead}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null)
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Update enrollment lead</SheetTitle>
            <SheetDescription>
              {selectedLead
                ? `${selectedLead.familyName} · ${selectedLead.childName}`
                : "Edit lead details"}
            </SheetDescription>
          </SheetHeader>
          {selectedLead && (
            <AdminEnrollmentEditor
              key={selectedLead.id}
              lead={selectedLead}
              onClear={() => setSelectedLeadId(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntryId(null)
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Update waitlist entry</SheetTitle>
            <SheetDescription>
              {selectedEntry
                ? `${selectedEntry.familyName} · ${selectedEntry.childName}`
                : "Edit entry details"}
            </SheetDescription>
          </SheetHeader>
          {selectedEntry && (
            <AdminWaitlistEditor
              key={selectedEntry.id}
              entry={selectedEntry}
              onClear={() => setSelectedEntryId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
