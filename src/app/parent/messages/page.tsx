import { parentThreads } from "@/data/parent"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParentMessagesPage() {
  const activeThread = parentThreads[0]

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Messages"
        title="Keep communication brief, useful, and easy to scan."
        description="Threaded messages from teachers, the front office, and billing keep parents updated without turning into noise."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {parentThreads.map((thread) => (
              <div
                key={thread.name}
                className="rounded-3xl border border-border/70 bg-background/75 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-border/70 bg-secondary">
                      <AvatarFallback>{thread.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{thread.name}</p>
                      <p className="text-sm text-muted-foreground">{thread.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {thread.unread} new
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {thread.preview}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">
              Conversation with {activeThread.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {activeThread.messages.map((message) => (
              <div
                key={`${message.sender}-${message.time}`}
                className={`rounded-3xl p-4 text-sm leading-6 ${
                  message.own
                    ? "ml-auto max-w-[85%] bg-primary text-primary-foreground"
                    : "max-w-[85%] border border-border/70 bg-background/75 text-muted-foreground"
                }`}
              >
                <p className="font-medium">{message.sender}</p>
                <p className="mt-1">{message.body}</p>
                <p className="mt-2 text-xs opacity-80">{message.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
