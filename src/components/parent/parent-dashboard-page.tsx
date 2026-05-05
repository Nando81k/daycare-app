import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  Mail,
  MailCheck,
  Megaphone,
} from "lucide-react"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { ParentTodayReportCard } from "@/components/parent/parent-today-report-card"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ParentOverviewData } from "@/lib/dal/parent-overview"

export function ParentDashboardPageView({ data }: { data: ParentOverviewData }) {
  const {
    parentName,
    children,
    currentInvoice,
    upcomingInvoice,
    announcements,
    applications,
    unreadMessageCount,
    recentMessageThreads,
  } = data

  const greetingFirstName = parentName.split(" ")[0] || "there"
  const enrollmentCtaHref =
    applications.length > 0
      ? "/parent/enrollment?reset=1"
      : "/parent/enrollment"
  const enrollmentCtaLabel =
    applications.length > 0 ? "Add another child" : "Begin enrollment"

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow="Today"
        title={`Welcome back, ${greetingFirstName}.`}
        description="Here's what's happening today."
        actions={
          <Link
            href={enrollmentCtaHref}
            className={buttonVariants({ variant: "outline" })}
          >
            {enrollmentCtaLabel}
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ParentTodayReportCard records={children} />
        <BalanceCard
          currentInvoice={currentInvoice}
          upcomingInvoice={upcomingInvoice}
        />
        <MessagesCard
          unreadCount={unreadMessageCount}
          threads={recentMessageThreads}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChildrenRosterCard records={children} />
        <NewsCard
          applications={applications}
          announcements={announcements}
        />
      </div>
    </PageShell>
  )
}

function BalanceCard({
  currentInvoice,
  upcomingInvoice,
}: {
  currentInvoice: ParentOverviewData["currentInvoice"]
  upcomingInvoice: ParentOverviewData["upcomingInvoice"]
}) {
  return (
    <SurfaceCard className="flex h-full flex-col gap-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Balance
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          {currentInvoice ? currentInvoice.label : "All caught up"}
        </h2>
      </div>

      {currentInvoice ? (
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-primary/15 bg-primary/6 p-4">
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {currentInvoice.amount}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Due {currentInvoice.dueDate}
            </p>
          </div>

          {currentInvoice.status === "due" ? (
            <Button
              asChild
              className="w-full justify-center rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
            >
              <Link href={`/parent/billing/pay/${currentInvoice.id}`}>
                Pay {currentInvoice.amount}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full justify-center rounded-full">
              <Link href="/parent/billing">View billing</Link>
            </Button>
          )}

          {upcomingInvoice ? (
            <p className="text-xs text-muted-foreground">
              Next: {upcomingInvoice.label} · {upcomingInvoice.amount} on{" "}
              {upcomingInvoice.dueDate}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Nothing is due right now. New invoices will appear here when the
            school posts them.
          </p>
          {upcomingInvoice ? (
            <p className="text-sm text-foreground">
              Next: <span className="font-medium">{upcomingInvoice.label}</span>{" "}
              · {upcomingInvoice.amount} on {upcomingInvoice.dueDate}
            </p>
          ) : null}
          <Link
            href="/parent/billing"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-auto justify-center"
            )}
          >
            View billing
          </Link>
        </div>
      )}
    </SurfaceCard>
  )
}

function MessagesCard({
  unreadCount,
  threads,
}: {
  unreadCount: number
  threads: ParentOverviewData["recentMessageThreads"]
}) {
  return (
    <SurfaceCard className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
            Messages
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "Inbox"}
          </h2>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          {unreadCount > 0 ? (
            <Mail className="h-4 w-4" />
          ) : (
            <MailCheck className="h-4 w-4" />
          )}
        </span>
      </div>

      {threads.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          No conversations yet. Start one with your child&apos;s classroom team
          when you have a question.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link
                href="/parent/messages"
                className="flex flex-col gap-1 rounded-xl border border-border/55 bg-background/85 px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                  <span className="truncate">{thread.subject}</span>
                  {thread.isUnread ? (
                    <span className="ml-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                  ) : null}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {thread.preview}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground/80">
                  {thread.classroom ?? "Office"} · {thread.lastMessageAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/parent/messages"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-auto justify-center"
        )}
      >
        Open inbox
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Link>
    </SurfaceCard>
  )
}

function ChildrenRosterCard({
  records,
}: {
  records: ParentOverviewData["children"]
}) {
  return (
    <SurfaceCard className="space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Your family
        </p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">
          {records.length === 0 ? "No enrolled children yet" : "Children"}
        </h2>
      </div>

      {records.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/15 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              Start your application
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Once approved, your child&apos;s classroom and daily updates will
              show up here.
            </p>
            <Link
              href="/parent/enrollment"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline"
            >
              Begin enrollment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {records.map((child) => (
            <li key={child.id}>
              <Link
                href={`/parent/child/${child.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/55 bg-background/85 px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-sky-700">
                    {child.firstName.slice(0, 1)}
                    {child.lastName.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {child.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {child.classroomName ?? "Classroom unassigned"} ·{" "}
                      {child.ageLabel}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}

function NewsCard({
  applications,
  announcements,
}: {
  applications: ParentOverviewData["applications"]
  announcements: ParentOverviewData["announcements"]
}) {
  const activeApplication = applications.find(
    (a) => a.statusLabel === "Draft" || a.statusLabel === "Submitted"
  )

  if (activeApplication) {
    return (
      <SurfaceCard className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
            Enrollment status
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Application in progress
          </h2>
        </div>
        <Link
          href={`/parent/enrollment/${activeApplication.id}`}
          className="flex items-center justify-between gap-3 rounded-xl border border-border/55 bg-background/85 px-3 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {activeApplication.childName || "Application"}
              </p>
              <p className="text-xs text-muted-foreground">
                {activeApplication.programInterest || "Program TBD"} · updated{" "}
                {activeApplication.updatedAt}
              </p>
            </div>
          </div>
          <StatusBadge variant={activeApplication.statusTone}>
            {activeApplication.statusLabel}
          </StatusBadge>
        </Link>

        {announcements.length > 0 ? (
          <div className="border-t border-border/45 pt-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              From the school
            </p>
            <p className="mt-1.5 text-sm font-medium text-foreground">
              {announcements[0].title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {announcements[0].summary}
            </p>
          </div>
        ) : null}
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
            From the school
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Announcements
          </h2>
        </div>
        <Link
          href="/parent/announcements"
          className="text-sm font-medium text-sky-700 hover:underline"
        >
          View all
        </Link>
      </div>

      {announcements.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border/60 bg-muted/15 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <Megaphone className="h-4 w-4" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            No announcements yet — when the school publishes one, you&apos;ll see
            it here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {announcements.slice(0, 2).map((announcement) => (
            <li
              key={announcement.id}
              className="rounded-xl border border-border/55 bg-background/85 p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {announcement.title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {announcement.summary}
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground/80">
                {announcement.publishedAt}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}
