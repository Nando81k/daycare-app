import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  HeartHandshake,
  Mail,
  Megaphone,
  Settings,
} from "lucide-react"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ParentOverviewData } from "@/lib/dal/parent-overview"

const QUICK_LINKS = [
  { href: "/parent/billing", label: "Billing", icon: CreditCard },
  { href: "/parent/messages", label: "Messages", icon: Mail },
  { href: "/parent/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/parent/documents", label: "Documents", icon: FileText },
  { href: "/parent/announcements", label: "Announcements", icon: Megaphone },
  { href: "/parent/settings", label: "Settings", icon: Settings },
] as const

export function ParentDashboardPageView({ data }: { data: ParentOverviewData }) {
  const {
    parentName,
    familyName,
    children,
    currentInvoice,
    upcomingInvoice,
    announcements,
    applications,
    unreadMessageCount,
    pendingDocumentCount,
    upcomingPaymentReminder,
  } = data

  const greetingFirstName = parentName.split(" ")[0] || "there"
  const familyDescriptor = /family$/i.test(familyName.trim())
    ? familyName.trim()
    : `the ${familyName.trim()} family`

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow="Family overview"
        title={`Welcome back, ${greetingFirstName}.`}
        description={`Here's what's happening for ${familyDescriptor} today.`}
        actions={
          <Link href="/parent/enrollment" className={buttonVariants({ variant: "outline" })}>
            Continue enrollment
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Balance"
          value={upcomingPaymentReminder.label}
          supporting={upcomingPaymentReminder.value}
          tone={upcomingPaymentReminder.tone === "warning" ? "warning" : "default"}
        />
        <StatTile
          label="Children enrolled"
          value={String(children.length)}
          supporting={
            children.length === 0
              ? "Submit an application to get started"
              : children.map((c) => c.fullName).join(" · ")
          }
        />
        <StatTile
          label="Unread messages"
          value={String(unreadMessageCount)}
          supporting={
            unreadMessageCount > 0
              ? "Replies waiting from the center"
              : "All caught up"
          }
          tone={unreadMessageCount > 0 ? "warning" : "default"}
        />
        <StatTile
          label="Documents pending"
          value={String(pendingDocumentCount)}
          supporting={
            pendingDocumentCount > 0
              ? "Action required to keep enrollment current"
              : "Nothing outstanding"
          }
          tone={pendingDocumentCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <CurrentBillingCard
          currentInvoice={currentInvoice}
          upcomingInvoice={upcomingInvoice}
        />
        <ChildrenCard records={children} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnnouncementsCard announcements={announcements} />
        <ApplicationsCard applications={applications} />
      </div>

      <QuickLinksRow />
    </PageShell>
  )
}

function StatTile({
  label,
  value,
  supporting,
  tone = "default",
}: {
  label: string
  value: string
  supporting?: string
  tone?: "default" | "warning"
}) {
  return (
    <div
      className={`rounded-[1rem] border px-4 py-3.5 ${
        tone === "warning"
          ? "border-amber-200/80 bg-amber-50/60"
          : "border-border/65 bg-background/88"
      }`}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
      {supporting && (
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {supporting}
        </p>
      )}
    </div>
  )
}

function CurrentBillingCard({
  currentInvoice,
  upcomingInvoice,
}: {
  currentInvoice: ParentOverviewData["currentInvoice"]
  upcomingInvoice: ParentOverviewData["upcomingInvoice"]
}) {
  return (
    <SurfaceCard className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current balance
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {currentInvoice ? currentInvoice.label : "You're all caught up"}
          </h2>
        </div>
        {currentInvoice ? (
          <StatusBadge variant={currentInvoice.statusTone}>
            {currentInvoice.status}
          </StatusBadge>
        ) : (
          <StatusBadge variant="success">Nothing due</StatusBadge>
        )}
      </div>

      {currentInvoice ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)]">
          <div className="space-y-3 rounded-2xl border border-primary/15 bg-primary/[0.06] p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Amount
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {currentInvoice.amount}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              Due {currentInvoice.dueDate}
            </div>
            {currentInvoice.description && (
              <p className="text-sm leading-6 text-muted-foreground">
                {currentInvoice.description}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border/65 bg-muted/15 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Pay this invoice
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Securely pay through Stripe Checkout in NGN.
              </p>
            </div>
            {currentInvoice.status === "due" ? (
              <Button asChild className="w-full justify-center">
                <Link href={`/parent/billing/pay/${currentInvoice.id}`}>
                  Pay {currentInvoice.label}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/parent/billing">View billing</Link>
              </Button>
            )}
            {upcomingInvoice && (
              <p className="text-xs text-muted-foreground">
                Next: {upcomingInvoice.label} · {upcomingInvoice.amount} on{" "}
                {upcomingInvoice.dueDate}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/65 bg-background/90 p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            There&apos;s no payment due right now. New invoices will appear here as
            soon as the school posts them.
          </p>
          {upcomingInvoice && (
            <p className="mt-2 text-sm text-foreground">
              Next: <span className="font-medium">{upcomingInvoice.label}</span> ·{" "}
              {upcomingInvoice.amount} on {upcomingInvoice.dueDate}
            </p>
          )}
        </div>
      )}
    </SurfaceCard>
  )
}

function ChildrenCard({
  records,
}: {
  records: ParentOverviewData["children"]
}) {
  const children = records
  return (
    <SurfaceCard className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your children
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            {children.length === 0 ? "No enrolled children yet" : "Today's roster"}
          </h2>
        </div>
        {children.length > 0 && (
          <Link
            href={`/parent/child/${children[0].slug}`}
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            View profiles
          </Link>
        )}
      </div>

      {children.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Start your application
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
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
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/parent/child/${child.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold">
                    {initials(child.firstName, child.lastName)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {child.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[child.classroomName, child.ageLabel]
                        .filter(Boolean)
                        .join(" · ") || "Awaiting classroom assignment"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}

function AnnouncementsCard({
  announcements,
}: {
  announcements: ParentOverviewData["announcements"]
}) {
  return (
    <SurfaceCard className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Recent announcements
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            From the school
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
        <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
          No announcements yet — when the school publishes one, you&apos;ll see
          it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((announcement) => (
            <li
              key={announcement.id}
              className="rounded-xl border border-border/60 bg-background/80 p-4"
            >
              <p className="text-xs text-muted-foreground">
                {announcement.publishedAt}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {announcement.title}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {announcement.summary}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}

function ApplicationsCard({
  applications,
}: {
  applications: ParentOverviewData["applications"]
}) {
  return (
    <SurfaceCard className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Enrollment status
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Applications
          </h2>
        </div>
        <Link
          href={
            applications.length > 0
              ? "/parent/enrollment?reset=1"
              : "/parent/enrollment"
          }
          className="text-sm font-medium text-sky-700 hover:underline"
        >
          {applications.length > 0 ? "Add another child" : "New application"}
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">No applications yet</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Start an enrollment application to begin the review process with the
              center.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {applications.map((application) => (
            <li key={application.id}>
              <Link
                href={`/parent/enrollment/${application.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 p-3 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {application.childName || "Application"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {application.programInterest || "—"} · updated{" "}
                    {application.updatedAt}
                  </p>
                </div>
                <StatusBadge variant={application.statusTone}>
                  {application.statusLabel}
                </StatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  )
}

function QuickLinksRow() {
  return (
    <Card className="border-border/65 bg-muted/15">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Icon className="h-4 w-4" />
            </span>
            {label}
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "•"
}
