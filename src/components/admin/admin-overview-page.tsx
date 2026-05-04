import Link from "next/link"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  formatAdminLabel,
  getDocumentVariant,
  getFamilyBalanceVariant,
  getMessageStatusVariant,
  getWaitlistStatusVariant,
} from "@/components/admin/admin-status"
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
  adminDashboardPreview,
  adminOverviewPageContent,
} from "@/data/admin"
import type {
  AdminDashboardPreview,
  AdminMessageThreadPreview,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  DashboardDomainKey,
  DocumentQueuePreview,
  EnrollmentLeadPreview,
  FamilyBalancePreview,
  FamilyHubRecord,
  StaffProfilePreview,
  WaitlistEntryPreview,
} from "@/types/app"
import {
  ArrowRight,
  ClipboardList,
  Inbox,
  ReceiptText,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

function getDomain(
  domains: AdminDashboardPreview["domains"],
  key: DashboardDomainKey
) {
  return domains.find((domain) => domain.key === key)
}

export function AdminOverviewPageView({
  dashboard = adminDashboardPreview,
  attendanceBoard = [],
  balances = [],
  documents = [],
  familyHub = [],
  messageThreads = [],
  classrooms = [],
  waitlistEntries = [],
  staffProfiles = [],
  enrollmentLeads = [],
}: {
  dashboard?: AdminDashboardPreview
  attendanceBoard?: ClassroomAttendancePreview[]
  balances?: FamilyBalancePreview[]
  documents?: DocumentQueuePreview[]
  familyHub?: FamilyHubRecord[]
  messageThreads?: AdminMessageThreadPreview[]
  classrooms?: ClassroomSummaryPreview[]
  waitlistEntries?: WaitlistEntryPreview[]
  staffProfiles?: StaffProfilePreview[]
  enrollmentLeads?: EnrollmentLeadPreview[]
}) {
  const checkedInCount = attendanceBoard.reduce((sum, room) => sum + room.present, 0)
  const absentCount = attendanceBoard.reduce((sum, room) => sum + room.absent, 0)
  const classroomsActive = attendanceBoard.length
  const unreadMessages = messageThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  const openThreads = messageThreads.filter((thread) => thread.status === "open").length
  const overdueBalances = balances.filter((balance) => balance.status === "overdue")
  const dueSoonBalances = balances.filter((balance) => balance.status === "due")
  const requiredDocuments = documents.filter((document) => document.status === "required")
  const expiringDocuments = documents.filter((document) => document.status === "expired")
  const scheduledStaff = staffProfiles.filter((staff) => staff.status === "scheduled").length
  const coverageNeeded = staffProfiles.filter((staff) => staff.status === "coverage-needed").length
  const reportCoverage = familyHub.flatMap((family) => family.childRecords)
  const missingDailyUpdates = reportCoverage.filter((child) => !child.latestDailyReport?.isToday)
  const liveDailyUpdates = reportCoverage.filter((child) => child.latestDailyReport?.isToday)
  const nextWaitlist = waitlistEntries[0] ?? null
  const latestThread = messageThreads[0] ?? null

  const childDayDomain = getDomain(dashboard.domains, "child-day")
  const messagesDomain = getDomain(dashboard.domains, "messages")
  const documentsDomain = getDomain(dashboard.domains, "documents")
  const billingDomain = getDomain(dashboard.domains, "billing")
  const calendarDomain = getDomain(dashboard.domains, "calendar")
  const settingsDomain = getDomain(dashboard.domains, "settings")

  const applicationsWaiting = enrollmentLeads.filter(
    (lead) => lead.stage === "application-sent"
  )
  const submittedDocuments = documents.filter((doc) => doc.status === "submitted")
  const expectedToday = attendanceBoard.reduce(
    (sum, room) => sum + room.expected,
    0
  )

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminOverviewPageContent.eyebrow}
        title={adminOverviewPageContent.title}
        description={adminOverviewPageContent.description}
        actions={
          <>
            <Link href="/admin/communications?tab=broadcasts" className={buttonVariants({ variant: "default" })}>
              Send announcement
            </Link>
            <Link href="/admin/attendance" className={buttonVariants({ variant: "outline" })}>
              Mark attendance
            </Link>
            <Link href="/admin/billing" className={buttonVariants({ variant: "ghost" })}>
              Create invoice
            </Link>
          </>
        }
      />

      <section aria-label="Today's triage">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          <TriageCard
            href="/admin/billing"
            label="Overdue balances"
            count={overdueBalances.length}
            tone={overdueBalances.length > 0 ? "warning" : "ok"}
            icon={ReceiptText}
            detail={
              overdueBalances.length > 0
                ? `${overdueBalances.length} famil${overdueBalances.length === 1 ? "y" : "ies"} past due${dueSoonBalances.length > 0 ? ` · ${dueSoonBalances.length} due soon` : ""}`
                : "No families are past due right now."
            }
            topItem={overdueBalances[0]?.familyName ?? null}
            topItemDetail={overdueBalances[0]?.totalDue ?? null}
            cta="Open billing"
          />
          <TriageCard
            href="/admin/enrollment"
            label="Applications waiting"
            count={applicationsWaiting.length}
            tone={applicationsWaiting.length > 0 ? "info" : "ok"}
            icon={ClipboardList}
            detail={
              applicationsWaiting.length > 0
                ? "Submitted by families · need an admissions decision"
                : "No applications are awaiting your decision."
            }
            topItem={applicationsWaiting[0]?.familyName ?? null}
            topItemDetail={applicationsWaiting[0]?.programInterest ?? null}
            cta="Review applications"
          />
          <TriageCard
            href="/admin/communications"
            label="Unanswered messages"
            count={unreadMessages}
            tone={unreadMessages > 0 ? "info" : "ok"}
            icon={Inbox}
            detail={
              unreadMessages > 0
                ? `${openThreads} open thread${openThreads === 1 ? "" : "s"} from families`
                : "Family inbox is caught up."
            }
            topItem={
              latestThread && latestThread.unreadCount > 0
                ? latestThread.subject
                : null
            }
            topItemDetail={
              latestThread && latestThread.unreadCount > 0
                ? latestThread.familyName
                : null
            }
            cta="Open inbox"
          />
          <TriageCard
            href="/admin/documents"
            label="Documents to review"
            count={submittedDocuments.length}
            tone={submittedDocuments.length > 0 ? "warning" : "ok"}
            icon={ShieldCheck}
            detail={
              submittedDocuments.length > 0
                ? `${requiredDocuments.length} required · ${expiringDocuments.length} expired`
                : "No new submissions to approve."
            }
            topItem={submittedDocuments[0]?.title ?? null}
            topItemDetail={submittedDocuments[0]?.familyName ?? null}
            cta="Open document queue"
          />
        </div>

        {attendanceBoard.length > 0 ? (
          <Card className="mt-3 border-border/65">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    absentCount > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  <UsersIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Today&apos;s attendance
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {checkedInCount} of {expectedToday} children checked in
                    {absentCount > 0 ? ` · ${absentCount} absent` : ""}
                  </p>
                </div>
              </div>
              <ul className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                {attendanceBoard.map((room) => (
                  <li
                    key={room.classroom}
                    className="rounded-full border border-border/60 bg-background/80 px-3 py-1"
                  >
                    <span className="font-medium text-foreground">
                      {room.classroom}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {room.present}/{room.expected}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/attendance"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Open attendance
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <Card className="border-border/65">
        <CardHeader className="gap-2 p-5 md:p-6">
          <p className="editorial-kicker">Center overview</p>
          <CardTitle className="text-[1.45rem] leading-tight text-foreground">
            Mission control for children, families, classrooms, and follow-up
          </CardTitle>
          <CardDescription className="max-w-4xl text-sm leading-6 text-muted-foreground">
            Admins need fast triage, not dashboard noise. Today’s check-ins, balance issues, message load, and compliance gaps surface first.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-5 pt-0 md:p-6 md:pt-0">
          <div className="grid gap-4 xl:grid-cols-6">
            <SummaryTile
              label="Children checked in"
              value={String(checkedInCount)}
              detail="Children currently marked present across active classrooms."
              badge={<StatusBadge variant="success">Live</StatusBadge>}
            />
            <SummaryTile
              label="Absent today"
              value={String(absentCount)}
              detail="Children who still need absence follow-up or attendance review."
              badge={<StatusBadge variant={absentCount ? "warning" : "secondary"}>{absentCount ? "Review" : "Clear"}</StatusBadge>}
            />
            <SummaryTile
              label="Classrooms active"
              value={String(classroomsActive)}
              detail="Rooms with attendance activity today."
              badge={<StatusBadge variant="info">Open</StatusBadge>}
            />
            <SummaryTile
              label="Staff on duty"
              value={String(scheduledStaff)}
              detail={coverageNeeded ? `${coverageNeeded} coverage gap${coverageNeeded === 1 ? "" : "s"} need attention.` : "No coverage warnings are active right now."}
              badge={<StatusBadge variant={coverageNeeded ? "warning" : "success"}>{coverageNeeded ? "Coverage gap" : "Covered"}</StatusBadge>}
            />
            <SummaryTile
              label="Pending messages"
              value={String(openThreads)}
              detail={unreadMessages ? `${unreadMessages} unread item${unreadMessages === 1 ? "" : "s"} still need eyes on them.` : "Family communication is caught up."}
              badge={<StatusBadge variant={openThreads ? "info" : "secondary"}>{openThreads ? "Active" : "Quiet"}</StatusBadge>}
            />
            <SummaryTile
              label="Compliance flags"
              value={String(requiredDocuments.length + expiringDocuments.length)}
              detail={`${requiredDocuments.length} required · ${expiringDocuments.length} expired`}
              badge={<StatusBadge variant={requiredDocuments.length || expiringDocuments.length ? "warning" : "success"}>{requiredDocuments.length || expiringDocuments.length ? "Action needed" : "Current"}</StatusBadge>}
            />
          </div>

          <DashboardDomainCard
            summary={childDayDomain ?? dashboard.domains[0]}
            tone="admin"
            featured
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_0.92fr]">
              <div className="grid gap-3">
                <DashboardInfoRow
                  label="Daily report coverage"
                  value={`${liveDailyUpdates.length}/${reportCoverage.length || 0} children updated`}
                  supporting="Parent trust starts with the child-day feed being current before pickup."
                />
                <DashboardInfoRow
                  label="Children missing updates"
                  value={
                    missingDailyUpdates[0]
                      ? `${missingDailyUpdates[0].name} · ${missingDailyUpdates[0].classroom}`
                      : "All child updates are current"
                  }
                  supporting={
                    missingDailyUpdates[1]
                      ? `${missingDailyUpdates[1].name} is also still waiting on a daily report.`
                      : "Open a family to publish attendance context, meals, rest, photos, and staff notes."
                  }
                />
                <DashboardInfoRow
                  label="Documents tied to children"
                  value={`${requiredDocuments.length} paperwork item${requiredDocuments.length === 1 ? "" : "s"} still due`}
                  supporting="The family-facing child record and the admin follow-up queue should always agree."
                />
              </div>

              <div className="grid gap-3">
                <DashboardInfoRow
                  label="Fastest route"
                  value="Families is the child-day workspace"
                  supporting="Open a family, choose a child, and publish the exact daily update parents see on their dashboard."
                  action={<DashboardActionButton href="/admin/families" label="Open families" />}
                />
                <DashboardInfoRow
                  label="Health flags"
                  value={`${reportCoverage.filter((child) => child.allergies.length > 0).length} child records with allergy notes`}
                  supporting="Children with care-sensitive information should never disappear inside a long admin table."
                />
                <DashboardInfoRow
                  label="Photo updates"
                  value={`${reportCoverage.reduce((sum, child) => sum + child.latestPhotoCount, 0)} photo item${reportCoverage.reduce((sum, child) => sum + child.latestPhotoCount, 0) === 1 ? "" : "s"} shared`}
                  supporting="Photos and highlights should support the family relationship, not live as a disconnected staff task."
                />
              </div>
            </div>
          </DashboardDomainCard>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.14fr)_0.86fr]">
            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Today’s attendance</p>
                <CardTitle className="text-xl">Who is here, who is absent, and where ratios may tighten</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Fast attendance visibility matters more than decorative charts on the first screen.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 pt-0">
                {attendanceBoard.map((room, index) => (
                  <div key={room.classroom}>
                    <DashboardInfoRow
                      label={room.classroom}
                      value={`${room.present}/${room.expected} present`}
                      supporting={`${room.absent} absent · ${room.late} late · ${room.note}`}
                      action={
                        <StatusBadge variant={room.present === room.expected ? "success" : "warning"}>
                          {room.present === room.expected ? "On track" : "Review"}
                        </StatusBadge>
                      }
                    />
                    {index < attendanceBoard.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Alerts needing action</p>
                <CardTitle className="text-xl">The items that should not roll into tomorrow</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Overdue balances, missing forms, and unresolved communication belong in one calm triage panel.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 pt-0">
                <DashboardInfoRow
                  label="Overdue invoices"
                  value={
                    overdueBalances[0]
                      ? `${overdueBalances[0].familyName} · ${overdueBalances[0].totalDue}`
                      : "No overdue balances"
                  }
                  supporting={
                    overdueBalances[0]
                      ? `Due ${overdueBalances[0].dueDate}. The parent portal should already show the same status.`
                      : "Collections is current right now."
                  }
                  action={<DashboardActionButton href="/admin/billing" label="Open billing" />}
                />
                <DashboardInfoRow
                  label="Missing paperwork"
                  value={
                    requiredDocuments[0]
                      ? `${requiredDocuments[0].childName} · ${requiredDocuments[0].title}`
                      : "No required forms missing"
                  }
                  supporting={
                    requiredDocuments[0]
                      ? `${requiredDocuments[0].familyName} · due ${requiredDocuments[0].dueDate}`
                      : "Family compliance is current right now."
                  }
                  action={<DashboardActionButton href="/admin/documents" label="Review forms" />}
                />
                <DashboardInfoRow
                  label="Communication"
                  value={
                    latestThread
                      ? `${latestThread.familyName} · ${latestThread.subject}`
                      : "No active family thread"
                  }
                  supporting={
                    latestThread
                      ? latestThread.preview
                      : "Unread parent messages and urgent updates will surface here."
                  }
                  action={<DashboardActionButton href="/admin/communications" label="Open messages" />}
                />
                <DashboardInfoRow
                  label="Incident and health log"
                  value="No incident reports awaiting review"
                  supporting="When incident and health logging is enabled, this panel is where unresolved acknowledgments should appear."
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Recent messages and broadcasts</p>
                <CardTitle className="text-xl">Communication load across families and classrooms</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Staff should know whether they are replying to one family or preparing a center-wide update.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 pt-0">
                {messageThreads.slice(0, 3).map((thread, index) => (
                  <div key={thread.id}>
                    <DashboardInfoRow
                      label={thread.classroomLabel}
                      value={thread.subject}
                      supporting={`${thread.familyName} · ${thread.lastMessageAt}`}
                      action={
                        <StatusBadge variant={getMessageStatusVariant(thread.status)}>
                          {formatAdminLabel(thread.status)}
                        </StatusBadge>
                      }
                    />
                    {index < Math.min(messageThreads.length, 3) - 1 ? <Separator /> : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/65">
              <CardHeader className="gap-2 p-5">
                <p className="editorial-kicker">Center activity</p>
                <CardTitle className="text-xl">Classrooms, capacity, and growth signals</CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  Classroom occupancy, staffing, and incoming families should sit close enough together to support real decisions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-5 pt-0">
                <DashboardInfoRow
                  label="Classroom occupancy"
                  value={
                    classrooms[0]
                      ? `${classrooms[0].name} · ${classrooms[0].enrolled}/${classrooms[0].capacity}`
                      : "No classrooms loaded"
                  }
                  supporting={classrooms[0]?.note ?? "Room-level capacity and ratio notes will appear here."}
                  action={<DashboardActionButton href="/admin/rooms" label="Open rooms" />}
                />
                <DashboardInfoRow
                  label="Waitlist snapshot"
                  value={
                    nextWaitlist
                      ? `${nextWaitlist.familyName} · ${nextWaitlist.childName}`
                      : "Waitlist is clear"
                  }
                  supporting={
                    nextWaitlist
                      ? `${nextWaitlist.requestedStart} · ${nextWaitlist.scheduleNeed}`
                      : "No waitlist item is waiting on immediate follow-up."
                  }
                  action={
                    nextWaitlist ? (
                      <StatusBadge variant={getWaitlistStatusVariant(nextWaitlist.status)}>
                        {formatAdminLabel(nextWaitlist.status)}
                      </StatusBadge>
                    ) : null
                  }
                />
                <DashboardInfoRow
                  label="Balances due soon"
                  value={`${dueSoonBalances.length} family account${dueSoonBalances.length === 1 ? "" : "s"} due`}
                  supporting="Due-soon balances should be visible before they become overdue."
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {messagesDomain ? (
              <DashboardDomainCard summary={messagesDomain} tone="admin">
                <DashboardInfoRow
                  label="Response status"
                  value={`${openThreads} thread${openThreads === 1 ? "" : "s"} still open`}
                  supporting="Parents should see the same conversation status language on their side."
                />
              </DashboardDomainCard>
            ) : null}

            {documentsDomain ? (
              <DashboardDomainCard summary={documentsDomain} tone="admin">
                <DashboardInfoRow
                  label="Compliance queue"
                  value={`${requiredDocuments.length} required · ${expiringDocuments.length} expired`}
                  supporting="Assign, review, and send back documents without breaking the parent-facing status flow."
                  action={
                    requiredDocuments[0] ? (
                      <StatusBadge variant={getDocumentVariant(requiredDocuments[0].status)}>
                        {formatAdminLabel(requiredDocuments[0].status)}
                      </StatusBadge>
                    ) : null
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {billingDomain ? (
              <DashboardDomainCard summary={billingDomain} tone="admin">
                <DashboardInfoRow
                  label="Collections status"
                  value={`${overdueBalances.length} overdue · ${dueSoonBalances.length} due`}
                  supporting="Billing language should match what the family sees in their portal."
                  action={
                    overdueBalances[0] ? (
                      <StatusBadge variant={getFamilyBalanceVariant(overdueBalances[0].status)}>
                        {formatAdminLabel(overdueBalances[0].status)}
                      </StatusBadge>
                    ) : null
                  }
                />
              </DashboardDomainCard>
            ) : null}

            {calendarDomain ? (
              <DashboardDomainCard summary={calendarDomain} tone="admin">
                <DashboardInfoRow
                  label="Publishing note"
                  value="Parent-facing dates go live immediately"
                  supporting="Closures, events, and billing reminders should feel like one calendar from the family side."
                />
              </DashboardDomainCard>
            ) : null}

            {settingsDomain ? (
              <DashboardDomainCard summary={settingsDomain} tone="admin">
                <DashboardInfoRow
                  label="School policy"
                  value={settingsDomain.recentLabel}
                  supporting="Notification rules and parent-facing policy text should stay connected to the actual product experience."
                />
              </DashboardDomainCard>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

function TriageCard({
  href,
  label,
  count,
  tone,
  icon: Icon,
  detail,
  topItem,
  topItemDetail,
  cta,
}: {
  href: string
  label: string
  count: number
  tone: "warning" | "info" | "ok"
  icon: React.ComponentType<{ className?: string }>
  detail: string
  topItem: string | null
  topItemDetail: string | null
  cta: string
}) {
  const isClear = count === 0
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/30",
        tone === "warning" && !isClear
          ? "border-amber-200/80"
          : tone === "info" && !isClear
            ? "border-sky-200/80"
            : "border-border/65"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            tone === "warning" && !isClear
              ? "bg-amber-50 text-amber-700"
              : tone === "info" && !isClear
                ? "bg-sky-50 text-sky-700"
                : "bg-emerald-50 text-emerald-700"
          )}
        >
          {isClear ? <ShieldCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        <StatusBadge variant={isClear ? "success" : tone === "warning" ? "warning" : "info"}>
          {isClear ? "All clear" : count}
        </StatusBadge>
      </div>

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-6 text-foreground">{detail}</p>
      </div>

      {topItem ? (
        <div className="rounded-xl border border-border/55 bg-background/85 px-3 py-2">
          <p className="line-clamp-1 text-sm font-medium text-foreground">
            {topItem}
          </p>
          {topItemDetail ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {topItemDetail}
            </p>
          ) : null}
        </div>
      ) : null}

      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-foreground/80 group-hover:text-foreground">
        {cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
