"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminAnnouncementEditor } from "@/components/admin/admin-announcement-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import {
  DrawerBody,
  DrawerSummary,
} from "@/components/admin/admin-detail-drawer"
import { AdminMessageReplyEditor } from "@/components/admin/admin-message-reply-editor"
import {
  formatAdminLabel,
  getAnnouncementVariant,
  getMessageStatusVariant,
} from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminCommunicationsPageContent } from "@/data/admin"
import type {
  AdminAnnouncementPreview,
  AdminMessageThreadPreview,
  AdminTableColumn,
  AdminTableRow,
} from "@/types/app"

/* ── Message thread columns & row mapper ────────────────── */

const messageColumns: AdminTableColumn[] = [
  { key: "subject", header: "Subject" },
  { key: "classroom", header: "Classroom" },
  { key: "lastMessage", header: "Last message" },
  { key: "preview", header: "Preview" },
  { key: "unread", header: "Unread" },
  { key: "status", header: "Status" },
]

function getMessageRows(threads: AdminMessageThreadPreview[]): AdminTableRow[] {
  return threads.map((thread) => ({
    _id: thread.id,
    subject: {
      primary: thread.subject,
      secondary: thread.familyName,
    },
    classroom: thread.classroomLabel,
    lastMessage: thread.lastMessageAt,
    preview: thread.preview,
    unread: String(thread.unreadCount),
    status: {
      label: formatAdminLabel(thread.status),
      variant: getMessageStatusVariant(thread.status),
    },
  }))
}

/* ── Announcement columns & row mapper ──────────────────── */

const announcementColumns: AdminTableColumn[] = [
  { key: "announcement", header: "Announcement" },
  { key: "audience", header: "Audience" },
  { key: "scheduledFor", header: "Scheduled for" },
  { key: "status", header: "Status" },
  { key: "actions", header: "Actions", align: "end" },
]

function getAnnouncementRows(
  announcements: AdminAnnouncementPreview[],
  selectedAnnouncementId: string | null,
  onSelectAnnouncement: (id: string | null) => void
): AdminTableRow[] {
  return announcements.map((announcement) => ({
    _id: announcement.id,
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
      searchValue:
        announcement.publishStatus === "published"
          ? "Published"
          : `Edit ${announcement.title}`,
      content:
        announcement.publishStatus === "published" ? (
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

/* ── Unified communications view ────────────────────────── */

export function AdminCommunicationsPageView({
  messageThreads,
  announcements,
}: {
  messageThreads: AdminMessageThreadPreview[]
  announcements: AdminAnnouncementPreview[]
}) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const firstEditableAnnouncement = announcements.find(
    (a) => a.publishStatus !== "published"
  )
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(
    firstEditableAnnouncement?.id ?? null
  )

  const messageRows = getMessageRows(messageThreads)
  const announcementRows = getAnnouncementRows(
    announcements,
    selectedAnnouncementId,
    setSelectedAnnouncementId
  )

  const selectedThread = messageThreads.find((t) => t.id === selectedThreadId) ?? null
  const selectedAnnouncement =
    announcements.find((a) => a.id === selectedAnnouncementId) ?? null

  const openCount = messageThreads.filter((t) => t.status === "open").length
  const unreadCount = messageThreads.reduce((sum, t) => sum + t.unreadCount, 0)
  const draftCount = announcements.filter((a) => a.publishStatus === "draft").length
  const scheduledCount = announcements.filter((a) => a.publishStatus === "scheduled").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {adminCommunicationsPageContent.eyebrow}
          </p>
          <CardTitle>{adminCommunicationsPageContent.title}</CardTitle>
          <CardDescription>{adminCommunicationsPageContent.description}</CardDescription>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Family hub
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Public contact path
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Open threads</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{openCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Unread</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{unreadCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Drafts</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{draftCount}</p>
            </div>
            <div className="metric-chip">
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{scheduledCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {unreadCount > 0 && (
        <AlertBanner
          tone="info"
          title="Open threads surface first so nothing falls through"
          description="Family communication should feel deliberate and calm. This page keeps the inbox and publishing queue visible so updates feel coordinated."
        />
      )}

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({openCount})</TabsTrigger>
          <TabsTrigger value="broadcasts">
            Broadcasts ({draftCount + scheduledCount})
          </TabsTrigger>
        </TabsList>

        {/* ── Inbox tab ──────────────────────────────────── */}
        <TabsContent value="inbox" className="mt-4 space-y-6">
          <AdminDataTable
            title="Message threads"
            description="Search by subject, family, classroom, or status."
            columns={messageColumns}
            rows={messageRows}
            searchPlaceholder="Search subject, family, or classroom"
            searchKeys={["subject", "classroom", "status", "preview"]}
            onRowClick={(row) => setSelectedThreadId(row._id as string)}
          />

          <Sheet
            open={!!selectedThread}
            onOpenChange={(open) => {
              if (!open) setSelectedThreadId(null)
            }}
          >
            <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
              <SheetHeader className="border-b border-border/60 px-5 py-3">
                <SheetTitle className="text-base">Message thread</SheetTitle>
              </SheetHeader>
              {selectedThread && (
                <DrawerBody>
                  <DrawerSummary
                    title={selectedThread.subject}
                    subtitle={`${selectedThread.familyName} · ${selectedThread.classroomLabel}`}
                    badges={
                      <StatusBadge variant={getMessageStatusVariant(selectedThread.status)}>
                        {formatAdminLabel(selectedThread.status)}
                      </StatusBadge>
                    }
                    meta={<span>Last message {selectedThread.lastMessageAt}</span>}
                  />
                  <p className="rounded-md bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
                    {selectedThread.preview}
                  </p>
                  <AdminMessageReplyEditor
                    threadId={selectedThread.id}
                    subject={selectedThread.subject}
                    onClear={() => setSelectedThreadId(null)}
                  />
                </DrawerBody>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* ── Broadcasts tab ─────────────────────────────── */}
        <TabsContent value="broadcasts" className="mt-4 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <AdminDataTable
              title="Announcement queue"
              description="Search by title, audience, schedule, or publishing state."
              columns={announcementColumns}
              rows={announcementRows}
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
                <Card>
                  <CardHeader>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Publishing standards
                    </p>
                    <CardTitle className="text-xl">
                      What keeps communication trustworthy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="rounded-lg bg-muted/50 px-4 py-4 text-sm leading-6 text-muted-foreground">
                      Audience needs to be explicit. A note to infant families should never
                      read like a generic blast to everyone.
                    </div>
                    <div className="rounded-lg bg-muted/50 px-4 py-4 text-sm leading-6 text-muted-foreground">
                      Scheduled communications should feel intentional, not like drafts that
                      happened to find a date.
                    </div>
                    <div className="rounded-lg bg-muted/50 px-4 py-4 text-sm leading-6 text-muted-foreground">
                      Published items stay read-only so active work does not blur into
                      historical communication.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
