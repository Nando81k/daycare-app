"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import {
  ArrowRight,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClipboardList,
  Inbox,
  ReceiptText,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react"

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
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import type { StatusBadgeVariant } from "@/types/app"
import { cn } from "@/lib/utils"

type SectionKey =
  | "child-day"
  | "attendance"
  | "alerts"
  | "messages"
  | "activity"
  | "compliance"
  | "billing"
  | "calendar"
  | "settings"

type SectionTileBadge = {
  variant: StatusBadgeVariant
  label: string
}

type SectionConfig = {
  key: SectionKey
  label: string
  value: string
  detail: string
  badge: SectionTileBadge
  drawerTitle: string
  drawerDescription: string
  drawerWidth: "xl" | "2xl"
  render: () => ReactNode
}

function getDomain(
  domains: AdminDashboardPreview["domains"],
  key: DashboardDomainKey,
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
  staffProfiles: _staffProfiles = [],
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
  const [openSection, setOpenSection] = useState<SectionKey | null>(null)

  const checkedInCount = attendanceBoard.reduce((sum, room) => sum + room.present, 0)
  const absentCount = attendanceBoard.reduce((sum, room) => sum + room.absent, 0)
  const unreadMessages = messageThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  const openThreads = messageThreads.filter((thread) => thread.status === "open").length
  const overdueBalances = balances.filter((balance) => balance.status === "overdue")
  const dueSoonBalances = balances.filter((balance) => balance.status === "due")
  const requiredDocuments = documents.filter((document) => document.status === "required")
  const expiringDocuments = documents.filter((document) => document.status === "expired")
  const submittedDocuments = documents.filter((doc) => doc.status === "submitted")
  const reportCoverage = familyHub.flatMap((family) => family.childRecords)
  const missingDailyUpdates = reportCoverage.filter((child) => !child.latestDailyReport?.isToday)
  const liveDailyUpdates = reportCoverage.filter((child) => child.latestDailyReport?.isToday)
  const nextWaitlist = waitlistEntries[0] ?? null
  const latestThread = messageThreads[0] ?? null
  const expectedToday = attendanceBoard.reduce((sum, room) => sum + room.expected, 0)

  const childDayDomain = getDomain(dashboard.domains, "child-day")
  const documentsDomain = getDomain(dashboard.domains, "documents")
  const billingDomain = getDomain(dashboard.domains, "billing")
  const calendarDomain = getDomain(dashboard.domains, "calendar")
  const settingsDomain = getDomain(dashboard.domains, "settings")

  const applicationsWaiting = enrollmentLeads.filter(
    (lead) => lead.stage === "application-sent",
  )

  const alertCount =
    overdueBalances.length + requiredDocuments.length + (latestThread ? 0 : 0)
  const complianceCount = requiredDocuments.length + expiringDocuments.length

  const sections: SectionConfig[] = [
    {
      key: "child-day",
      label: "Child-day updates",
      value: `${liveDailyUpdates.length}/${reportCoverage.length || 0}`,
      detail: `Daily reports live for parents · ${missingDailyUpdates.length} still pending`,
      badge: {
        variant: missingDailyUpdates.length === 0 ? "success" : "warning",
        label: missingDailyUpdates.length === 0 ? "Current" : "Catching up",
      },
      drawerTitle: "Child-day updates",
      drawerDescription:
        "Daily report coverage and the children still waiting on a parent-facing update today.",
      drawerWidth: "2xl",
      render: () => (
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
      ),
    },
    {
      key: "attendance",
      label: "Today's attendance",
      value: `${checkedInCount}/${expectedToday}`,
      detail:
        absentCount > 0
          ? `${absentCount} absent · ${attendanceBoard.length} classrooms tracked`
          : `${attendanceBoard.length} classroom${attendanceBoard.length === 1 ? "" : "s"} on track`,
      badge: {
        variant: absentCount > 0 ? "warning" : "success",
        label: absentCount > 0 ? "Review" : "On track",
      },
      drawerTitle: "Today's attendance",
      drawerDescription:
        "Who is here, who is absent, and where ratios may tighten — by classroom.",
      drawerWidth: "xl",
      render: () => (
        <div className="grid gap-3">
          {attendanceBoard.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
              No attendance has been marked today yet.
            </p>
          ) : (
            attendanceBoard.map((room, index) => (
              <div key={room.classroom}>
                <DashboardInfoRow
                  label={room.classroom}
                  value={`${room.present}/${room.expected} present`}
                  supporting={`${room.absent} absent · ${room.late} late · ${room.note}`}
                  action={
                    <StatusBadge
                      variant={room.present === room.expected ? "success" : "warning"}
                    >
                      {room.present === room.expected ? "On track" : "Review"}
                    </StatusBadge>
                  }
                />
                {index < attendanceBoard.length - 1 ? <Separator /> : null}
              </div>
            ))
          )}
          <DashboardInfoRow
            label="Open the full roster"
            value="Edit attendance or browse history"
            supporting="The dedicated attendance page has the date picker, per-child history strip, and 30-day calendar."
            action={<DashboardActionButton href="/admin/attendance" label="Open attendance" />}
          />
        </div>
      ),
    },
    {
      key: "alerts",
      label: "Alerts needing action",
      value: String(alertCount),
      detail: `${overdueBalances.length} overdue · ${requiredDocuments.length} forms · ${unreadMessages} unread`,
      badge: {
        variant: alertCount > 0 ? "warning" : "success",
        label: alertCount > 0 ? "Action needed" : "Clear",
      },
      drawerTitle: "Alerts needing action",
      drawerDescription:
        "Overdue balances, missing forms, and unresolved communication that shouldn't roll into tomorrow.",
      drawerWidth: "xl",
      render: () => (
        <div className="grid gap-3">
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
        </div>
      ),
    },
    {
      key: "messages",
      label: "Recent messages",
      value: `${openThreads}`,
      detail:
        unreadMessages > 0
          ? `${unreadMessages} unread item${unreadMessages === 1 ? "" : "s"} · ${openThreads} open thread${openThreads === 1 ? "" : "s"}`
          : "Family inbox is caught up.",
      badge: {
        variant: unreadMessages > 0 ? "info" : "secondary",
        label: unreadMessages > 0 ? "Active" : "Quiet",
      },
      drawerTitle: "Recent messages and broadcasts",
      drawerDescription:
        "Communication load across families and classrooms — replying to one family vs. preparing a center-wide update.",
      drawerWidth: "xl",
      render: () => (
        <div className="grid gap-3">
          {messageThreads.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
              No active threads right now.
            </p>
          ) : (
            messageThreads.slice(0, 5).map((thread, index) => (
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
                {index < Math.min(messageThreads.length, 5) - 1 ? <Separator /> : null}
              </div>
            ))
          )}
          <DashboardInfoRow
            label="Open the full inbox"
            value="Communications hub"
            supporting="Inbox + announcement drafts in one workspace."
            action={<DashboardActionButton href="/admin/communications" label="Open inbox" />}
          />
        </div>
      ),
    },
    {
      key: "activity",
      label: "Center activity",
      value: `${classrooms.length}`,
      detail: nextWaitlist
        ? `${dueSoonBalances.length} due soon · waitlist next: ${nextWaitlist.familyName}`
        : `${dueSoonBalances.length} balances due soon · waitlist clear`,
      badge: {
        variant: nextWaitlist ? "info" : "secondary",
        label: nextWaitlist ? "Waitlist active" : "Steady",
      },
      drawerTitle: "Center activity",
      drawerDescription:
        "Classrooms, capacity, and growth signals — close enough together to support real decisions.",
      drawerWidth: "2xl",
      render: () => (
        <div className="grid gap-3">
          <DashboardInfoRow
            label="Classroom occupancy"
            value={
              classrooms[0]
                ? `${classrooms[0].name} · ${classrooms[0].enrolled}/${classrooms[0].capacity}`
                : "No classrooms loaded"
            }
            supporting={classrooms[0]?.note ?? "Room-level capacity and ratio notes will appear here."}
            action={<DashboardActionButton href="/admin/classrooms" label="Open classrooms" />}
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
          <DashboardInfoRow
            label="Applications awaiting decision"
            value={`${applicationsWaiting.length} family application${applicationsWaiting.length === 1 ? "" : "s"}`}
            supporting={
              applicationsWaiting[0]
                ? `${applicationsWaiting[0].familyName} · ${applicationsWaiting[0].programInterest}`
                : "No applications are awaiting your decision."
            }
            action={<DashboardActionButton href="/admin/enrollment" label="Review enrollment" />}
          />
        </div>
      ),
    },
    {
      key: "compliance",
      label: "Compliance",
      value: String(complianceCount),
      detail: `${requiredDocuments.length} required · ${expiringDocuments.length} expired · ${submittedDocuments.length} awaiting review`,
      badge: {
        variant: complianceCount > 0 ? "warning" : "success",
        label: complianceCount > 0 ? "Action needed" : "Current",
      },
      drawerTitle: "Compliance",
      drawerDescription:
        "Required forms, expirations, and submissions in the review queue.",
      drawerWidth: "xl",
      render: () =>
        documentsDomain ? (
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
        ) : (
          <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No compliance summary configured.
          </p>
        ),
    },
    {
      key: "billing",
      label: "Billing",
      value: `${overdueBalances.length}`,
      detail: `${overdueBalances.length} overdue · ${dueSoonBalances.length} due soon`,
      badge: {
        variant: overdueBalances.length > 0 ? "destructive" : "success",
        label: overdueBalances.length > 0 ? "Attention" : "Current",
      },
      drawerTitle: "Billing",
      drawerDescription:
        "Collections language should match what the family sees in their portal.",
      drawerWidth: "xl",
      render: () =>
        billingDomain ? (
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
        ) : (
          <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No billing summary configured.
          </p>
        ),
    },
    {
      key: "calendar",
      label: "Calendar",
      value: "Live",
      detail: "Closures, family events, and billing reminders.",
      badge: { variant: "info", label: "Published" },
      drawerTitle: "Calendar",
      drawerDescription:
        "Closures, events, and billing reminders should feel like one calendar from the family side.",
      drawerWidth: "xl",
      render: () =>
        calendarDomain ? (
          <DashboardDomainCard summary={calendarDomain} tone="admin">
            <DashboardInfoRow
              label="Publishing note"
              value="Parent-facing dates go live immediately"
              supporting="Closures, events, and billing reminders should feel like one calendar from the family side."
              action={<DashboardActionButton href="/admin/calendar" label="Open calendar" />}
            />
          </DashboardDomainCard>
        ) : (
          <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No calendar summary configured.
          </p>
        ),
    },
    {
      key: "settings",
      label: "Policy & settings",
      value: "Connected",
      detail: settingsDomain?.recentLabel ?? "Notification rules and parent-facing policy text.",
      badge: { variant: "secondary", label: "Configured" },
      drawerTitle: "Policy and settings",
      drawerDescription:
        "Notification rules and parent-facing policy text should stay connected to the actual product experience.",
      drawerWidth: "xl",
      render: () =>
        settingsDomain ? (
          <DashboardDomainCard summary={settingsDomain} tone="admin">
            <DashboardInfoRow
              label="School policy"
              value={settingsDomain.recentLabel}
              supporting="Notification rules and parent-facing policy text should stay connected to the actual product experience."
              action={<DashboardActionButton href="/admin/settings" label="Open settings" />}
            />
          </DashboardDomainCard>
        ) : (
          <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
            No settings summary configured.
          </p>
        ),
    },
  ]

  const activeSection = sections.find((s) => s.key === openSection) ?? null

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

        <Card className="mt-3 border-border/65">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  attendanceBoard.length === 0
                    ? "bg-muted/60 text-muted-foreground"
                    : absentCount > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700",
                )}
              >
                <UsersIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Today&apos;s attendance
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {attendanceBoard.length === 0
                    ? "No attendance has been marked today yet."
                    : `${checkedInCount} of ${expectedToday} children checked in${
                        absentCount > 0 ? ` · ${absentCount} absent` : ""
                      }`}
                </p>
              </div>
            </div>
            {attendanceBoard.length > 0 ? (
              <ul className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                {attendanceBoard.map((room) => (
                  <li
                    key={room.classroom}
                    className="rounded-full border border-border/60 bg-background/80 px-3 py-1"
                  >
                    <span className="font-medium text-foreground">{room.classroom}</span>{" "}
                    <span className="text-muted-foreground">
                      {room.present}/{room.expected}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              href="/admin/attendance"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                attendanceBoard.length === 0 ? "ml-auto" : "",
              )}
            >
              {attendanceBoard.length === 0 ? "Mark attendance" : "Open attendance"}
            </Link>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Center overview" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="editorial-kicker">Center overview</p>
            <h2 className="font-heading text-xl tracking-tight text-foreground">
              Pick a section to dig in
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Each tile shows the headline. Click to open the detail workspace.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            Updated live from this page&apos;s data
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map((section) => (
            <SectionTile
              key={section.key}
              section={section}
              onSelect={() => setOpenSection(section.key)}
            />
          ))}
        </div>
      </section>

      <Sheet
        open={activeSection !== null}
        onOpenChange={(open) => {
          if (!open) setOpenSection(null)
        }}
      >
        <SheetContent
          side="right"
          className={cn(
            "flex w-full flex-col gap-0 p-0",
            activeSection?.drawerWidth === "2xl"
              ? "sm:max-w-2xl"
              : "sm:max-w-xl",
          )}
        >
          {activeSection && (
            <>
              <SheetHeader className="gap-1 border-b border-border/60 bg-muted/20 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Section detail
                </p>
                <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {activeSection.drawerTitle}
                </SheetTitle>
                <SheetDescription>{activeSection.drawerDescription}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {activeSection.render()}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}

function SectionTile({
  section,
  onSelect,
}: {
  section: SectionConfig
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open ${section.label} detail`}
      className="group flex flex-col gap-3 rounded-md border border-border/65 bg-card px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--color-primary)_40%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {section.label}
        </p>
        <StatusBadge variant={section.badge.variant}>{section.badge.label}</StatusBadge>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            {section.value}
          </p>
          <p className="text-sm leading-5 text-muted-foreground">{section.detail}</p>
        </div>
        <ChevronRightIcon className="mb-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </button>
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
            : "border-border/65",
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
                : "bg-emerald-50 text-emerald-700",
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
          <p className="line-clamp-1 text-sm font-medium text-foreground">{topItem}</p>
          {topItemDetail ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{topItemDetail}</p>
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
