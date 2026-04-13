import Link from "next/link"
import { Clock3Icon, DoorOpenIcon, NotebookPenIcon } from "lucide-react"

import { AuthorizedPickupManager } from "@/components/parent/authorized-pickup-manager"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { getAttendanceBadgeVariant } from "@/components/parent/parent-status"
import { PersonAvatar } from "@/components/parent/person-avatar"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { TableSurface } from "@/components/shared/table-surface"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  parentAttendanceHistory,
  parentChildPageContent,
  parentDailyReport,
} from "@/data/parent"
import type {
  ChildProfilePreview,
  DailyReportPreview,
  ParentAttendanceRecordPreview,
  ParentEmergencyContactPreview,
} from "@/types/app"

function ProfileMetaItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1.5">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}

function NoteBlock({
  title,
  items,
  emptyLabel,
}: {
  title: string
  items: string[]
  emptyLabel: string
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {items.length ? (
        <div className="grid gap-2.5">
          {items.map((item) => (
            <p key={item} className="text-sm leading-6 text-muted-foreground">
              {item}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  )
}

function EmergencyContactList({
  contacts,
}: {
  contacts: ParentEmergencyContactPreview[]
}) {
  if (!contacts.length) {
    return (
      <Empty className="items-start justify-start gap-2 rounded-[1rem] border border-dashed border-border/60 bg-background/45 p-4 text-left">
        <EmptyHeader className="max-w-none items-start gap-1">
          <EmptyTitle>No emergency contacts on file</EmptyTitle>
          <EmptyDescription>
            Add emergency contacts in the family record so the school can reach the right adults
            quickly.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="divide-y divide-border/45">
      {contacts.map((contact) => (
        <div
          key={`${contact.name}-${contact.phone}`}
          className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{contact.name}</p>
              <Badge variant={contact.priority === "Primary" ? "default" : "secondary"}>
                {contact.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{contact.relationship}</p>
          </div>
          <p className="text-sm font-medium text-foreground">{contact.phone}</p>
        </div>
      ))}
    </div>
  )
}

export function ParentChildPageView({
  child,
  dailyReport = parentDailyReport,
  attendanceHistory = parentAttendanceHistory,
}: {
  child: ChildProfilePreview
  dailyReport?: DailyReportPreview | null
  attendanceHistory?: ParentAttendanceRecordPreview[]
}) {
  const allergyCount = child.allergies.length
  const noteCount = child.medicalNotes.length + child.comfortNotes.length
  const allergySummary = `${allergyCount} allerg${allergyCount === 1 ? "y" : "ies"} on file`
  const noteSummary = `${noteCount} care note${noteCount === 1 ? "" : "s"} saved`

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentChildPageContent.eyebrow}
        title={child.name}
        description={parentChildPageContent.description}
        actions={
          <Link href="/parent/messages" className={buttonVariants({ variant: "default" })}>
            Message classroom
          </Link>
        }
      />

      <div className="flex flex-col gap-5">
        <Card className="workspace-backdrop gap-0 overflow-hidden p-0">
          <CardHeader className="gap-4 p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <PersonAvatar name={child.name} size="lg" tone="accent" />
                <div className="space-y-2">
                  <p className="editorial-kicker">Profile snapshot</p>
                  <div className="space-y-1.5">
                    <CardTitle className="text-[1.75rem] leading-tight text-foreground">
                      {child.ageLabel}
                    </CardTitle>
                    <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {child.summary}
                    </CardDescription>
                  </div>
                </div>
              </div>

              {dailyReport?.dateLabel ? <Badge variant="secondary">{dailyReport.dateLabel}</Badge> : null}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="gap-6 p-5 md:p-6">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
              <ProfileMetaItem label="Classroom" value={child.classroom} />
              <ProfileMetaItem label="Lead teacher" value={child.teacher} />
              <ProfileMetaItem label="Birthday" value={child.birthday} />
              <ProfileMetaItem label="Attendance" value={child.attendanceNote} />
            </dl>
          </CardContent>
        </Card>

        <Card className="workspace-backdrop gap-0 overflow-hidden p-0">
          <Tabs defaultValue="overview" className="gap-0">
            <CardHeader className="gap-4 p-5 md:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-1.5">
                  <p className="editorial-kicker">Workspace</p>
                  <CardTitle className="text-[1.45rem] leading-tight text-foreground">
                    Switch between today, care, and family access
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    Keep the page focused by viewing one part of the child profile at a time,
                    instead of scrolling through every section in one long stack.
                  </CardDescription>
                </div>
                <TabsList variant="line" className="w-full border-b border-border/55 p-0 xl:w-[40rem]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="family-access">Family Access</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-5 md:p-6">
              <TabsContent value="overview" className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="surface-panel-quiet space-y-1.5 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Report date
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {dailyReport?.dateLabel ?? "No report date"}
                    </p>
                  </div>
                  <div className="surface-panel-quiet space-y-1.5 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Check-in
                    </p>
                    <p className="text-sm font-semibold text-foreground">{child.attendanceNote}</p>
                  </div>
                  <div className="surface-panel-quiet space-y-1.5 px-4 py-3">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Lead teacher
                    </p>
                    <p className="text-sm font-semibold text-foreground">{child.teacher}</p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                  <section className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="editorial-kicker">Overview</p>
                      <h2 className="text-lg text-foreground">Latest classroom summary</h2>
                      <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                        {dailyReport?.summary ?? "No classroom summary is available yet."}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1rem] border border-border/45 bg-background/42 px-4 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-primary">
                      Arrival note
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {dailyReport?.arrivalMood ?? "No arrival note was added for today."}
                    </p>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="care" className="space-y-5">
                <div className="space-y-1.5">
                  <p className="editorial-kicker">Care</p>
                  <h2 className="text-lg text-foreground">Daily reminders for care and comfort</h2>
                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                    Keep health reminders and transition notes together so they are easy to review
                    before a message, pickup change, or classroom check-in.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Allergies</span>
                    {child.allergies.length ? (
                      child.allergies.map((allergy) => (
                        <Badge key={allergy} variant="warning">
                          {allergy}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">No allergies on file</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {allergySummary} · {noteSummary}
                  </p>
                </div>

                <Separator />

                <div className="grid gap-6 2xl:grid-cols-2">
                  <NoteBlock
                    title="Medical notes"
                    items={child.medicalNotes}
                    emptyLabel="No additional medical notes are currently on file."
                  />

                  <NoteBlock
                    title="Comfort and transition"
                    items={child.comfortNotes}
                    emptyLabel="No comfort notes are currently saved for this profile."
                  />
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-5">
                <div className="space-y-1.5">
                  <p className="editorial-kicker">Attendance</p>
                  <h2 className="text-lg text-foreground">Check-in history and daily timing</h2>
                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                    Attendance stays parent-readable by showing check-in and pickup times without
                    turning the page into an admin board.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="gap-3 px-5 py-5">
                    <Clock3Icon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Arrival timing</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Attendance stays parent-readable by showing check-in and pickup without turning the page into an admin board.
                    </p>
                  </Card>
                  <Card className="gap-3 px-5 py-5">
                    <DoorOpenIcon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Pickup history</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      End-of-day timing helps families confirm routine changes and who handled pickup when plans shifted.
                    </p>
                  </Card>
                  <Card className="gap-3 px-5 py-5">
                    <NotebookPenIcon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Context notes</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Short notes keep planned absences and unusual days visible without adding operational clutter.
                    </p>
                  </Card>
                </div>

                <TableSurface
                  title="Attendance history"
                  description={`Recent attendance records for ${child.name}.`}
                  size="compact"
                >
                  <Table className="min-w-full text-left text-sm">
                    <TableHeader className="bg-muted/60 text-muted-foreground [&_tr]:border-border/60">
                      <TableRow>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Date</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Check-in</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Pickup</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Status</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceHistory.map((record) => (
                        <TableRow key={record.dateLabel} className="border-border/50">
                          <TableCell className="px-4 py-3 text-foreground">{record.dateLabel}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.checkIn ?? "\u2014"}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.checkOut ?? "\u2014"}</TableCell>
                          <TableCell className="px-4 py-3">
                            <StatusBadge variant={getAttendanceBadgeVariant(record.status)}>
                              {record.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableSurface>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-5">
                <div className="space-y-1.5">
                  <p className="editorial-kicker">Attendance</p>
                  <h2 className="text-lg text-foreground">Check-in history and daily timing</h2>
                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                    Attendance stays parent-readable by showing check-in and pickup times without
                    turning the page into an admin board.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="gap-3 px-5 py-5">
                    <Clock3Icon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Arrival timing</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Attendance stays parent-readable by showing check-in and pickup without turning the page into an admin board.
                    </p>
                  </Card>
                  <Card className="gap-3 px-5 py-5">
                    <DoorOpenIcon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Pickup history</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      End-of-day timing helps families confirm routine changes and who handled pickup when plans shifted.
                    </p>
                  </Card>
                  <Card className="gap-3 px-5 py-5">
                    <NotebookPenIcon className="size-5 text-primary" />
                    <h3 className="text-xl text-foreground">Context notes</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Short notes keep planned absences and unusual days visible without adding operational clutter.
                    </p>
                  </Card>
                </div>

                <TableSurface
                  title="Attendance history"
                  description={`Recent attendance records for ${child.name}.`}
                  size="compact"
                >
                  <Table className="min-w-full text-left text-sm">
                    <TableHeader className="bg-muted/60 text-muted-foreground [&_tr]:border-border/60">
                      <TableRow>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Date</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Check-in</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Pickup</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Status</TableHead>
                        <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceHistory.map((record) => (
                        <TableRow key={record.dateLabel} className="border-border/50">
                          <TableCell className="px-4 py-3 text-foreground">{record.dateLabel}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.checkIn ?? "\u2014"}</TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.checkOut ?? "\u2014"}</TableCell>
                          <TableCell className="px-4 py-3">
                            <StatusBadge variant={getAttendanceBadgeVariant(record.status)}>
                              {record.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-muted-foreground">{record.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableSurface>
              </TabsContent>

              <TabsContent value="family-access" className="space-y-5">
                <div className="space-y-1.5">
                  <p className="editorial-kicker">Family access</p>
                  <h2 className="text-lg text-foreground">Contacts and pickup permissions</h2>
                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                    Emergency contacts and pickup permissions stay here so the family access plan is
                    easy to review without opening multiple settings screens.
                  </p>
                </div>

                <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                  <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold text-foreground">Emergency contacts</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Primary and backup adults the school can contact in urgent situations.
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {child.emergencyContacts.length} contact
                        {child.emergencyContacts.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <EmergencyContactList contacts={child.emergencyContacts} />
                  </section>

                  <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-sm font-semibold text-foreground">Authorized pickups</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Approved adults who may pick up {child.name.split(" ")[0]} when family plans
                          shift.
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {child.authorizedPickups.length} approved
                      </Badge>
                    </div>

                    <AuthorizedPickupManager childSlug={child.id} pickups={child.authorizedPickups} />
                  </section>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </PageShell>
  )
}
