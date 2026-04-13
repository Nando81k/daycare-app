import Link from "next/link"
import { CalendarDaysIcon, MegaphoneIcon } from "lucide-react"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { ParentCalendarWorkspace } from "@/components/parent/parent-calendar-workspace"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentCalendarPageContent, parentEvents } from "@/data/parent"
import type { ParentAnnouncementPreview, ParentEventPreview } from "@/types/app"

function AnnouncementCard({ announcement }: { announcement: ParentAnnouncementPreview }) {
  return (
    <Card className="gap-3 px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{announcement.title}</h2>
        <Badge variant="outline">{announcement.audience}</Badge>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
      {announcement.body ? (
        <p className="text-sm leading-6 text-muted-foreground/80">{announcement.body}</p>
      ) : null}
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {announcement.publishedAt}
      </p>
    </Card>
  )
}

export function ParentCalendarPageView({
  events = parentEvents,
  announcements = [],
}: {
  events?: ParentEventPreview[]
  announcements?: ParentAnnouncementPreview[]
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentCalendarPageContent.eyebrow}
        title={parentCalendarPageContent.title}
        description={parentCalendarPageContent.description}
        actions={
          <>
            <Link href="/parent/forms" className={buttonVariants({ variant: "outline" })}>
              Forms
            </Link>
            <Link href="/parent/messages" className={buttonVariants({ variant: "ghost" })}>
              Messages
            </Link>
          </>
        }
      />

      <Tabs defaultValue="calendar" className="gap-5">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-[1rem] bg-muted/40 p-1.5">
          <TabsTrigger value="calendar" className="min-w-[8rem] flex-none px-3 py-2">
            <CalendarDaysIcon data-icon="inline-start" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="announcements" className="min-w-[8rem] flex-none px-3 py-2">
            <MegaphoneIcon data-icon="inline-start" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="pt-1">
          <ParentCalendarWorkspace events={events} />
        </TabsContent>

        <TabsContent value="announcements" className="pt-1">
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
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
