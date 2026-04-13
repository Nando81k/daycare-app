"use client"

import { useState } from "react"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminMessageReplyEditor } from "@/components/admin/admin-message-reply-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getMessageStatusVariant } from "@/components/admin/admin-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { adminMessagesPageContent } from "@/data/admin"
import type { AdminMessageThreadPreview, AdminTableColumn, AdminTableRow } from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "subject", header: "Subject" },
  { key: "classroom", header: "Classroom" },
  { key: "lastMessage", header: "Last message" },
  { key: "preview", header: "Preview" },
  { key: "unread", header: "Unread" },
  { key: "status", header: "Status" },
]

function getRows(threads: AdminMessageThreadPreview[]): AdminTableRow[] {
  return threads.map((thread) => ({
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

export function AdminMessagesPageView({
  threads,
}: {
  threads: AdminMessageThreadPreview[]
}) {
  const [selectedThread, setSelectedThread] = useState<AdminMessageThreadPreview | null>(null)

  const rows = getRows(threads)
  const openCount = threads.filter((t) => t.status === "open").length
  const closedCount = threads.filter((t) => t.status === "closed").length
  const unreadCount = threads.reduce((sum, t) => sum + t.unreadCount, 0)

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminMessagesPageContent.eyebrow}
        title={adminMessagesPageContent.title}
        description={adminMessagesPageContent.description}
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Open</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{openCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Closed</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{closedCount}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Unread</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{unreadCount}</p>
        </div>
      </AdminPageHeader>

      <AlertBanner
        tone="info"
        title="Open threads surface first so nothing falls through"
        description="Closed threads stay accessible for reference but tuck behind the active conversation queue."
      />

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminDataTable
          title="Message threads"
          description="Search by subject, family, classroom, or status."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search subject, family, or classroom"
          searchKeys={["subject", "classroom", "status", "preview"]}
          onRowClick={(row) => {
            const thread = threads.find((t) => t.subject === (row.subject as { primary: string }).primary)
            if (thread) setSelectedThread(thread)
          }}
        />

        <div className="grid gap-6">
          {selectedThread ? (
            <AdminMessageReplyEditor
              threadId={selectedThread.id}
              subject={selectedThread.subject}
              onClear={() => setSelectedThread(null)}
            />
          ) : (
            <SurfaceCard density="compact" className="gap-3 px-5 py-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Reply</p>
                <h2 className="text-xl text-foreground">Select a thread to reply</h2>
              </div>
              <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
                Click a row in the table to open a reply panel for that thread.
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard density="compact" className="gap-3 px-5 py-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Classroom breakdown</p>
              <h2 className="text-xl text-foreground">Threads by classroom</h2>
            </div>
            <div className="grid gap-3">
              {Array.from(new Set(threads.map((t) => t.classroomLabel))).map((classroom) => {
                const count = threads.filter((t) => t.classroomLabel === classroom).length

                return (
                  <div key={classroom} className="surface-panel-quiet rounded-[1.2rem] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{classroom}</p>
                      <StatusBadge variant="secondary">{count} threads</StatusBadge>
                    </div>
                  </div>
                )
              })}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageShell>
  )
}
