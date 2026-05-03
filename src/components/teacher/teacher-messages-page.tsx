"use client"

import { ChevronLeftIcon, MessageSquareIcon, PlusIcon } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  createTeacherThread,
  sendTeacherReply,
} from "@/app/actions/teacher-messages"
import { PersonAvatar } from "@/components/parent/person-avatar"
import { getThreadBadgeVariant } from "@/components/parent/parent-status"
import { AlertBanner } from "@/components/shared/alert-banner"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import { initialMutationState } from "@/lib/action-state"
import { cn } from "@/lib/utils"
import type {
  ParentMessagePreview,
  TeacherFamilyOption,
  TeacherMessageThreadPreview,
} from "@/types/app"

type WorkspaceTab = "inbox" | "compose"
type MobileInboxTab = "threads" | "conversation"

function ThreadListRow({
  thread,
  isActive,
  onSelect,
}: {
  thread: TeacherMessageThreadPreview
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full border-l-2 px-4 py-3.5 text-left transition-colors sm:px-5",
        isActive
          ? "border-primary bg-accent/30"
          : "border-transparent hover:bg-accent/16"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {thread.familyName}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {thread.subject}
          </p>
        </div>
        {thread.unreadCount ? (
          <Badge variant="warning">{thread.unreadCount} unread</Badge>
        ) : (
          <StatusBadge variant={getThreadBadgeVariant(thread.status)}>
            {thread.status}
          </StatusBadge>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {thread.preview}
      </p>
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
}: ParentMessagePreview) {
  const isStaff = role === "staff" || role === "director"

  return (
    <div className={cn("flex gap-3", isStaff && "justify-end")}>
      {!isStaff ? <PersonAvatar name={sender} size="sm" tone="muted" /> : null}
      <div
        className={cn(
          "max-w-[42rem] rounded-[1.15rem] px-4 py-3.5",
          isStaff
            ? "bg-secondary text-secondary-foreground"
            : "bg-background/86 text-foreground"
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{sender}</p>
          <p className="text-xs uppercase tracking-[0.14em] opacity-70">
            {sentAt}
          </p>
        </div>
        <p className="mt-2 text-sm leading-7 opacity-90">{body}</p>
      </div>
      {isStaff ? <PersonAvatar name={sender} size="sm" tone="accent" /> : null}
    </div>
  )
}

export function TeacherMessagesPageView({
  classroomName,
  threads: initialThreads,
  families,
}: {
  classroomName: string | null
  threads: TeacherMessageThreadPreview[]
  families: TeacherFamilyOption[]
}) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [threads, setThreads] = useState(initialThreads)
  const [selectedThreadId, setSelectedThreadId] = useState(
    initialThreads[0]?.id ?? ""
  )
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("inbox")
  const [mobileInboxTab, setMobileInboxTab] = useState<MobileInboxTab>("threads")
  const [replyState, replyAction] = useActionState(
    sendTeacherReply,
    initialMutationState
  )
  const [newThreadState, newThreadAction] = useActionState(
    createTeacherThread,
    initialMutationState
  )

  useEffect(() => {
    setThreads(initialThreads)
  }, [initialThreads])

  useEffect(() => {
    if (!threads.find((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(threads[0]?.id ?? "")
    }
  }, [selectedThreadId, threads])

  useEffect(() => {
    if (!replyState.success) return
    router.refresh()
  }, [replyState.success, router])

  useEffect(() => {
    if (!newThreadState.success) return
    setWorkspaceTab("inbox")
    router.refresh()
  }, [newThreadState.success, router])

  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? threads[0]
  const unreadCount = threads.reduce((c, t) => c + t.unreadCount, 0)

  if (!classroomName) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <EmptyState
          title="No classroom assigned"
          description="Ask the director to add you to a classroom from the Staff page so families can reach you here."
          icon={MessageSquareIcon}
        />
      </PageShell>
    )
  }

  const threadRail = (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border/45 px-4 py-4 sm:px-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Threads</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Conversations with families in {classroomName}.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWorkspaceTab("compose")}
        >
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
                  if (isMobile) setMobileInboxTab("conversation")
                }}
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                title="No conversations yet"
                description="Start a thread with a family from your classroom roster."
                icon={MessageSquareIcon}
                action={
                  <Button
                    variant="outline"
                    onClick={() => setWorkspaceTab("compose")}
                  >
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
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => setMobileInboxTab("threads")}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Threads
          </Button>
        ) : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <p className="editorial-kicker">{selectedThread.familyName}</p>
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
            Keep replies specific so the family has clear context.
          </p>
        </div>

        {replyState.error ? (
          <AlertBanner
            tone="destructive"
            title="Reply not sent"
            description={replyState.error}
          />
        ) : null}
        {replyState.success && replyState.message ? (
          <AlertBanner
            tone="success"
            title="Reply sent"
            description={replyState.message}
          />
        ) : null}

        <form action={replyAction} className="flex flex-col gap-4">
          <input type="hidden" name="threadId" value={selectedThread.id} />
          <div className="space-y-1.5">
            <Label htmlFor="teacher-reply-body" className="text-xs">
              Reply
            </Label>
            <Textarea
              id="teacher-reply-body"
              name="body"
              rows={4}
              placeholder="Write a calm, specific update for the family."
            />
            {replyState.fieldErrors?.body ? (
              <p className="text-xs text-red-700">
                {replyState.fieldErrors.body}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Send reply</Button>
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Today · {classroomName}
        </p>
        <h1 className="mt-1 text-3xl tracking-tight">Family messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Two-way chat with families whose children are in your classroom.
        </p>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
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
                  Direct conversations with classroom families
                </CardTitle>
                <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Reply to questions, share quick updates, or start a new
                  thread without leaving the teacher portal.
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary">{threads.length} threads</Badge>
                  <Badge variant={unreadCount ? "warning" : "secondary"}>
                    {unreadCount} unread
                  </Badge>
                  <Badge variant="outline">{families.length} families</Badge>
                </div>
              </div>

              <TabsList
                variant="line"
                className="w-full border-b border-border/55 p-0 xl:w-[18rem]"
              >
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="compose">New thread</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <Separator />

          <TabsContent value="inbox" className="m-0">
            <CardContent className="gap-0 p-0">
              {isMobile ? (
                <Tabs
                  value={mobileInboxTab}
                  onValueChange={(value) =>
                    setMobileInboxTab(value as MobileInboxTab)
                  }
                  className="gap-0"
                >
                  <div className="border-b border-border/45 px-5 pt-4">
                    <TabsList variant="line" className="w-full p-0">
                      <TabsTrigger value="threads">Threads</TabsTrigger>
                      <TabsTrigger value="conversation">
                        Conversation
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent
                    value="threads"
                    className="m-0 min-h-[26rem]"
                  >
                    {threadRail}
                  </TabsContent>
                  <TabsContent
                    value="conversation"
                    className="m-0 min-h-[26rem]"
                  >
                    {conversationPane}
                  </TabsContent>
                </Tabs>
              ) : (
                <ResizablePanelGroup
                  orientation="horizontal"
                  className="min-h-[44rem]"
                >
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
                <p className="editorial-kicker">New thread</p>
                <h2 className="text-lg text-foreground">
                  Start a conversation with a family
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Pick a family from your classroom roster, give the thread a
                  short subject, and post the first update.
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
                <AlertBanner
                  tone="success"
                  title="Message sent"
                  description={newThreadState.message}
                />
              ) : null}

              {families.length === 0 ? (
                <EmptyState
                  title="No families in this classroom yet"
                  description="Once a child is enrolled in your classroom, the family will appear here as a messaging option."
                  icon={MessageSquareIcon}
                />
              ) : (
                <form
                  action={newThreadAction}
                  className="flex max-w-3xl flex-col gap-5"
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher-new-subject" className="text-xs">
                        Subject
                      </Label>
                      <Input
                        id="teacher-new-subject"
                        name="subject"
                        placeholder="A scrape at recess"
                      />
                      {newThreadState.fieldErrors?.subject ? (
                        <p className="text-xs text-red-700">
                          {newThreadState.fieldErrors.subject}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher-new-family" className="text-xs">
                        Family
                      </Label>
                      <Select name="familyId" defaultValue={families[0]?.id}>
                        <SelectTrigger id="teacher-new-family">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {families.map((family) => (
                            <SelectItem key={family.id} value={family.id}>
                              {family.familyName}
                              {family.children.length > 0
                                ? ` · ${family.children
                                    .map((c) => c.fullName.split(" ")[0])
                                    .join(", ")}`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newThreadState.fieldErrors?.familyId ? (
                        <p className="text-xs text-red-700">
                          {newThreadState.fieldErrors.familyId}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher-new-body" className="text-xs">
                      Message
                    </Label>
                    <Textarea
                      id="teacher-new-body"
                      name="body"
                      rows={6}
                      placeholder="Share the update or question the family needs to know about."
                    />
                    {newThreadState.fieldErrors?.body ? (
                      <p className="text-xs text-red-700">
                        {newThreadState.fieldErrors.body}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit">Send message</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </PageShell>
  )
}
