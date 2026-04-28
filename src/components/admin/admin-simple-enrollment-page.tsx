"use client"

import { useActionState, useState } from "react"
import type { ReactNode } from "react"
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
import {
  DrawerActionBar,
  DrawerBody,
  DrawerEmpty,
  DrawerField,
  DrawerFieldGrid,
  DrawerSection,
  DrawerSummary,
} from "@/components/admin/admin-detail-drawer"
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

function EnrollmentDetailPanel({ entry }: { entry: SimpleAdminEnrollmentPreview }) {
  const isDecided =
    entry.enrollmentStatusLabel === "Approved" || entry.enrollmentStatusLabel === "Denied"

  return (
    <DrawerBody>
      <DrawerSummary
        title={entry.parentName}
        subtitle={`${entry.familyName} family`}
        badges={
          <>
            <StatusBadge variant={entry.enrollmentStatusTone}>
              {entry.enrollmentStatusLabel}
            </StatusBadge>
            <StatusBadge variant={entry.paymentStatusTone}>
              {entry.paymentStatusLabel}
            </StatusBadge>
          </>
        }
        meta={
          <>
            <span>Submitted {entry.submittedAt}</span>
            <span>{entry.programInterest}</span>
            <span>Start {entry.requestedStart}</span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DrawerSection title="Parent and contact" icon={UserCircle}>
          <DrawerFieldGrid>
            <DrawerField label="Name" value={entry.parentName} />
            <DrawerField label="Family" value={entry.familyName} />
            <DrawerField label="Email" value={entry.email} />
            <DrawerField label="Phone" value={entry.phone} />
          </DrawerFieldGrid>
        </DrawerSection>

        <DrawerSection title="Enrollment" icon={ClipboardList}>
          <DrawerFieldGrid>
            <DrawerField label="Requested start" value={entry.requestedStart} />
            <DrawerField label="Program" value={entry.programInterest} />
            <DrawerField label="Schedule" value={entry.scheduleNeed ?? "—"} />
            <DrawerField label="Submitted" value={entry.submittedAt} />
          </DrawerFieldGrid>
          {entry.note ? (
            <p className="rounded-md bg-muted/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
              {entry.note}
            </p>
          ) : null}
        </DrawerSection>

        <DrawerSection title="Child on application" icon={Baby}>
          <DrawerFieldGrid>
            <DrawerField label="Name" value={entry.childName} />
            <DrawerField label="Age" value={entry.childAgeLabel} />
          </DrawerFieldGrid>
        </DrawerSection>

        <DrawerSection title="Payment" icon={CreditCard}>
          <DrawerFieldGrid>
            <DrawerField
              label="Status"
              value={
                <StatusBadge variant={entry.paymentStatusTone}>
                  {entry.paymentStatusLabel}
                </StatusBadge>
              }
            />
            <DrawerField label="Detail" value={entry.paymentDetail} />
          </DrawerFieldGrid>
          {entry.invoices.length > 0 ? (
            <div className="flex flex-col gap-2">
              {entry.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{invoice.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.amount} · due {invoice.dueDate}
                    </p>
                  </div>
                  <StatusBadge variant={invoice.statusTone}>{invoice.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : null}
        </DrawerSection>
      </div>

      {entry.children.length > 0 ? (
        <DrawerSection title="Enrolled children" icon={Users}>
          <div className="grid gap-3 lg:grid-cols-2">
            {entry.children.map((child) => (
              <Card key={child.id} className="border-border/60 shadow-none">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {child.firstName} {child.lastName}
                    </p>
                    {child.classroomName !== "Unassigned" ? (
                      <span className="text-xs text-muted-foreground">{child.classroomName}</span>
                    ) : null}
                  </div>
                  <DrawerFieldGrid>
                    <DrawerField label="Birthday" value={child.birthday} />
                    <DrawerField label="Age" value={child.ageLabel} />
                    <DrawerField label="Teacher" value={child.teacherLabel} />
                  </DrawerFieldGrid>
                  {child.summary ? (
                    <DrawerField label="Summary" value={child.summary} span={2} />
                  ) : null}
                  {child.allergies != null && String(child.allergies) !== "null" ? (
                    <DrawerField label="Allergies" value={String(child.allergies)} span={2} />
                  ) : null}
                  {child.medicalNotes != null && String(child.medicalNotes) !== "null" ? (
                    <DrawerField label="Medical notes" value={String(child.medicalNotes)} span={2} />
                  ) : null}
                  {child.comfortNotes != null && String(child.comfortNotes) !== "null" ? (
                    <DrawerField label="Comfort notes" value={String(child.comfortNotes)} span={2} />
                  ) : null}
                  {child.classroomName !== "Unassigned" ? (
                    <div className="rounded-md bg-muted/40 px-3 py-2.5">
                      <p className="mb-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Room assignment
                      </p>
                      <DrawerFieldGrid>
                        <DrawerField label="Age group" value={child.classroomAgeGroup} />
                        <DrawerField label="Capacity" value={child.classroomCapacity} />
                        <DrawerField label="Lead teacher" value={child.classroomLeadTeacher} />
                        <DrawerField label="Ratio" value={child.classroomRatioLabel} />
                      </DrawerFieldGrid>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </DrawerSection>
      ) : null}

      <DrawerSection title={`Documents (${entry.documents.length})`} icon={FileText}>
        {entry.documents.length === 0 ? (
          <DrawerEmpty
            title="No documents uploaded yet"
            description="Documents the family submits during enrollment will appear here."
          />
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {entry.documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{document.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {document.category}
                    {document.fileName ? ` · ${document.fileName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
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
      </DrawerSection>

      <DrawerActionBar>
        <RequestDocsButton familyId={entry.familyId} />
        <DeclineButton leadId={entry.id} disabled={isDecided} />
        <ApproveButton leadId={entry.id} disabled={isDecided} />
      </DrawerActionBar>
    </DrawerBody>
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
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl">
          {selectedEnrollment ? (
            <>
              <SheetHeader className="border-b border-border/60 px-5 py-3">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <UserCircle className="size-4 text-muted-foreground" />
                  Review enrollment
                </SheetTitle>
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
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b border-border/60 px-5 py-3">
            <SheetTitle className="text-base">Update waitlist entry</SheetTitle>
          </SheetHeader>
          {selectedWaitlistEntry ? (
            <DrawerBody>
              <DrawerSummary
                title={selectedWaitlistEntry.familyName}
                subtitle={`${selectedWaitlistEntry.childName} · ${selectedWaitlistEntry.ageLabel}`}
                badges={
                  <>
                    <StatusBadge variant={getPriorityVariant(selectedWaitlistEntry.priority)}>
                      {formatAdminLabel(selectedWaitlistEntry.priority)}
                    </StatusBadge>
                    <StatusBadge variant={getWaitlistStatusVariant(selectedWaitlistEntry.status)}>
                      {formatAdminLabel(selectedWaitlistEntry.status)}
                    </StatusBadge>
                  </>
                }
              />
              <AdminWaitlistEditor
                key={selectedWaitlistEntry.id}
                entry={selectedWaitlistEntry}
                onClear={() => setSelectedWaitlistEntryId(null)}
              />
            </DrawerBody>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
