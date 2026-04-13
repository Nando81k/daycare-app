"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminAnnouncementEditor } from "@/components/admin/admin-announcement-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getAnnouncementVariant } from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  adminAnnouncements,
  adminAnnouncementsPageContent,
} from "@/data/admin"
import type { AdminAnnouncementPreview, AdminTableColumn, AdminTableRow } from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "announcement", header: "Announcement" },
  { key: "audience", header: "Audience" },
  { key: "scheduledFor", header: "Scheduled for" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "end" },
]

function getRows(
  announcements: AdminAnnouncementPreview[],
  selectedAnnouncementId: string | null,
  onSelectAnnouncement: (announcementId: string | null) => void
): AdminTableRow[] {
  return announcements.map((announcement) => ({
    announcement: {
      primary: announcement.title,
      secondary: announcement.summary,
    },
    audience: announcement.audience,
    scheduledFor: announcement.scheduledFor,
    status: {
      label: formatAdminLabel(announcement.publishStatus),
      variant: getAnnouncementVariant(announcement.publishStatus),
    },
    actions: {
      type: "custom",
      searchValue: announcement.publishStatus === "published" ? "Published" : `Edit ${announcement.title}`,
      content: announcement.publishStatus === "published" ? (
        <StatusBadge variant="secondary">Published</StatusBadge>
      ) : (
        <Button
          size="sm"
          variant={selectedAnnouncementId === announcement.id ? "secondary" : "outline"}
          onClick={() => onSelectAnnouncement(announcement.id)}
        >
          {selectedAnnouncementId === announcement.id ? "Editing" : "Edit"}
        </Button>
      ),
    },
  }))
}

export function AdminAnnouncementsPageView({
  announcements = adminAnnouncements,
}: {
  announcements?: AdminAnnouncementPreview[]
}) {
  const firstEditableAnnouncement = announcements.find((announcement) => announcement.publishStatus !== "published")
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(firstEditableAnnouncement?.id ?? null)
  const rows = getRows(announcements, selectedAnnouncementId, setSelectedAnnouncementId)
  const selectedAnnouncement = announcements.find((announcement) => announcement.id === selectedAnnouncementId) ?? null
  const draftCount = announcements.filter((announcement) => announcement.publishStatus === "draft").length
  const scheduledCount = announcements.filter((announcement) => announcement.publishStatus === "scheduled").length
  const publishedCount = announcements.filter((announcement) => announcement.publishStatus === "published").length
  const audienceCount = new Set(announcements.map((announcement) => announcement.audience)).size

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminAnnouncementsPageContent.eyebrow}
        title={adminAnnouncementsPageContent.title}
        description={adminAnnouncementsPageContent.description}
        actions={
          <>
            <Link href="/admin/reports" className={buttonVariants({ variant: "outline" })}>
              View reports
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "default" })}>
              Review public contact path
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Drafts</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{draftCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{scheduledCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Published</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{publishedCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Active audiences</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{audienceCount}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="info"
        title="Family communication should feel deliberate and calm"
        description="This page keeps the publishing queue visible by audience and timing so updates feel coordinated instead of improvised."
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminDataTable
          title="Announcement queue"
          description="Search by title, audience, schedule, or publishing state."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search title, audience, or status"
          searchKeys={["announcement", "audience", "scheduledFor", "status", "actions"]}
        />

        <div className="grid gap-6">
          <AdminAnnouncementEditor key="create-announcement" />

          {selectedAnnouncement ? (
            <AdminAnnouncementEditor
              key={selectedAnnouncement.id}
              announcement={selectedAnnouncement}
              onClear={() => setSelectedAnnouncementId(null)}
            />
          ) : (
            <SurfaceCard className="gap-4 px-6 py-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Publishing standards</p>
                <h2 className="text-2xl text-foreground">What keeps communication trustworthy</h2>
              </div>
              <div className="grid gap-3">
                <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Audience needs to be explicit. A note to infant families should never read like a generic blast to everyone.
                </div>
                <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Scheduled communications should feel intentional, not like drafts that happened to find a date.
                </div>
                <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Published items stay read-only in this phase so active work does not blur into historical communication.
                </div>
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>
    </PageShell>
  )
}
