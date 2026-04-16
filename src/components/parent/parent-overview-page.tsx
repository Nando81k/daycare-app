import Link from "next/link"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { PersonAvatar } from "@/components/parent/person-avatar"
import {
  getDocumentBadgeVariant,
  getEventBadgeVariant,
  getInvoiceBadgeVariant,
  getThreadBadgeVariant,
} from "@/components/parent/parent-status"
import {
  DashboardActionButton,
  DashboardDomainCard,
  DashboardInfoRow,
} from "@/components/shared/dashboard-domain-card"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  parentDashboardPreview,
  parentOverviewPageContent,
} from "@/data/parent"
import type {
  DashboardDomainKey,
  ParentAttendanceRecordPreview,
  ParentDashboardPreview,
  ParentSettingsPreview,
} from "@/types/app"

type ParentOverviewData = ParentDashboardPreview & {
  attendanceHistory?: ParentAttendanceRecordPreview[]
  settings?: ParentSettingsPreview
}

function parseMinutes(duration: string) {
  const match = duration.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

function formatMinutes(minutes: number) {
  if (!minutes) {
    return "No nap logged"
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (!hours) {
    return `${minutes} min`
  }

  if (!remainder) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainder} min`
}

function SummaryTile({
  label,
  value,
  detail,
  badge,
}: {
  label: string
  value: string
  detail: string
  badge?: React.ReactNode
}) {
  return (
    <Card className="gap-0 border-border/65">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          {badge}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">{value}</p>
          <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  href,
  title,
  detail,
}: {
  href: string
  title: string
  detail: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[1rem] border border-border/65 bg-background/86 px-4 py-4 transition-colors hover:bg-accent/25"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </Link>
  )
}

function getDomain(
  domains: ParentDashboardPreview["domains"],
  key: DashboardDomainKey
) {
  return domains.find((domain) => domain.key === key)
}

export function ParentOverviewPageView({
  dashboard = parentDashboardPreview,
}: {
  dashboard?: ParentOverviewData
}) {
  const {
    child,
    dailyReport,
    invoice,
    documents,
    threads,
    upcomingEvents,
    domains,
    attendanceHistory = [],
    settings,
  } = dashboard

  const childHref = `/parent/child/${child.id}`
  const unreadCount = threads.reduce((count, thread) => count + thread.unreadCount, 0)
  const requiredDocuments = documents.filter((document) => document.status === "required")
  const upcomingEvent = upcomingEvents[0] ?? null
  const latestThread = threads[0] ?? null
  const latestAttendance = attendanceHistory[0]
  const restMinutes = dailyReport.rest.reduce(
    (sum, rest) => sum + parseMinutes(rest.duration),
    0
  )
  const latestActivity = dailyReport.activities[0] ?? null
  const latestNote =
    dailyReport.staffNotes[0] ??
    latestActivity?.description ??
    child.attendanceNote
  const photoPreview = dailyReport.photos.slice(0, 2)
  const settingsSummary = settings?.notificationPreferences.filter(
    (preference) => preference.enabled
  ).length

  const childDayDomain = getDomain(domains, "child-day")
  const messageDomain = getDomain(domains, "messages")
  const documentsDomain = getDomain(domains, "documents")
  const billingDomain = getDomain(domains, "billing")
  const calendarDomain = getDomain(domains, "calendar")
  const settingsDomain = getDomain(domains, "settings")

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentOverviewPageContent.eyebrow}
        title={parentOverviewPageContent.title}
        description={parentOverviewPageContent.description}
        actions={
          <>
            <Link href="/parent/messages" className={buttonVariants({ variant: "default" })}>
              Message teacher
            </Link>
            <Link href="/parent/forms" className={buttonVariants({ variant: "outline" })}>
              Complete forms
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] bg-background/82 px-4 py-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Today
          </p>
          <p className="text-lg font-semibold text-foreground">{dailyReport.dateLabel}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {latestAttendance?.status === "present"
              ? `Checked in ${latestAttendance.checkIn ?? "today"}`
              : latestAttendance?.status === "scheduled"
                ? "Scheduled for later today"
                : "Attendance not logged yet"}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] bg-background/82 px-4 py-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Classroom
          </p>
          <p className="text-lg font-semibold text-foreground">{child.classroom}</p>
          <p className="text-sm leading-6 text-muted-foreground">{child.teacher}</p>
        </div>
        <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] bg-background/82 px-4 py-3.5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Pickup
          </p>
          <p className="text-lg font-semibold text-foreground">
            {latestAttendance?.checkOut ? "Checked out" : "Pickup pending"}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {latestAttendance?.checkOut
              ? `Left at ${latestAttendance.checkOut}`
              : "Authorized pickup and end-of-day notes live in the child profile."}
          </p>
        </div>
      </ParentPageHeader>

      <Card className="border-border/65">
        <CardHeader className="flex flex-col gap-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <PersonAvatar name={child.name} size="lg" tone="accent" />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-[1.45rem] leading-tight text-foreground">
                    {child.name}
                  </CardTitle>
                  <StatusBadge variant="secondary">{child.ageLabel}</StatusBadge>
                </div>
                <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {child.summary}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge variant="info">{dailyReport.arrivalMood}</StatusBadge>
              <StatusBadge variant={latestAttendance?.checkOut ? "secondary" : "success"}>
                {latestAttendance?.checkOut ? "Picked up" : "In class"}
              </StatusBadge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-5 pt-0 md:p-6 md:pt-0">
          <div className="grid gap-4 xl:grid-cols-4">
            <SummaryTile
              label="Checked in / out"
              value={
                latestAttendance?.checkOut
                  ? `${latestAttendance.checkIn ?? "Checked in"} to ${latestAttendance.checkOut}`
                  : latestAttendance?.checkIn
                    ? `Checked in ${latestAttendance.checkIn}`
                    : "Attendance pending"
              }
              detail="Attendance status stays visible at the top so you do not need to hunt for it."
              badge={
                <StatusBadge variant={latestAttendance?.checkOut ? "secondary" : "success"}>
                  {latestAttendance?.checkOut ? "Complete" : "Today"}
                </StatusBadge>
              }
            />
            <SummaryTile
              label="Latest classroom update"
              value={latestActivity?.title ?? "Daily summary posted"}
              detail={dailyReport.summary}
              badge={<StatusBadge variant="info">Fresh</StatusBadge>}
            />
            <SummaryTile
              label="Forms due"
              value={
                requiredDocuments.length
                  ? `${requiredDocuments.length} form${requiredDocuments.length === 1 ? "" : "s"}`
                  : "All clear"
              }
              detail={
                requiredDocuments[0]?.title ??
                "There are no required forms waiting on your family right now."
              }
              badge={
                <StatusBadge
                  variant={requiredDocuments.length ? "warning" : "success"}
                >
                  {requiredDocuments.length ? "Action needed" : "Current"}
                </StatusBadge>
              }
            />
            <SummaryTile
              label="Billing status"
              value={`${invoice.amount} · ${invoice.label}`}
              detail={`Due ${invoice.dueDate}`}
              badge={
                <StatusBadge variant={getInvoiceBadgeVariant(invoice.status)}>
                  {invoice.status === "due" ? "Due soon" : invoice.status === "paid" ? "Paid" : "Draft"}
                </StatusBadge>
              }
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
            <DashboardDomainCard
              summary={childDayDomain ?? domains[0]}
              tone="parent"
              featured
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_0.92fr]">
                <div className="grid gap-3">
                  <DashboardInfoRow
                    label="Teacher summary"
                    value={dailyReport.summary}
                    supporting="This is the main classroom update parents should see first."
                  />
                  <DashboardInfoRow
                    label="Meals and snacks"
                    value={`${dailyReport.meals.filter((meal) => meal.status !== "skipped").length}/${dailyReport.meals.length} logged`}
                    supporting={dailyReport.meals
                      .map((meal) => `${meal.label}: ${meal.details}`)
                      .slice(0, 2)
                      .join(" · ")}
                  />
                  <DashboardInfoRow
                    label="Nap status"
                    value={formatMinutes(restMinutes)}
                    supporting={
                      dailyReport.rest[0]?.note ??
                      "No additional nap note was shared today."
                    }
                  />
                </div>

                <div className="grid gap-3">
                  <DashboardInfoRow
                    label="Care updates"
                    value={
                      dailyReport.staffNotes[0] ??
                      "No diaper, bathroom, or extra care note was shared today."
                    }
                    supporting="General care notes surface here whenever the classroom shares them."
                  />
                  <DashboardInfoRow
                    label="Mood or behavior"
                    value={dailyReport.arrivalMood}
                    supporting={latestNote}
                  />
                  <DashboardInfoRow
                    label="Pickup status"
                    value={latestAttendance?.checkOut ? "Picked up" : "Still with the classroom"}
                    supporting={
                      latestAttendance?.checkOut
                        ? `Checked out at ${latestAttendance.checkOut}.`
                        : "Pickup contacts and end-of-day instructions stay one tap away in the child profile."
                    }
                    action={<DashboardActionButton href={childHref} label="Open profile" />}
                  />
                </div>
              </div>
            </DashboardDomainCard>

            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Needs attention</p>
                <CardTitle className="text-xl">What your family should not miss</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Important actions stay calm and visible here instead of getting buried lower on the page.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-5 pt-0">
                <DashboardInfoRow
                  label="Unread messages"
                  value={
                    unreadCount
                      ? `${unreadCount} unread`
                      : "No unread messages"
                  }
                  supporting={
                    latestThread?.preview ??
                    "Teacher and admin replies will surface here as soon as they arrive."
                  }
                  action={<DashboardActionButton href="/parent/messages" label="Open messages" />}
                />
                <DashboardInfoRow
                  label="Billing"
                  value={`${invoice.amount} · due ${invoice.dueDate}`}
                  supporting={invoice.description ?? "Use the billing page for invoices and receipts."}
                  action={<DashboardActionButton href="/parent/billing" label="Open billing" />}
                />
                <DashboardInfoRow
                  label="Missing forms"
                  value={
                    requiredDocuments.length
                      ? requiredDocuments[0].title
                      : "No forms due"
                  }
                  supporting={
                    requiredDocuments.length
                      ? requiredDocuments[0].note
                      : "Completed and approved forms stay in the documents area."
                  }
                  action={<DashboardActionButton href="/parent/forms" label="Open forms" />}
                />
                <DashboardInfoRow
                  label="Upcoming event"
                  value={upcomingEvent?.title ?? "No upcoming event"}
                  supporting={
                    upcomingEvent
                      ? `${upcomingEvent.dateLabel} · ${upcomingEvent.timeLabel}`
                      : "School closures, picture day, and family events show here as they are published."
                  }
                  action={<DashboardActionButton href="/parent/calendar" label="View calendar" />}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.98fr)_1.02fr]">
            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Quick actions</p>
                <CardTitle className="text-xl">Family tasks and updates</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Keep the most common actions one tap away when you are checking the dashboard on your phone.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 pt-0 sm:grid-cols-2 xl:grid-cols-1">
                <QuickActionCard
                  href={childHref}
                  title="Update pickup list"
                  detail="Review or change authorized pickup adults and end-of-day notes."
                />
                <QuickActionCard
                  href="/parent/messages"
                  title="Report absence"
                  detail="Send a quick note to the classroom or office when plans change."
                />
                <QuickActionCard
                  href="/parent/calendar"
                  title="View calendar"
                  detail="See school closures, events, conferences, and billing reminders."
                />
                <QuickActionCard
                  href="/parent/forms"
                  title="Open required forms"
                  detail="Finish paperwork, upload documents, and review school policies."
                />
                <QuickActionCard
                  href={childHref}
                  title="View care plan"
                  detail="Open allergies, medications, emergency contacts, and special care notes."
                />
              </CardContent>
            </Card>

            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Classroom highlights</p>
                <CardTitle className="text-xl">Updates that build confidence</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Daily photos, learning moments, and activity highlights keep the day feeling real, not abstract.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-5 pt-0">
                <div className="grid gap-3 md:grid-cols-2">
                  {photoPreview.length ? (
                    photoPreview.map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-[1rem] border border-border/60 bg-muted/18 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-foreground">{photo.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{photo.caption}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-border/65 px-4 py-4 text-sm leading-6 text-muted-foreground md:col-span-2">
                      No classroom photos have been shared yet today.
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-2">
                  <DashboardInfoRow
                    label="Learning highlight"
                    value={latestActivity?.title ?? "No activity highlight yet"}
                    supporting={latestActivity?.description ?? "New classroom milestones and learning moments will appear here."}
                  />
                  <DashboardInfoRow
                    label="Family settings"
                    value={
                      settingsDomain?.statusLabel ??
                      (settingsSummary ? `${settingsSummary} preferences enabled` : "Settings current")
                    }
                    supporting={
                      settings?.billingContact
                        ? `Billing contact: ${settings.billingContact}`
                        : settingsDomain?.description ?? "Notification choices and contact details stay editable in settings."
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {messageDomain ? (
              <DashboardDomainCard summary={messageDomain} tone="parent">
                <DashboardInfoRow
                  label="Latest thread"
                  value={latestThread?.subject ?? "No recent thread"}
                  supporting={latestThread?.preview ?? "Direct teacher and admin replies will surface here."}
                  action={
                    latestThread ? (
                      <StatusBadge variant={getThreadBadgeVariant(latestThread.status)}>
                        {latestThread.status}
                      </StatusBadge>
                    ) : null
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {documentsDomain ? (
              <DashboardDomainCard summary={documentsDomain} tone="parent">
                <DashboardInfoRow
                  label="Top document"
                  value={requiredDocuments[0]?.title ?? documents[0]?.title ?? "No document request"}
                  supporting={requiredDocuments[0]?.note ?? documents[0]?.note ?? "Required and submitted documents stay organized here."}
                  action={
                    requiredDocuments[0] || documents[0] ? (
                      <StatusBadge
                        variant={getDocumentBadgeVariant(
                          requiredDocuments[0]?.status ?? documents[0].status
                        )}
                      >
                        {requiredDocuments[0]?.status ?? documents[0].status}
                      </StatusBadge>
                    ) : null
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {billingDomain ? (
              <DashboardDomainCard summary={billingDomain} tone="parent">
                <DashboardInfoRow
                  label="Current balance"
                  value={`${invoice.amount} · ${invoice.label}`}
                  supporting={`Due ${invoice.dueDate}. Receipts and payment history stay in the billing workspace.`}
                  action={
                    <StatusBadge variant={getInvoiceBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </StatusBadge>
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {calendarDomain ? (
              <DashboardDomainCard summary={calendarDomain} tone="parent">
                <DashboardInfoRow
                  label="Next date"
                  value={upcomingEvent?.title ?? "No event scheduled"}
                  supporting={
                    upcomingEvent
                      ? `${upcomingEvent.dateLabel} · ${upcomingEvent.description}`
                      : "Closures, picture day, conferences, and family reminders stay visible here."
                  }
                  action={
                    upcomingEvent ? (
                      <StatusBadge variant={getEventBadgeVariant(upcomingEvent.category)}>
                        {upcomingEvent.timeLabel}
                      </StatusBadge>
                    ) : null
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {settingsDomain ? (
              <DashboardDomainCard summary={settingsDomain} tone="parent">
                <DashboardInfoRow
                  label="Account details"
                  value={settings?.phone ?? "Family settings are up to date"}
                  supporting={
                    settings?.billingContact
                      ? `Billing contact: ${settings.billingContact}`
                      : settingsDomain.description
                  }
                />
              </DashboardDomainCard>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
