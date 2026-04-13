"use client"

import { useActionState, useState } from "react"
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
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { simpleAdminDashboardPageContent } from "@/data/minimal-portal"
import type {
  AdminActionState,
  SimpleAdminEnrollmentPreview,
} from "@/types/app"

const initialState: AdminActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
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
        {state.success ? <><CheckCircle2 className="mr-1.5 size-3.5" />Approved</> : <><Check className="mr-1.5 size-3.5" />Approve</>}
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
          <X className="mr-1.5 size-3.5" />{state.success ? "Declined" : "Decline"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form
          action={(fd) => {
            setOpen(false)
            formAction(fd)
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
            <X className="mr-1.5 size-3.5" />Confirm decline
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

  if (!familyId) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <FileText className="mr-1.5 size-3.5" />{state.success ? "Requested" : "Request docs"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <form
          action={(fd) => {
            setOpen(false)
            formAction(fd)
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
            <Send className="mr-1.5 size-3.5" />Send request
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function DetailSection({ label, icon: Icon, children }: { label: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      {children}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-0.5">
      <span className="shrink-0 text-sm text-muted-foreground/80">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function EnrollmentDetailPanel({ entry }: { entry: SimpleAdminEnrollmentPreview }) {
  const isDecided = entry.enrollmentStatusLabel === "Approved" || entry.enrollmentStatusLabel === "Denied"

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-1 pb-8 pt-2">
      {/* Quick actions bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
        <span className="mr-auto text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick actions</span>
        <ApproveButton leadId={entry.id} disabled={isDecided} />
        <DeclineButton leadId={entry.id} disabled={isDecided} />
        <RequestDocsButton familyId={entry.familyId} />
      </div>

      {/* Overview grid — 2 columns on lg */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Parent & Contact */}
        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Parent &amp; contact" icon={UserCircle}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Name" value={entry.parentName} />
              <DetailRow label="Family" value={entry.familyName} />
              <DetailRow label="Email" value={entry.email} />
              <DetailRow label="Phone" value={entry.phone} />
            </div>
          </DetailSection>
        </div>

        {/* Enrollment Info */}
        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Enrollment" icon={ClipboardList}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Status" value={<StatusBadge variant={entry.enrollmentStatusTone}>{entry.enrollmentStatusLabel}</StatusBadge>} />
              <DetailRow label="Requested start" value={entry.requestedStart} />
              <DetailRow label="Program" value={entry.programInterest} />
              <DetailRow label="Schedule" value={entry.scheduleNeed ?? "—"} />
              <DetailRow label="Submitted" value={entry.submittedAt} />
            </div>
            {entry.note && (
              <p className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{entry.note}</p>
            )}
          </DetailSection>
        </div>

        {/* Child on Application */}
        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Child on application" icon={Baby}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Name" value={entry.childName} />
              <DetailRow label="Age" value={entry.childAgeLabel} />
            </div>
          </DetailSection>
        </div>

        {/* Payment */}
        <div className="rounded-lg border border-border/50 p-4">
          <DetailSection label="Payment" icon={CreditCard}>
            <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <DetailRow label="Status" value={<StatusBadge variant={entry.paymentStatusTone}>{entry.paymentStatusLabel}</StatusBadge>} />
              <DetailRow label="Detail" value={entry.paymentDetail} />
            </div>
            {entry.invoices.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                {entry.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-2.5">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-foreground">{inv.label}</p>
                      <p className="text-xs text-muted-foreground">{inv.amount} · due {inv.dueDate}</p>
                    </div>
                    <StatusBadge variant={inv.statusTone}>{inv.status}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </DetailSection>
        </div>

        {/* Enrolled Children — span both columns */}
        {entry.children.length > 0 && (
        <div className="col-span-full rounded-lg border border-border/50 p-4">
          <DetailSection label="Enrolled children" icon={Users}>
            <div className="grid gap-3 lg:grid-cols-2">
              {entry.children.map((child) => (
                <Card key={child.id} className="border-border/60 shadow-sm">
                  <CardContent className="flex flex-col gap-2 p-4 text-sm">
                    <p className="font-medium text-foreground">{child.firstName} {child.lastName}</p>
                    <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                      <DetailRow label="Birthday" value={child.birthday} />
                      <DetailRow label="Age" value={child.ageLabel} />
                      <DetailRow label="Teacher" value={child.teacherLabel} />
                      {child.summary && <DetailRow label="Summary" value={child.summary} />}
                    </div>
                    {child.allergies != null && String(child.allergies) !== "null" && (
                      <DetailRow label="Allergies" value={String(child.allergies)} />
                    )}
                    {child.medicalNotes != null && String(child.medicalNotes) !== "null" && (
                      <DetailRow label="Medical notes" value={String(child.medicalNotes)} />
                    )}
                    {child.comfortNotes != null && String(child.comfortNotes) !== "null" && (
                      <DetailRow label="Comfort notes" value={String(child.comfortNotes)} />
                    )}
                    {child.classroomName !== "Unassigned" && (
                      <div className="mt-1.5 rounded-md border border-border/50 bg-muted/30 p-2.5">
                        <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Room assignment</p>
                        <div className="grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
                          <DetailRow label="Room" value={child.classroomName} />
                          <DetailRow label="Age group" value={child.classroomAgeGroup} />
                          <DetailRow label="Capacity" value={child.classroomCapacity} />
                          <DetailRow label="Lead teacher" value={child.classroomLeadTeacher} />
                          <DetailRow label="Ratio" value={child.classroomRatioLabel} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DetailSection>
        </div>
      )}

      {/* Documents — span both columns */}
      <div className="col-span-full rounded-lg border border-border/50 p-4">
        <DetailSection label={`Documents (${entry.documents.length})`} icon={FileText}>
          {entry.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            <div className="grid gap-2 lg:grid-cols-2">
              {entry.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 p-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.category}{doc.fileName ? ` · ${doc.fileName}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={doc.statusTone}>{doc.status}</StatusBadge>
                    {doc.blobUrl && (
                      <a href={doc.blobUrl} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="outline" size="sm"><ExternalLink className="mr-1.5 size-3.5" />View</Button>
                      </a>
                    )}
                    {doc.blobDownloadUrl && (
                      <a href={doc.blobDownloadUrl} download>
                        <Button type="button" variant="outline" size="sm"><Download className="mr-1.5 size-3.5" />Download</Button>
                      </a>
                    )}
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

export function AdminSimpleEnrollmentPageView({
  enrollments,
}: {
  enrollments: SimpleAdminEnrollmentPreview[]
}) {
  const [selectedEntry, setSelectedEntry] = useState<SimpleAdminEnrollmentPreview | null>(null)

  const submittedCount = enrollments.filter((entry) => entry.enrollmentStatusLabel === "Submitted").length
  const approvedCount = enrollments.filter((entry) => entry.enrollmentStatusLabel === "Approved").length
  const paidCount = enrollments.filter((entry) => entry.paymentStatusLabel === "Paid").length
  const invoicedCount = enrollments.filter((entry) => entry.invoices.length > 0).length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={simpleAdminDashboardPageContent.eyebrow}
        title={simpleAdminDashboardPageContent.title}
        description={simpleAdminDashboardPageContent.description}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="border-border/65">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Inbox className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Submitted</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{submittedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/65">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/65">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Invoiced</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{invoicedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/65">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Marked paid</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{paidCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/65">
        <CardHeader className="gap-2 p-5">
          <p className="editorial-kicker">Enrollment review</p>
          <CardTitle className="text-xl">Submitted enrollments</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            Click any row to view full details, uploaded documents, and take action on the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {enrollments.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><span className="flex items-center gap-1.5"><User className="size-3.5" />Parent</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><Baby className="size-3.5" />Child</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><ClipboardList className="size-3.5" />Enrollment</span></TableHead>
                  <TableHead><span className="flex items-center gap-1.5"><CreditCard className="size-3.5" />Payment</span></TableHead>
                  <TableHead className="text-center"><span className="flex items-center justify-center gap-1.5"><FileText className="size-3.5" />Docs</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEntry(entry)}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No enrollments submitted"
              description="New parent enrollment submissions will appear here once families complete the simplified enrollment form."
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Panel */}
      <Sheet open={selectedEntry !== null} onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-4xl">
          {selectedEntry && (
            <>
              <SheetHeader className="border-b border-border/60 pb-4">
                <SheetTitle className="flex items-center gap-2 text-lg"><UserCircle className="size-5 text-muted-foreground" />{selectedEntry.parentName}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 text-sm">
                  <span>{selectedEntry.familyName} family</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span>submitted {selectedEntry.submittedAt}</span>
                </SheetDescription>
              </SheetHeader>
              <EnrollmentDetailPanel entry={selectedEntry} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
