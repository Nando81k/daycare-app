"use client"

import { useActionState, useState } from "react"
import type { ComponentType, ReactNode } from "react"
import {
  Baby,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Inbox,
  Receipt,
  Send,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react"

import {
  approveEnrollmentApplication,
  createDocumentRequest,
  declineEnrollmentApplication,
} from "@/app/actions/admin"
import { AdminWaitlistEditor } from "@/components/admin/admin-waitlist-editor"
import {
  formatAdminLabel,
  getPriorityVariant,
  getWaitlistStatusVariant,
} from "@/components/admin/admin-status"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { simpleAdminDashboardPageContent } from "@/data/minimal-portal"
import type {
  AdminActionState,
  SimpleAdminEnrollmentPreview,
  WaitlistEntryPreview,
} from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
}

type AdminWorkspaceTab = "enrollments" | "waitlist"

function includesQuery(values: Array<string | null | undefined>, query: string) {
  if (!query) {
    return true
  }

  const normalizedQuery = query.trim().toLowerCase()
  return values.some((value) => value?.toLowerCase().includes(normalizedQuery))
}

function MetricCard({
  label,
  value,
  icon,
  toneClassName,
}: {
  label: string
  value: string
  icon: ReactNode
  toneClassName: string
}) {
  return (
    <Card className="border-border/65">
      <CardContent className="flex items-start gap-4 p-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${toneClassName}`}>
          {icon}
        </div>
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ApproveButton({
  leadId,
  disabled,
}: {
  leadId: string
  disabled: boolean
}) {
  const [state, formAction] = useActionState(approveEnrollmentApplication, initialState)

  return (
    <form action={formAction} className="flex items-center justify-end">
      <input type="hidden" name="leadId" value={leadId} />
      <Button type="submit" size="sm" disabled={disabled}>
        {state.success ? (
          <>
            <CheckCircle2 className="mr-1.5 size-3.5" />
            Approved
          </>
        ) : (
          <>
            <Check className="mr-1.5 size-3.5" />
            Approve
          </>
        )}
      </Button>
    </form>
  )
}

function DeclineButton({
  leadId,
  disabled,
}: {
  leadId: string
  disabled: boolean
}) {
  const [state, formAction] = useActionState(declineEnrollmentApplication, initialState)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <X className="mr-1.5 size-3.5" />
          {state.success ? "Declined" : "Decline"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form
          action={(formData) => {
            setOpen(false)
            formAction(formData)
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="leadId" value={leadId} />
          <Label htmlFor={`decline-note-${leadId}`}>Reason (optional)</Label>
          <Textarea
            id={`decline-note-${leadId}`}
            name="note"
            placeholder="Add a note for the family…"
            rows={2}
          />
          <Button type="submit" variant="destructive" size="sm">
            <X className="mr-1.5 size-3.5" />
            Confirm decline
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function RequestDocsButton({
  familyId,
}: {
  familyId: string | null
}) {
  const [state, formAction] = useActionState(createDocumentRequest, initialState)
  const [open, setOpen] = useState(false)

  if (!familyId) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileText className="mr-1.5 size-3.5" />
          {state.success ? "Requested" : "Request docs"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form
          action={(formData) => {
            setOpen(false)
            formAction(formData)
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="familyId" value={familyId} />
          <Label htmlFor={`doc-title-${familyId}`}>Document title</Label>
          <Input
            id={`doc-title-${familyId}`}
            name="title"
            placeholder="e.g. Immunization records"
            required
          />
          <Label htmlFor={`doc-note-${familyId}`}>Note (optional)</Label>
          <Textarea
            id={`doc-note-${familyId}`}
            name="note"
            placeholder="Add instructions for the parent…"
            rows={2}
          />
          <Button type="submit" size="sm">
            <Send className="mr-1.5 size-3.5" />
            Send request
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function DetailSection({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </p>
      {children}
    </div>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-0.5">
      <span className="shrink-0 text-sm text-muted-foreground/80">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function EnrollmentDetailPanel({ entry }: { entry: SimpleAdminEnrollmentPreview }) {
  const isDecided =
    entry.enrollmentStatusLabel === "Approved" || entry.enrollmentStatusLabel === "Denied"

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-1 pb-8 pt-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
        <span className="mr-auto text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Quick actions
        </span>
        <ApproveButton leadId={entry.id} disabled={isDecided} />
        <DeclineButton leadId={entry.id} disabled={isDecided} />
        <RequestDocsButton familyId={entry.familyId} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Parent and contact" icon={UserCircle}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Name" value={entry.parentName} />
              <DetailRow label="Family" value={entry.familyName} />
              <DetailRow label="Email" value={entry.email} />
              <DetailRow label="Phone" value={entry.phone} />
            </div>
          </DetailSection>
        </div>

        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Enrollment" icon={ClipboardList}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow
                label="Status"
                value={
                  <StatusBadge variant={entry.enrollmentStatusTone}>
                    {entry.enrollmentStatusLabel}
                  </StatusBadge>
                }
              />
              <DetailRow label="Requested start" value={entry.requestedStart} />
              <DetailRow label="Program" value={entry.programInterest} />
              <DetailRow label="Schedule" value={entry.scheduleNeed ?? "—"} />
              <DetailRow label="Submitted" value={entry.submittedAt} />
            </div>
            {entry.note ? (
              <p className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {entry.note}
              </p>
            ) : null}
          </DetailSection>
        </div>

        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Child on application" icon={Baby}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Name" value={entry.childName} />
              <DetailRow label="Age" value={entry.childAgeLabel} />
            </div>
          </DetailSection>
        </div>

        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Payment" icon={CreditCard}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow
                label="Status"
                value={
                  <StatusBadge variant={entry.paymentStatusTone}>
                    {entry.paymentStatusLabel}
                  </StatusBadge>
                }
              />
              <DetailRow label="Detail" value={entry.paymentDetail} />
            </div>
            {entry.invoices.length > 0 ? (
              <div className="mt-3 flex flex-col gap-1.5">
                {entry.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-2.5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-foreground">{invoice.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.amount} · due {invoice.dueDate}
                      </p>
                    </div>
                    <StatusBadge variant={invoice.statusTone}>{invoice.status}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : null}
          </DetailSection>
        </div>

        {entry.children.length > 0 ? (
          <div className="col-span-full rounded-lg border border-border/50 p-4">
            <DetailSection label="Enrolled children" icon={Users}>
              <div className="grid gap-3 lg:grid-cols-2">
                {entry.children.map((child) => (
                  <Card key={child.id} className="border-border/60 shadow-sm">
                    <CardContent className="flex flex-col gap-2 p-4 text-sm">
                      <p className="font-medium text-foreground">
                        {child.firstName} {child.lastName}
                      </p>
                      <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                        <DetailRow label="Birthday" value={child.birthday} />
                        <DetailRow label="Age" value={child.ageLabel} />
                        <DetailRow label="Teacher" value={child.teacherLabel} />
                        {child.summary ? <DetailRow label="Summary" value={child.summary} /> : null}
                      </div>
                      {child.allergies != null && String(child.allergies) !== "null" ? (
                        <DetailRow label="Allergies" value={String(child.allergies)} />
                      ) : null}
                      {child.medicalNotes != null && String(child.medicalNotes) !== "null" ? (
                        <DetailRow label="Medical notes" value={String(child.medicalNotes)} />
                      ) : null}
                      {child.comfortNotes != null && String(child.comfortNotes) !== "null" ? (
                        <DetailRow label="Comfort notes" value={String(child.comfortNotes)} />
                      ) : null}
                      {child.classroomName !== "Unassigned" ? (
                        <div className="mt-1.5 rounded-md border border-border/50 bg-muted/30 p-2.5">
                          <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Room assignment
                          </p>
                          <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                            <DetailRow label="Room" value={child.classroomName} />
                            <DetailRow label="Age group" value={child.classroomAgeGroup} />
                            <DetailRow label="Capacity" value={child.classroomCapacity} />
                            <DetailRow label="Lead teacher" value={child.classroomLeadTeacher} />
                            <DetailRow label="Ratio" value={child.classroomRatioLabel} />
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DetailSection>
          </div>
        ) : null}

        <div className="col-span-full rounded-lg border border-border/50 p-4">
          <DetailSection label={`Documents (${entry.documents.length})`} icon={FileText}>
            {entry.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {entry.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-foreground">{document.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {document.category}
                        {document.fileName ? ` · ${document.fileName}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={document.statusTone}>{document.status}</StatusBadge>
                      {document.blobUrl ? (
                        <a href={document.blobUrl} target="_blank" rel="noopener noreferrer">
                          <Button type="button" variant="outline" size="sm">
                            <ExternalLink className="mr-1.5 size-3.5" />
                            View
                          </Button>
                        </a>
                      ) : null}
                      {document.blobDownloadUrl ? (
                        <a href={document.blobDownloadUrl} download>
                          <Button type="button" variant="outline" size="sm">
                            <Download className="mr-1.5 size-3.5" />
                            Download
                          </Button>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  )
}

function WorkspaceSearch({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="w-full lg:max-w-sm">
      <Label htmlFor="admin-workspace-search" className="sr-only">
        {label}
      </Label>
      <Input
        id="admin-workspace-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function AdminSimpleEnrollmentPageView({
  enrollments,
  waitlistEntries,
}: {
  enrollments: SimpleAdminEnrollmentPreview[]
  waitlistEntries: WaitlistEntryPreview[]
}) {
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>("enrollments")
  const [selectedEnrollment, setSelectedEnrollment] = useState<SimpleAdminEnrollmentPreview | null>(null)
  const [selectedWaitlistEntryId, setSelectedWaitlistEntryId] = useState<string | null>(null)
  const [enrollmentQuery, setEnrollmentQuery] = useState("")
  const [waitlistQuery, setWaitlistQuery] = useState("")

  const filteredEnrollments = enrollments.filter((entry) =>
    includesQuery(
      [entry.parentName, entry.familyName, entry.childName, entry.email],
      enrollmentQuery
    )
  )

  const filteredWaitlistEntries = waitlistEntries.filter((entry) =>
    includesQuery(
      [entry.familyName, entry.childName, entry.scheduleNeed, entry.note],
      waitlistQuery
    )
  )

  const selectedWaitlistEntry =
    waitlistEntries.find((entry) => entry.id === selectedWaitlistEntryId) ?? null

  const enrollmentMetrics = {
    submitted: enrollments.filter((entry) => entry.enrollmentStatusLabel === "Submitted").length,
    approved: enrollments.filter((entry) => entry.enrollmentStatusLabel === "Approved").length,
    invoiced: enrollments.filter((entry) => entry.invoices.length > 0).length,
    paid: enrollments.filter((entry) => entry.paymentStatusLabel === "Paid").length,
  }

  const waitlistMetrics = {
    offerReady: waitlistEntries.filter((entry) => entry.status === "offer-ready").length,
    highPriority: waitlistEntries.filter((entry) => entry.priority === "high").length,
    partTime: waitlistEntries.filter((entry) => entry.scheduleNeed.toLowerCase() !== "full time").length,
    longRange: waitlistEntries.filter((entry) => entry.status === "long-range").length,
  }

  const searchLabel =
    activeTab === "enrollments" ? "Search enrollments" : "Search waitlist"
  const searchPlaceholder =
    activeTab === "enrollments"
      ? "Search by parent, family, child, or email"
      : "Search by family, child, schedule, or note"
  const searchValue = activeTab === "enrollments" ? enrollmentQuery : waitlistQuery

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={simpleAdminDashboardPageContent.eyebrow}
        title={simpleAdminDashboardPageContent.title}
        description={simpleAdminDashboardPageContent.description}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AdminWorkspaceTab)}
        className="gap-5"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-[1rem] bg-muted/40 p-1.5">
              <TabsTrigger value="enrollments" className="min-w-[12rem] flex-none px-3 py-2">
                Submitted enrollments ({enrollments.length})
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="min-w-[10rem] flex-none px-3 py-2">
                Waitlist review ({waitlistEntries.length})
              </TabsTrigger>
            </TabsList>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {activeTab === "enrollments"
                ? "Review submitted applications, confirm payment state, and handle approval or document requests without leaving the live admin workspace."
                : "Review placement readiness, priority, and ownership so waitlist follow-up stays visible and consistent."}
            </p>
          </div>

          <WorkspaceSearch
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={activeTab === "enrollments" ? setEnrollmentQuery : setWaitlistQuery}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {activeTab === "enrollments" ? (
            <>
              <MetricCard
                label="Submitted"
                value={String(enrollmentMetrics.submitted)}
                icon={<Inbox className="size-5 text-blue-600 dark:text-blue-400" />}
                toneClassName="bg-blue-500/10"
              />
              <MetricCard
                label="Approved"
                value={String(enrollmentMetrics.approved)}
                icon={<CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />}
                toneClassName="bg-green-500/10"
              />
              <MetricCard
                label="Invoiced"
                value={String(enrollmentMetrics.invoiced)}
                icon={<Receipt className="size-5 text-amber-600 dark:text-amber-400" />}
                toneClassName="bg-amber-500/10"
              />
              <MetricCard
                label="Marked paid"
                value={String(enrollmentMetrics.paid)}
                icon={<CreditCard className="size-5 text-emerald-600 dark:text-emerald-400" />}
                toneClassName="bg-emerald-500/10"
              />
            </>
          ) : (
            <>
              <MetricCard
                label="Offer-ready"
                value={String(waitlistMetrics.offerReady)}
                icon={<CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />}
                toneClassName="bg-green-500/10"
              />
              <MetricCard
                label="High priority"
                value={String(waitlistMetrics.highPriority)}
                icon={<Inbox className="size-5 text-amber-600 dark:text-amber-400" />}
                toneClassName="bg-amber-500/10"
              />
              <MetricCard
                label="Part-time"
                value={String(waitlistMetrics.partTime)}
                icon={<Users className="size-5 text-blue-600 dark:text-blue-400" />}
                toneClassName="bg-blue-500/10"
              />
              <MetricCard
                label="Long-range"
                value={String(waitlistMetrics.longRange)}
                icon={<ClipboardList className="size-5 text-slate-600 dark:text-slate-400" />}
                toneClassName="bg-slate-500/10"
              />
            </>
          )}
        </div>

        <TabsContent value="enrollments">
          <Card className="border-border/65">
            <CardHeader className="gap-2 p-5">
              <p className="editorial-kicker">Enrollment review</p>
              <CardTitle className="text-xl">Submitted enrollments</CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                Open a family to review the application, check billing status, request documents, or approve the next step.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {filteredEnrollments.length ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <span className="flex items-center gap-1.5">
                            <User className="size-3.5" />
                            Parent
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1.5">
                            <Baby className="size-3.5" />
                            Child
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1.5">
                            <ClipboardList className="size-3.5" />
                            Enrollment
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="size-3.5" />
                            Payment
                          </span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="flex items-center justify-center gap-1.5">
                            <FileText className="size-3.5" />
                            Docs
                          </span>
                        </TableHead>
                        <TableHead className="text-right">Open</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnrollments.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedEnrollment(entry)}
                        >
                          <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                              <p className="font-medium text-foreground">{entry.parentName}</p>
                              <p className="text-sm text-muted-foreground">{entry.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                              <p className="font-medium text-foreground">{entry.childName}</p>
                              <p className="text-sm text-muted-foreground">{entry.childAgeLabel}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <StatusBadge variant={entry.enrollmentStatusTone}>
                              {entry.enrollmentStatusLabel}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="align-top">
                            <StatusBadge variant={entry.paymentStatusTone}>
                              {entry.paymentStatusLabel}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="align-top text-center text-sm text-muted-foreground">
                            {entry.documents.length}
                          </TableCell>
                          <TableCell className="align-top text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedEnrollment(entry)
                              }}
                            >
                              Review enrollment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title={enrollmentQuery ? "No matching enrollments" : "No enrollments submitted"}
                  description={
                    enrollmentQuery
                      ? "Try a different parent, family, child, or email search."
                      : "New parent enrollment submissions will appear here once families complete the simplified enrollment form."
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist">
          <Card className="border-border/65">
            <CardHeader className="gap-2 p-5">
              <p className="editorial-kicker">Waitlist review</p>
              <CardTitle className="text-xl">Placement timing and follow-up</CardTitle>
              <CardDescription className="text-sm leading-6 text-muted-foreground">
                Keep readiness, priority, and ownership visible so placement decisions do not depend on memory or a separate page.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {filteredWaitlistEntries.length ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-[880px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Family</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Requested start</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead className="text-right">Open</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaitlistEntries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedWaitlistEntryId(entry.id)}
                        >
                          <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                              <p className="font-medium text-foreground">{entry.familyName}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.childName} · {entry.ageLabel}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-foreground">{entry.scheduleNeed}</TableCell>
                          <TableCell className="align-top text-muted-foreground">{entry.requestedStart}</TableCell>
                          <TableCell className="align-top">
                            <StatusBadge variant={getPriorityVariant(entry.priority)}>
                              {formatAdminLabel(entry.priority)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="align-top">
                            <StatusBadge variant={getWaitlistStatusVariant(entry.status)}>
                              {formatAdminLabel(entry.status)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-foreground">{entry.assignedTo}</p>
                              <p className="line-clamp-2 text-sm text-muted-foreground">{entry.note}</p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedWaitlistEntryId(entry.id)
                              }}
                            >
                              Review waitlist
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title={waitlistQuery ? "No matching waitlist entries" : "No waitlist entries yet"}
                  description={
                    waitlistQuery
                      ? "Try a different family, child, schedule, or note search."
                      : "New waitlist requests will appear here once families join the queue."
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet
        open={selectedEnrollment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEnrollment(null)
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-4xl">
          {selectedEnrollment ? (
            <>
              <SheetHeader className="border-b border-border/60 pb-4">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <UserCircle className="size-5 text-muted-foreground" />
                  {selectedEnrollment.parentName}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 text-sm">
                  <span>{selectedEnrollment.familyName} family</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>submitted {selectedEnrollment.submittedAt}</span>
                </SheetDescription>
              </SheetHeader>
              <EnrollmentDetailPanel entry={selectedEnrollment} />
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet
        open={selectedWaitlistEntry !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWaitlistEntryId(null)
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Update waitlist entry</SheetTitle>
            <SheetDescription>
              {selectedWaitlistEntry
                ? `${selectedWaitlistEntry.familyName} · ${selectedWaitlistEntry.childName}`
                : "Edit waitlist details"}
            </SheetDescription>
          </SheetHeader>
          {selectedWaitlistEntry ? (
            <AdminWaitlistEditor
              key={selectedWaitlistEntry.id}
              entry={selectedWaitlistEntry}
              onClear={() => setSelectedWaitlistEntryId(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
