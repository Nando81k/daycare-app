import Link from "next/link"
import { MegaphoneIcon } from "lucide-react"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { parentAnnouncementsPageContent } from "@/data/parent"
import type { ParentAnnouncementPreview } from "@/types/app"

function AnnouncementCard({ announcement }: { announcement: ParentAnnouncementPreview }) {
  return (
    <SurfaceCard density="compact" className="gap-3 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{announcement.title}</h2>
        <Badge variant="outline">{announcement.audience}</Badge>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
      {announcement.body ? (
        <p className="text-sm leading-6 text-muted-foreground/80">{announcement.body}</p>
      ) : null}
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-brand-blue">
        {announcement.publishedAt}
      </p>
    </SurfaceCard>
  )
}

export function ParentAnnouncementsPageView({
  announcements,
}: {
  announcements: ParentAnnouncementPreview[]
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentAnnouncementsPageContent.eyebrow}
        title={parentAnnouncementsPageContent.title}
        description={parentAnnouncementsPageContent.description}
        actions={
          <>
            <Link href="/parent/calendar" className={buttonVariants({ variant: "outline" })}>
              Calendar
            </Link>
            <Link href="/parent/messages" className={buttonVariants({ variant: "ghost" })}>
              Messages
            </Link>
          </>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon={MegaphoneIcon}
          title="No announcements yet"
          description="When the school publishes updates or reminders they will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
