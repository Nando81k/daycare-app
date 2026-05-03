"use client"

import Link from "next/link"
import { ChevronLeftIcon, MessageSquareIcon, PlusIcon } from "lucide-react"
import { useActionState, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { createParentThread, sendParentReply } from "@/app/actions/parent"
import { ParentSubmitButton } from "@/components/parent/parent-action-panel"
import {
  ParentFieldGroup,
  ParentSelectField,
  ParentTextareaField,
  ParentTextField,
} from "@/components/parent/parent-form-fields"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { PersonAvatar } from "@/components/parent/person-avatar"
import { getThreadBadgeVariant } from "@/components/parent/parent-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  parentAnnouncements,
  parentChildProfile,
  parentMessageThreads,
  parentMessagesPageContent,
} from "@/data/parent"
import { useIsMobile } from "@/hooks/use-mobile"
import { initialMutationState } from "@/lib/action-state"
import { BILLING_THREAD_LABEL } from "@/lib/messaging"
import type { ParentAnnouncementPreview, ParentMessageThreadPreview } from "@/types/app"
import { cn } from "@/lib/utils"

type WorkspaceTab = "inbox" | "updates" | "compose"
type MobileInboxTab = "threads" | "conversation"

function ThreadListRow({
  thread,
  isActive,
  onSelect,
}: {
  thread: ParentMessageThreadPreview
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "row-hover w-full border-l-2 px-4 py-3.5 text-left transition-colors sm:px-5",
        isActive
          ? "border-primary bg-accent/30"
          : "border-transparent hover:bg-accent/16"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">{thread.subject}</p>
          <p className="text-sm text-muted-foreground">{thread.classroom}</p>
        </div>
        {thread.unreadCount ? (
          <Badge variant="warning">{thread.unreadCount} unread</Badge>
        ) : (
          <StatusBadge variant={getThreadBadgeVariant(thread.status)}>{thread.status}</StatusBadge>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{thread.preview}</p>
      <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {thread.lastMessageAt}
      </p>
    </button>
  )
}

function MessageBubble({
  sender,
  role,
  sentAt,
  body,
}: ParentMessageThreadPreview["messages"][number]) {
  const isParent = role === "parent"

  return (
    <div className={cn("flex gap-3", isParent && "justify-end")}>
      {!isParent ? <PersonAvatar name={sender} size="sm" tone="muted" /> : null}
      <div
        className={cn(
          "max-w-[42rem] rounded-[1.15rem] px-4 py-3.5",
          isParent ? "bg-secondary text-secondary-foreground" : "bg-background/86 text-foreground"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{sender}</p>
          <p className="text-xs uppercase tracking-[0.14em] opacity-70">{sentAt}</p>
        </div>
        <p className="mt-2 text-sm leading-7 opacity-90">{body}</p>
      </div>
      {isParent ? <PersonAvatar name={sender} size="sm" tone="accent" /> : null}
    </div>
  )
}

export function ParentMessagesPageView({
  childId = parentChildProfile.id,
  initialThreads = parentMessageThreads,
  announcements = parentAnnouncements,
}: {
  childId?: string
  initialThreads?: ParentMessageThreadPreview[]
  announcements?: ParentAnnouncementPreview[]
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [threads, setThreads] = useState(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState(initialThreads[0]?.id ?? "")
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("inbox")
  const [mobileInboxTab, setMobileInboxTab] = useState<MobileInboxTab>("threads")
  const [replyState, replyAction] = useActionState(sendParentReply, initialMutationState)
  const [newThreadState, newThreadAction] = useActionState(createParentThread, initialMutationState)

  useEffect(() => {
    setThreads(initialThreads)
  }, [initialThreads])

  useEffect(() => {
    if (!threads.find((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(threads[0]?.id ?? "")
    }
  }, [selectedThreadId, threads])

  useEffect(() => {
    if (!replyState.success) {
      return
    }

    router.refresh()
  }, [replyState.success, router])

  useEffect(() => {
    if (!newThreadState.success) {
      return
    }

    setWorkspaceTab("inbox")
    setMobileInboxTab("conversation")
    setSelectedThreadId("")
    router.refresh()
  }, [newThreadState.success, router])

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0]
  const unreadCount = threads.reduce((count, thread) => count + thread.unreadCount, 0)
  const latestTeam = threads[0]?.classroom ?? "No threads yet"
  const latestAnnouncement = announcements[0] ?? null

  const composerTargets = useMemo(() => {
    const labels = Array.from(new Set(threads.map((thread) => thread.classroom)))

    if (!labels.includes(BILLING_THREAD_LABEL)) {
      labels.push(BILLING_THREAD_LABEL)
    }

    return labels.length
      ? labels.map((label) => ({
          label,
          value: label,
        }))
      : [
          { label: "Classroom", value: "Classroom" },
          { label: BILLING_THREAD_LABEL, value: BILLING_THREAD_LABEL },
        ]
  }, [threads])

  const threadRail = (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border/45 px-4 py-4 sm:px-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Threads</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Recent classroom and office conversations in one place.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setWorkspaceTab("compose")}>
          <PlusIcon data-icon="inline-start" />
          New
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="divide-y divide-border/45">
          {threads.length ? (
            threads.map((thread) => (
              <ThreadListRow
                key={thread.id}
                thread={thread}
                isActive={thread.id === selectedThread?.id}
                onSelect={() => {
                  setSelectedThreadId(thread.id)

                  if (isMobile) {
                    setMobileInboxTab("conversation")
                  }
                }}
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                title="No messages yet"
                description="New conversations will appear here once the family or school sends the first note."
                icon={MessageSquareIcon}
                action={
                  <Button variant="outline" onClick={() => setWorkspaceTab("compose")}>
                    <PlusIcon data-icon="inline-start" />
                    Start a new thread
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const conversationPane = selectedThread ? (
    <div className="flex h-full min-w-0 flex-col">
      <div className="space-y-3 border-b border-border/45 px-4 py-4 sm:px-5">
        {isMobile ? (
          <Button variant="ghost" size="sm" className="w-fit" onClick={() => setMobileInboxTab("threads")}>
            <ChevronLeftIcon data-icon="inline-start" />
            Threads
          </Button>
        ) : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <p className="editorial-kicker">{selectedThread.classroom}</p>
            <h2 className="text-balance text-[1.55rem] leading-tight text-foreground">
              {selectedThread.subject}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Participants: {selectedThread.participants.join(", ")}
            </p>
          </div>
          <StatusBadge variant={getThreadBadgeVariant(selectedThread.status)}>
            {selectedThread.status}
          </StatusBadge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-background/28">
        <div className="grid gap-3 p-4 sm:p-5">
          {selectedThread.messages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Reply</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Keep replies specific so the classroom or office can answer without follow-up questions.
          </p>
        </div>

        {replyState.error ? (
          <AlertBanner tone="destructive" title="Reply not sent" description={replyState.error} />
        ) : null}
        {replyState.success && replyState.message ? (
          <AlertBanner tone="success" title="Reply sent" description={replyState.message} />
        ) : null}

        <form action={replyAction} className="flex flex-col gap-4">
          <input type="hidden" name="threadId" value={selectedThread.id} />
          <ParentTextareaField
            name="body"
            label="Reply"
            placeholder="Write a calm, specific response to the school team."
            rows={4}
            error={replyState.fieldErrors.body}
          />
          <div className="flex flex-wrap gap-3">
            <ParentSubmitButton idleLabel="Send reply" pendingLabel="Sending..." />
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex h-full min-h-[22rem] items-center justify-center p-5">
      <EmptyState
        title="Choose a conversation"
        description="Select a thread from the list to review the full message history and respond."
        icon={MessageSquareIcon}
        action={
          <Button variant="outline" onClick={() => setWorkspaceTab("compose")}>
            <PlusIcon data-icon="inline-start" />
            Start a new thread
          </Button>
        }
      />
    </div>
  )

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentMessagesPageContent.eyebrow}
        title={parentMessagesPageContent.title}
        description={parentMessagesPageContent.description}
        actions={
          <>
            <Link href={`/parent/child/${childId}`} className={buttonVariants({ variant: "outline" })}>
              Child profile
            </Link>
            <Link href="/parent/billing" className={buttonVariants({ variant: "ghost" })}>
              Billing
            </Link>
          </>
        }
      />

      <Card className="workspace-backdrop gap-0 overflow-hidden p-0">
        <Tabs
          value={workspaceTab}
          onValueChange={(value) => setWorkspaceTab(value as WorkspaceTab)}
          className="gap-0"
        >
          <CardHeader className="gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-1.5">
                <p className="editorial-kicker">Messaging workspace</p>
                <CardTitle className="text-[1.45rem] leading-tight text-foreground">
                  Keep school conversations focused and easy to scan
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Review thread context, respond quickly, or start a new message without juggling
                  multiple panels above the conversation itself.
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary">{threads.length} threads</Badge>
                  <Badge variant={unreadCount ? "warning" : "secondary"}>{unreadCount} unread</Badge>
                  <Badge variant="outline">{announcements.length} updates</Badge>
                  <Badge variant="outline">Latest team: {latestTeam}</Badge>
                </div>
              </div>

              <TabsList variant="line" className="w-full border-b border-border/55 p-0 xl:w-[22rem]">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="updates">School updates</TabsTrigger>
                <TabsTrigger value="compose">New message</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <Separator />

          <TabsContent value="inbox" className="m-0">
            <CardContent className="gap-0 p-0">
              {isMobile ? (
                <Tabs
                  value={mobileInboxTab}
                  onValueChange={(value) => setMobileInboxTab(value as MobileInboxTab)}
                  className="gap-0"
                >
                  <div className="border-b border-border/45 px-5 pt-4">
                    <TabsList variant="line" className="w-full p-0">
                      <TabsTrigger value="threads">Threads</TabsTrigger>
                      <TabsTrigger value="conversation">Conversation</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="threads" className="m-0 min-h-[26rem]">
                    {threadRail}
                  </TabsContent>

                  <TabsContent value="conversation" className="m-0 min-h-[26rem]">
                    {conversationPane}
                  </TabsContent>
                </Tabs>
              ) : (
                <ResizablePanelGroup orientation="horizontal" className="min-h-[44rem]">
                  <ResizablePanel defaultSize={34} minSize={28}>
                    {threadRail}
                  </ResizablePanel>
                  <ResizableHandle withHandle className="bg-border/55" />
                  <ResizablePanel defaultSize={66} minSize={44}>
                    {conversationPane}
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="compose" className="m-0">
            <CardContent className="gap-6 p-5 md:p-6">
              <div className="space-y-1.5">
                <p className="editorial-kicker">New message</p>
                <h2 className="text-lg text-foreground">Start a conversation with the right team</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Use a short subject and send the note to the right classroom or office so the
                  family gets a clear, timely response.
                </p>
              </div>

              {newThreadState.error ? (
                <AlertBanner
                  tone="destructive"
                  title="Message not sent"
                  description={newThreadState.error}
                />
              ) : null}
              {newThreadState.success && newThreadState.message ? (
                <AlertBanner tone="success" title="Message sent" description={newThreadState.message} />
              ) : null}

              <form action={newThreadAction} className="flex max-w-3xl flex-col gap-5">
                <ParentFieldGroup className="xl:grid xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-4">
                  <ParentTextField
                    name="subject"
                    label="Subject"
                    placeholder="Medication refill question"
                    error={newThreadState.fieldErrors.subject}
                  />
                  <ParentSelectField
                    name="classroomLabel"
                    label="Send to"
                    defaultValue={composerTargets[0]?.value}
                    options={composerTargets}
                    error={newThreadState.fieldErrors.classroomLabel}
                  />
                </ParentFieldGroup>

                <ParentFieldGroup>
                  <ParentTextareaField
                    name="body"
                    label="Message"
                    placeholder="Share the update or question the team needs to respond to."
                    rows={6}
                    error={newThreadState.fieldErrors.body}
                  />
                </ParentFieldGroup>

                <div className="flex flex-wrap gap-3">
                  <ParentSubmitButton idleLabel="Send message" pendingLabel="Sending..." />
                </div>
              </form>
            </CardContent>
          </TabsContent>

          <TabsContent value="updates" className="m-0">
            <CardContent className="gap-5 p-5 md:p-6">
              <div className="space-y-1.5">
                <p className="editorial-kicker">School updates</p>
                <h2 className="text-lg text-foreground">Announcements, reminders, and center-wide notes</h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Center notices live alongside direct threads so families can catch up in one communication workspace.
                </p>
              </div>

              {latestAnnouncement ? (
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                  <div className="rounded-[1.25rem] border border-border/60 bg-muted/18 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="editorial-kicker">Latest update</p>
                        <h3 className="text-xl text-foreground">{latestAnnouncement.title}</h3>
                      </div>
                      <Badge variant="secondary">{latestAnnouncement.publishedAt}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{latestAnnouncement.summary}</p>
                    {latestAnnouncement.body ? (
                      <p className="mt-4 text-sm leading-7 text-foreground/86">{latestAnnouncement.body}</p>
                    ) : null}
                  </div>

                  <div className="rounded-[1.25rem] border border-border/60 bg-background/82 p-5">
                    <p className="editorial-kicker">Communication status</p>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{announcements.length} school updates</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Important reminders, event notices, and school-wide updates stay visible here.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{unreadCount} unread direct messages</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Switch back to the inbox tab when a teacher or admin needs a direct response.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3">
                {announcements.map((announcement, index) => (
                  <div key={announcement.id}>
                    <div className="flex flex-col gap-2 rounded-[1rem] border border-border/55 bg-background/86 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{announcement.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {announcement.audience} · {announcement.publishedAt}
                          </p>
                        </div>
                        <Badge variant="outline">Update</Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{announcement.summary}</p>
                    </div>
                    {index < announcements.length - 1 ? <Separator className="mt-3" /> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </PageShell>
  )
}
