import type { InvoiceStatus } from "@prisma/client"

import type {
  AdminAnnouncementPreview,
  AdminBillingReminderPreview,
  AdminCalendarEventPreview,
  AdminChildHubRecord,
  AdminChildRecordPreview,
  AdminDashboardPreview,
  AdminFamilyOption,
  AdminMessageThreadDetail,
  AdminMessageThreadPreview,
  AdminMessagesData,
  AdminMetricPreview,
  ParentMessagePreview,
  AdminProgramPreview,
  AdminProgramRatePreview,
  AdminSchedulePreview,
  AdminSettingsSectionPreview,
  ClassroomAttendancePreview,
  ClassroomSummaryPreview,
  DashboardDomainSummary,
  DocumentQueuePreview,
  EnrollmentLeadPreview,
  FamilyBalancePreview,
  FamilyDirectoryPreview,
  FamilyHubRecord,
  PricingMatrixCell,
  PricingMatrixData,
  PricingMatrixRow,
  ReportBarPreview,
  StaffProfilePreview,
  WaitlistEntryPreview,
} from "@/types/app"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatCurrencyFromCents, formatFileSize, formatFullDate, formatMonthDay, formatRelativeDateTime, formatTime } from "@/lib/format"
import { BILLING_THREAD_LABEL } from "@/lib/messaging"

const SCHOOL_TIME_ZONE = "America/New_York"

function toLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function mapLeadStage(stage: "CONTACTED" | "APPLICATION_SENT" | "ACCEPTED" | "DENIED"): EnrollmentLeadPreview["stage"] {
  switch (stage) {
    case "CONTACTED":
      return "contacted"
    case "APPLICATION_SENT":
      return "application-sent"
    case "ACCEPTED":
      return "accepted"
    case "DENIED":
      return "denied"
  }
}

function mapPriority(priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW"): "high" | "medium" | "normal" | "low" {
  switch (priority) {
    case "HIGH":
      return "high" as const
    case "MEDIUM":
      return "medium" as const
    case "NORMAL":
      return "normal" as const
    case "LOW":
      return "low" as const
  }
}

function mapWaitlistStatus(status: "REVIEW" | "OFFER_READY" | "LONG_RANGE"): WaitlistEntryPreview["status"] {
  switch (status) {
    case "REVIEW":
      return "review"
    case "OFFER_READY":
      return "offer-ready"
    case "LONG_RANGE":
      return "long-range"
  }
}

function mapAnnouncementStatus(status: "SCHEDULED" | "DRAFT" | "PUBLISHED"): AdminAnnouncementPreview["publishStatus"] {
  switch (status) {
    case "SCHEDULED":
      return "scheduled"
    case "DRAFT":
      return "draft"
    case "PUBLISHED":
      return "published"
  }
}

function mapCalendarEventCategory(
  category: "CLASSROOM" | "FAMILY" | "CLOSURE"
): AdminCalendarEventPreview["category"] {
  switch (category) {
    case "CLASSROOM":
      return "classroom"
    case "FAMILY":
      return "family"
    case "CLOSURE":
      return "closure"
  }
}

function mapStaffStatus(status: "SCHEDULED" | "COVERAGE_NEEDED" | "OUT"): StaffProfilePreview["status"] {
  switch (status) {
    case "SCHEDULED":
      return "scheduled"
    case "COVERAGE_NEEDED":
      return "coverage-needed"
    case "OUT":
      return "out"
  }
}

function mapAttendanceStatus(status: "PRESENT" | "ABSENT" | "SCHEDULED"): AdminChildRecordPreview["attendanceStatus"] {
  switch (status) {
    case "PRESENT":
      return "present"
    case "ABSENT":
      return "absent"
    case "SCHEDULED":
      return "scheduled"
  }
}

function getFamilyBalanceStatus(invoices: Array<{ status: InvoiceStatus; dueDate: Date; amountCents: number }>) {
  const unpaidInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "OPEN" ||
      invoice.status === "PARTIALLY_PAID" ||
      invoice.status === "FAILED"
  )

  if (unpaidInvoices.length === 0) {
    return "current" as const
  }

  const hasOverdue = unpaidInvoices.some((invoice) => invoice.dueDate < new Date())
  return hasOverdue ? ("overdue" as const) : ("due" as const)
}

function getDocumentsDueCount(documents: Array<{ status: "REQUIRED" | "SUBMITTED" | "APPROVED" | "EXPIRED" }>) {
  return documents.filter((document) => document.status !== "APPROVED").length
}

function getLatestAttendanceDate(children: Array<{ attendanceRecords: Array<{ date: Date }> }>) {
  const dates = children.flatMap((child) => child.attendanceRecords.map((record) => record.date.getTime()))
  return dates.length ? new Date(Math.max(...dates)) : null
}

function getBillingReminderStatus(dueDate: Date): AdminBillingReminderPreview["status"] {
  return dueDate < new Date() ? "overdue" : "due"
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function formatTimeInputValue(value: Date | null | undefined) {
  if (!value) {
    return undefined
  }

  const hours = String(value.getHours()).padStart(2, "0")
  const minutes = String(value.getMinutes()).padStart(2, "0")

  return `${hours}:${minutes}`
}

function formatDateTimeInputValue(value: Date | null | undefined) {
  if (!value) {
    return undefined
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  )

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

function formatDateInputValue(value: Date | null | undefined) {
  if (!value) {
    return undefined
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(value)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  )

  return `${parts.year}-${parts.month}-${parts.day}`
}

function buildAdminDashboardDomains(params: {
  familyHub: FamilyHubRecord[]
  messageThreads: AdminMessageThreadPreview[]
  announcements: AdminAnnouncementPreview[]
  documents: DocumentQueuePreview[]
  balances: FamilyBalancePreview[]
  calendarEvents: AdminCalendarEventPreview[]
  billingReminders: AdminBillingReminderPreview[]
  settingsSections: AdminSettingsSectionPreview[]
}): DashboardDomainSummary[] {
  const {
    familyHub,
    messageThreads,
    announcements,
    documents,
    balances,
    calendarEvents,
    billingReminders,
    settingsSections,
  } = params

  const childRecords = familyHub.flatMap((family) => family.childRecords)
  const reportCoverageCount = childRecords.filter((child) => child.latestDailyReport?.isToday).length
  const photoCount = childRecords.reduce((sum, child) => sum + child.latestPhotoCount, 0)
  const openThreads = messageThreads.filter((thread) => thread.status === "open").length
  const unreadCount = messageThreads.reduce((sum, thread) => sum + thread.unreadCount, 0)
  const queuedAnnouncements = announcements.filter((announcement) => announcement.publishStatus !== "published").length
  const requiredDocuments = documents.filter((document) => document.status === "required").length
  const submittedDocuments = documents.filter((document) => document.status === "submitted").length
  const dueBalances = balances.filter((balance) => balance.status === "due").length
  const overdueBalances = balances.filter((balance) => balance.status === "overdue").length
  const schoolWideEvents = calendarEvents.filter((event) => event.targetScope === "school").length
  const classroomTargetedEvents = calendarEvents.filter((event) => event.targetScope === "classroom").length

  return [
    {
      key: "child-day",
      label: "Child Day",
      title: reportCoverageCount
        ? "Parent-facing daily updates are already live for part of today's roster."
        : "Daily classroom updates still need coverage today.",
      description:
        "Daily reports, attendance context, and photo updates are the school side of the child-day experience parents see first.",
      ownerLabel: "School owns the update",
      recentLabel: `${reportCoverageCount}/${childRecords.length} child reports live today`,
      actionLabel: "Open child day",
      actionHref: "/admin/families",
      statusLabel: reportCoverageCount === childRecords.length ? "Covered" : "Needs attention",
      statusTone: reportCoverageCount === childRecords.length ? "success" : "warning",
      stats: [
        { label: "Reports live", value: String(reportCoverageCount) },
        { label: "Children", value: String(childRecords.length) },
        { label: "Photos", value: String(photoCount) },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      title: openThreads
        ? "Family threads and school updates still need active communication management."
        : "Messages and school updates are currently clear.",
      description:
        "Direct replies and school-wide announcements should share one communication language so families never feel split across channels.",
      ownerLabel: "Shared conversation ownership",
      recentLabel: `${openThreads} open threads · ${queuedAnnouncements} queued updates`,
      actionLabel: "Open messages",
      actionHref: "/admin/messages",
      statusLabel: unreadCount ? "Unread activity" : "In sync",
      statusTone: unreadCount ? "info" : "secondary",
      stats: [
        { label: "Open threads", value: String(openThreads) },
        { label: "Unread", value: String(unreadCount) },
        { label: "Queued updates", value: String(queuedAnnouncements) },
      ],
    },
    {
      key: "documents",
      label: "Documents",
      title: requiredDocuments || submittedDocuments
        ? "Document follow-up is active across family requests and school review."
        : "The document queue is quiet right now.",
      description:
        "The school requests and reviews documents while families upload them, so the queue needs to represent both sides of the workflow clearly.",
      ownerLabel: "Family upload, school review",
      recentLabel: `${requiredDocuments} required · ${submittedDocuments} submitted`,
      actionLabel: "Open documents",
      actionHref: "/admin/documents",
      statusLabel: requiredDocuments ? "Action needed" : "Monitoring",
      statusTone: requiredDocuments ? "warning" : "info",
      stats: [
        { label: "Required", value: String(requiredDocuments) },
        { label: "Submitted", value: String(submittedDocuments) },
      ],
    },
    {
      key: "billing",
      label: "Billing",
      title: dueBalances || overdueBalances
        ? "Collections follow-up should match the billing state families see."
        : "Billing is current across active family balances.",
      description:
        "Due balances and invoice drafting need to use the same billing language that parents see in their portal.",
      ownerLabel: "School follow-up",
      recentLabel: `${dueBalances} due · ${overdueBalances} overdue`,
      actionLabel: "Open billing",
      actionHref: "/admin/billing",
      statusLabel: overdueBalances ? "Overdue balances" : dueBalances ? "Due soon" : "Current",
      statusTone: overdueBalances ? "destructive" : dueBalances ? "warning" : "success",
      stats: [
        { label: "Families due", value: String(dueBalances + overdueBalances) },
      ],
    },
    {
      key: "calendar",
      label: "Calendar",
      title: "Calendar publishing controls what parents can plan around next.",
      description:
        "Manual events and derived billing reminders should read like one parent-facing schedule even though their sources differ on the admin side.",
      ownerLabel: "School publishes dates",
      recentLabel: `${calendarEvents.length} events · ${billingReminders.length} reminders`,
      actionLabel: "Open calendar",
      actionHref: "/admin/calendar",
      statusLabel: "Live immediately",
      statusTone: "success",
      stats: [
        { label: "School-wide", value: String(schoolWideEvents) },
        { label: "Classroom-targeted", value: String(classroomTargetedEvents) },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      title: "School policy should stay in sync with the family-facing product.",
      description:
        "Billing rules, communication defaults, and parent-facing policy language should stay connected instead of living in a technical admin silo.",
      ownerLabel: "School-owned policy",
      recentLabel: `${settingsSections.length} settings groups live`,
      actionLabel: "Open settings",
      actionHref: "/admin/settings",
      statusLabel: "Live editing",
      statusTone: "secondary",
      stats: [
        { label: "Policy groups", value: String(settingsSections.length) },
        {
          label: "Family-facing items",
          value: String(settingsSections.reduce((sum, section) => sum + section.items.length, 0)),
        },
      ],
    },
  ]
}

export async function getAdminPortalData(): Promise<{
  metrics: AdminMetricPreview[]
  enrollmentLeads: EnrollmentLeadPreview[]
  waitlistEntries: WaitlistEntryPreview[]
  children: AdminChildRecordPreview[]
  families: FamilyDirectoryPreview[]
  classrooms: ClassroomSummaryPreview[]
  attendanceBoard: ClassroomAttendancePreview[]
  balances: FamilyBalancePreview[]
  staffProfiles: StaffProfilePreview[]
  documents: DocumentQueuePreview[]
  familyHub: FamilyHubRecord[]
  announcements: AdminAnnouncementPreview[]
  messageThreads: AdminMessageThreadPreview[]
  calendarEvents: AdminCalendarEventPreview[]
  billingReminders: AdminBillingReminderPreview[]
  reportBars: {
    attendance: ReportBarPreview[]
    revenue: ReportBarPreview[]
    enrollment: ReportBarPreview[]
  }
  settingsSections: AdminSettingsSectionPreview[]
  dashboard: AdminDashboardPreview
}> {
  await requireRole("ADMIN")

  const [families, classrooms, leads, announcements, staffProfiles, schoolSettings, calendarEvents, messageThreads] = await Promise.all([
    prisma.family.findMany({
      include: {
        parents: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        children: {
          include: {
            classroom: true,
            attendanceRecords: {
              orderBy: {
                date: "desc",
              },
            },
            dailyReports: {
              orderBy: {
                date: "desc",
              },
              take: 1,
              include: {
                photoAssets: true,
              },
            },
            documents: true,
          },
        },
        invoices: true,
        payments: true,
        documents: true,
        leads: true,
        billingProfile: true,
      },
      orderBy: {
        familyName: "asc",
      },
    }),
    prisma.classroom.findMany({
      include: {
        children: true,
        staffProfiles: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.enrollmentLead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.announcement.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.staffProfile.findMany({
      include: {
        classroom: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.schoolSetting.findMany({
      orderBy: [
        {
          sectionKey: "asc",
        },
        {
          sortOrder: "asc",
        },
      ],
    }),
    prisma.calendarEvent.findMany({
      where: {
        NOT: {
          category: "BILLING",
        },
      },
      include: {
        classroom: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    prisma.messageThread.findMany({
      include: {
        family: true,
        messages: {
          orderBy: {
            sentAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    }),
  ])

  const allChildren = families.flatMap((family) =>
    family.children.map((child) => ({
      ...child,
      family,
    }))
  )
  const latestAttendanceDate = getLatestAttendanceDate(allChildren)

  const enrollmentLeads: EnrollmentLeadPreview[] = leads
    .filter((lead) => lead.leadType !== "WAITLIST")
    .map((lead) => ({
      id: lead.id,
      familyName: lead.familyName,
      childName: lead.childName,
      childAgeLabel: lead.childAgeLabel,
      requestedStart: lead.requestedStart,
      programInterest: lead.programInterest,
      source: lead.source,
      submittedAt: formatMonthDay(lead.createdAt),
      stage: mapLeadStage(lead.stage),
      priority: mapPriority(lead.priority),
      assignedTo: lead.assignedTo,
      note: lead.note,
    }))

  const waitlistEntries = leads
    .filter((lead) => lead.leadType === "WAITLIST" && lead.waitlistStatus)
    .map((lead) => ({
      id: lead.id,
      familyName: lead.familyName,
      childName: lead.childName,
      ageLabel: lead.childAgeLabel,
      scheduleNeed: lead.scheduleNeed ?? "Still deciding",
      requestedStart: lead.requestedStart,
      priority: mapPriority(lead.priority) as WaitlistEntryPreview["priority"],
      status: mapWaitlistStatus(lead.waitlistStatus ?? "REVIEW"),
      assignedTo: lead.assignedTo,
      note: lead.note,
    }))

  const balances = families
    .map((family) => {
      const totalDueCents = family.invoices
        .filter((invoice) => invoice.status === "OPEN")
        .reduce((total, invoice) => total + invoice.amountCents, 0)
      const dueInvoices = family.invoices.filter((invoice) => invoice.status === "OPEN")
      const balanceStatus = getFamilyBalanceStatus(family.invoices)

      return {
        id: family.id,
        familyName: family.familyName,
        totalDue: formatCurrencyFromCents(totalDueCents),
        dueDate: dueInvoices[0] ? formatMonthDay(dueInvoices[0].dueDate) : "—",
        invoiceCount: dueInvoices.length,
        method: family.payments[0]?.method ?? "Manual invoice follow-up",
        status: balanceStatus,
        paymentMethodDetail: family.billingProfile?.defaultPaymentMethodLabel ?? undefined,
        lastPaymentStatus: family.payments[0]
          ? ({
              PAID: "paid",
              PROCESSING: "processing",
              FAILED: "failed",
            }[family.payments[0].status] as FamilyBalancePreview["lastPaymentStatus"])
          : undefined,
        lastPaymentDate: family.payments[0] ? formatMonthDay(family.payments[0].paidAt) : undefined,
      }
    })
    .sort((left, right) => right.invoiceCount - left.invoiceCount)

  const documents = families
    .flatMap((family) =>
      family.documents.map((document) => {
        const child = family.children.find((item) => item.id === document.childId)

        return {
          id: document.id,
          title: document.title,
          familyName: family.familyName,
          childName: child ? `${child.firstName} ${child.lastName}` : "Family record",
          dueDate: document.dueDate ? formatMonthDay(document.dueDate) : "—",
          status: toLabel(document.status).toLowerCase() as DocumentQueuePreview["status"],
          owner: document.owner,
          note: document.note,
          fileName: document.fileName ?? undefined,
          downloadUrl: document.blobDownloadUrl ?? document.blobUrl ?? undefined,
          previewUrl: document.blobUrl ?? document.blobDownloadUrl ?? undefined,
          contentType: document.contentType ?? undefined,
          sizeLabel: document.sizeBytes ? formatFileSize(document.sizeBytes) : undefined,
          submittedAt: document.submittedAt ? formatMonthDay(document.submittedAt) : undefined,
          reviewedByName: document.reviewedByName ?? undefined,
          templateUrl: document.templateBlobUrl ?? undefined,
          templateDownloadUrl:
            document.templateDownloadUrl ??
            document.templateBlobUrl ??
            undefined,
          templateFileName: document.templateFileName ?? undefined,
          templateContentType: document.templateContentType ?? undefined,
          signedName: document.signedName ?? undefined,
          signedAt: document.signedAt
            ? formatRelativeDateTime(document.signedAt)
            : undefined,
          signedIp: document.signedIp ?? undefined,
        }
      })
    )

  const children = allChildren.map(({ family, ...child }) => ({
    id: child.id,
    slug: child.slug,
    name: `${child.firstName} ${child.lastName}`,
    ageLabel: child.ageLabel,
    classroom: child.classroom.name,
    familyName: family.familyName,
    attendanceStatus: mapAttendanceStatus(child.attendanceRecords[0]?.status ?? "SCHEDULED"),
    checkInTime: formatTimeInputValue(child.attendanceRecords[0]?.checkInAt),
    checkOutTime: formatTimeInputValue(child.attendanceRecords[0]?.checkOutAt),
    attendanceNote: child.attendanceRecords[0]?.note ?? "",
    allergies: Array.isArray(child.allergies) ? child.allergies.map((item) => String(item)) : [],
    balanceStatus: balances.find((balance) => balance.familyName === family.familyName)?.status === "current"
      ? ("current" as const)
      : ("due" as const),
    documentsStatus: getDocumentsDueCount([...family.documents, ...child.documents]) > 0
      ? ("pending" as const)
      : ("complete" as const),
    latestPhotoCount: child.dailyReports[0]?.photoAssets.length ?? 0,
  }))

  const enrichedChildren: AdminChildHubRecord[] = allChildren.map(({ family, ...child }) => {
    const familyBalance = balances.find((b) => b.familyName === family.familyName)
    const latestDailyReport = child.dailyReports[0]

    return {
      id: child.id,
      slug: child.slug,
      firstName: child.firstName,
      lastName: child.lastName,
      name: `${child.firstName} ${child.lastName}`,
      ageLabel: child.ageLabel,
      birthday: formatMonthDay(child.birthday),
      classroom: child.classroom.name,
      classroomId: child.classroomId,
      familyName: family.familyName,
      familyId: family.id,
      attendanceStatus: mapAttendanceStatus(child.attendanceRecords[0]?.status ?? "SCHEDULED"),
      checkInTime: formatTimeInputValue(child.attendanceRecords[0]?.checkInAt),
      checkOutTime: formatTimeInputValue(child.attendanceRecords[0]?.checkOutAt),
      attendanceNote: child.attendanceRecords[0]?.note ?? "",
      allergies: Array.isArray(child.allergies) ? child.allergies.map((item) => String(item)) : [],
      medicalNotes: typeof child.medicalNotes === "string" ? child.medicalNotes : "",
      comfortNotes: typeof child.comfortNotes === "string" ? child.comfortNotes : "",
      balanceStatus: (familyBalance?.status ?? "current") as "current" | "due" | "overdue",
      documentsStatus: getDocumentsDueCount([...family.documents, ...child.documents]) > 0
        ? ("pending" as const)
        : ("complete" as const),
      latestPhotoCount: child.dailyReports[0]?.photoAssets.length ?? 0,
      latestDailyReport: latestDailyReport
        ? {
            dateLabel: formatFullDate(latestDailyReport.date),
            isToday: sameDay(latestDailyReport.date, new Date()),
            arrivalMood: latestDailyReport.arrivalMood,
            summary: latestDailyReport.summary,
            meals: Array.isArray(latestDailyReport.meals) ? latestDailyReport.meals.map((item) => ({
              label: String((item as { label?: unknown }).label ?? ""),
              time: String((item as { time?: unknown }).time ?? ""),
              details: String((item as { details?: unknown }).details ?? ""),
              status: ((item as { status?: unknown }).status === "partial"
                ? "partial"
                : (item as { status?: unknown }).status === "skipped"
                  ? "skipped"
                  : "eaten") as "eaten" | "partial" | "skipped",
            })) : [],
            rest: Array.isArray(latestDailyReport.rest) ? latestDailyReport.rest.map((item) => ({
              label: String((item as { label?: unknown }).label ?? ""),
              time: String((item as { time?: unknown }).time ?? ""),
              duration: String((item as { duration?: unknown }).duration ?? ""),
              note: String((item as { note?: unknown }).note ?? ""),
            })) : [],
            activities: Array.isArray(latestDailyReport.activities)
              ? latestDailyReport.activities.map((item) => ({
                  time: String((item as { time?: unknown }).time ?? ""),
                  title: String((item as { title?: unknown }).title ?? ""),
                  description: String((item as { description?: unknown }).description ?? ""),
                }))
              : [],
            staffNotes: Array.isArray(latestDailyReport.staffNotes)
              ? latestDailyReport.staffNotes.map((item) => String(item))
              : [],
          }
        : null,
      siblings: family.children
        .filter((c) => c.id !== child.id)
        .map((c) => ({ id: c.id, name: `${c.firstName} ${c.lastName}`, ageLabel: c.ageLabel, classroom: c.classroom.name })),
    }
  })

  const attendanceBoard = classrooms.map((classroom) => {
    const roomChildren = allChildren.filter((child) => child.classroomId === classroom.id)
    const roomRecords = latestAttendanceDate
      ? roomChildren
          .map((child) => child.attendanceRecords.find((record) => sameDay(record.date, latestAttendanceDate)))
          .filter(Boolean)
      : []

    const expected = roomRecords.length
    const present = roomRecords.filter((record) => record?.status === "PRESENT").length
    const absent = roomRecords.filter((record) => record?.status === "ABSENT").length
    const late = roomRecords.filter(
      (record) => record?.checkInAt && record.checkInAt.getHours() >= 13
    ).length

    return {
      classroom: classroom.name,
      expected,
      present,
      absent,
      late,
      note: classroom.note,
    }
  })

  const familyLeadMap = new Map(
    leads.map((lead) => [lead.familyId ?? lead.familyName, lead])
  )

  const familyDirectory = families.map((family) => {
    const lead = familyLeadMap.get(family.id)

    return {
      id: family.id,
      familyName: family.familyName,
      guardians: family.parents.map((parent) => parent.user.name),
      children: family.children.length
        ? family.children.map((child) => `${child.firstName} ${child.lastName}`)
        : lead?.childName
          ? [lead.childName]
          : [],
      primaryEmail: family.parents[0]?.user.email ?? "No primary email on file",
      balanceStatus: balances.find((balance) => balance.familyName === family.familyName)?.status ?? "current",
      documentsDue: getDocumentsDueCount(family.documents),
      enrollmentStage: family.enrollmentStage,
    }
  })

  const familyHub: FamilyHubRecord[] = familyDirectory.map((dir) => ({
    ...dir,
    childRecords: enrichedChildren.filter((c) => c.familyId === dir.id),
    balance: balances.find((b) => b.familyName === dir.familyName) ?? null,
  }))

  const classroomSummaries = classrooms.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
    ageGroup: classroom.ageGroup,
    leadTeacher: classroom.leadTeacherName,
    enrolled: classroom.children.length,
    capacity: classroom.capacity,
    ratio: classroom.ratioLabel,
    nextEvent: classroom.nextEvent,
    note: classroom.note,
  }))

  const announcementQueue = announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    audience: announcement.audience,
    publishStatus: mapAnnouncementStatus(announcement.publishStatus),
    scheduledFor: announcement.scheduledFor ? formatRelativeDateTime(announcement.scheduledFor) : "Not scheduled",
    scheduledForValue: formatDateTimeInputValue(announcement.scheduledFor),
    summary: announcement.summary,
    body: announcement.body ?? undefined,
  }))

  const manualCalendarEvents = calendarEvents.map((event) => {
    const timeKind: AdminCalendarEventPreview["timeKind"] =
      event.timeLabel === "All day" ? "all-day" : "timed"

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: mapCalendarEventCategory(event.category as "CLASSROOM" | "FAMILY" | "CLOSURE"),
      targetScope: event.classroomId ? ("classroom" as const) : ("school" as const),
      targetLabel: event.classroom?.name ?? "All families",
      classroomId: event.classroomId ?? undefined,
      classroomLabel: event.classroom?.name ?? undefined,
      dateLabel: formatMonthDay(event.date),
      timeLabel: event.timeLabel,
      timeKind,
      startsAtValue: timeKind === "timed" ? formatDateTimeInputValue(event.date) : undefined,
      eventDateValue: formatDateInputValue(event.date) ?? "",
    }
  })

  const billingReminders = families
    .flatMap((family) =>
      family.invoices
        .filter((invoice) => invoice.status === "OPEN")
        .map((invoice) => ({
          invoice,
          familyName: family.familyName,
        }))
    )
    .sort((left, right) => left.invoice.dueDate.getTime() - right.invoice.dueDate.getTime())
    .map(({ invoice, familyName }) => ({
      id: `billing:${invoice.id}`,
      familyName,
      label: invoice.label,
      amount: formatCurrencyFromCents(invoice.amountCents),
      dueDate: formatMonthDay(invoice.dueDate),
      timeLabel: `By ${formatTime(invoice.dueDate)}`,
      status: getBillingReminderStatus(invoice.dueDate),
      description:
        invoice.description ??
        "Generated automatically from the family billing queue and shown on the matching parent calendar.",
    }))

  const staff = staffProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    role: profile.roleLabel,
    classroom: profile.classroom?.name ?? "Cross-room coverage",
    certification: profile.certification,
    status: mapStaffStatus(profile.status),
    note: profile.note,
  }))

  const settingsSections = schoolSettings.reduce<AdminSettingsSectionPreview[]>((sections, row) => {
    const existing = sections.find((section) => section.id === row.sectionKey)

    if (existing) {
      existing.items.push({
        id: row.id,
        label: row.label,
        value: row.value,
        note: row.note ?? undefined,
      })
      return sections
    }

    sections.push({
      id: row.sectionKey,
      sectionKey: row.sectionKey,
      title: row.sectionTitle,
      description: row.sectionDescription,
      items: [
        {
          id: row.id,
          label: row.label,
          value: row.value,
          note: row.note ?? undefined,
        },
      ],
    })

    return sections
  }, [])

  const totalDue = balances.reduce((sum, balance) => {
    const value = Number(balance.totalDue.replace(/[^0-9.]/g, "")) || 0
    return sum + value
  }, 0)

  const attendancePresent = attendanceBoard.reduce((sum, room) => sum + room.present, 0)
  const attendanceExpected = attendanceBoard.reduce((sum, room) => sum + room.expected, 0)
  const announcementQueueCount = announcementQueue.filter(
    (announcement) => announcement.publishStatus !== "published"
  ).length

  const metrics: AdminMetricPreview[] = [
    {
      label: "Open leads",
      value: String(leads.length),
      detail: "Waitlist entries and new family inquiries still needing review.",
    },
    {
      label: "Latest attendance snapshot",
      value: attendanceExpected ? `${attendancePresent} / ${attendanceExpected}` : "No records",
      detail: "Children marked present in the latest attendance date stored in the system.",
    },
    {
      label: "Balance due",
      value: formatCurrencyFromCents(Math.round(totalDue * 100)),
      detail: "Outstanding family balances still open in the current billing queue.",
    },
    {
      label: "Draft or scheduled announcements",
      value: String(announcementQueueCount),
      detail: "Family communications still waiting for review or publication.",
    },
  ]

  const attendanceBars = attendanceBoard.map((room) => ({
    label: room.classroom,
    value: room.present,
    total: Math.max(room.expected, 1),
    note: room.expected ? `${Math.round((room.present / room.expected) * 100)}% present in latest snapshot` : "No attendance records yet",
  }))

  const collectedCents = families
    .flatMap((family) => family.payments)
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amountCents, 0)
  const dueSoonCents = families
    .flatMap((family) => family.invoices)
    .filter((invoice) => invoice.status === "OPEN" && invoice.dueDate >= new Date())
    .reduce((sum, invoice) => sum + invoice.amountCents, 0)
  const overdueCents = families
    .flatMap((family) => family.invoices)
    .filter((invoice) => invoice.status === "OPEN" && invoice.dueDate < new Date())
    .reduce((sum, invoice) => sum + invoice.amountCents, 0)
  const revenueTotal = Math.max(collectedCents + dueSoonCents + overdueCents, 1)

  const revenueBars: ReportBarPreview[] = [
    {
      label: "Collected",
      value: collectedCents,
      total: revenueTotal,
      note: "Current receipts recorded in the sample billing dataset.",
    },
    {
      label: "Due soon",
      value: dueSoonCents,
      total: revenueTotal,
      note: "Balances still open but not yet overdue.",
    },
    {
      label: "Overdue",
      value: overdueCents,
      total: revenueTotal,
      note: "Past-due invoices needing a more active follow-up tone.",
    },
  ]

  const enrollmentBars: ReportBarPreview[] = [
    {
      label: "Contacted",
      value: leads.filter((lead) => lead.stage === "CONTACTED").length,
      total: Math.max(leads.length, 1),
      note: "New family interest still waiting for a first clear next step.",
    },
    {
      label: "Application sent",
      value: leads.filter((lead) => lead.stage === "APPLICATION_SENT").length,
      total: Math.max(leads.length, 1),
      note: "Leads closest to a placement decision.",
    },
    {
      label: "Accepted",
      value: leads.filter((lead) => lead.stage === "ACCEPTED").length,
      total: Math.max(leads.length, 1),
      note: "Families offered enrollment and ready for onboarding.",
    },
    {
      label: "Denied",
      value: leads.filter((lead) => lead.stage === "DENIED").length,
      total: Math.max(leads.length, 1),
      note: "Applications that did not move forward this cycle.",
    },
  ]

  const messageThreadPreviews: AdminMessageThreadPreview[] = messageThreads.map((thread) => ({
    id: thread.id,
    subject: thread.subject,
    familyName: thread.family.familyName,
    classroomLabel: thread.classroomLabel,
    lastMessageAt: formatRelativeDateTime(thread.lastMessageAt),
    preview: thread.messages[0]?.body.slice(0, 120) ?? "",
    unreadCount: 0,
    status: thread.status === "CLOSED" ? "closed" as const : "open" as const,
  }))

  const domains = buildAdminDashboardDomains({
    familyHub,
    messageThreads: messageThreadPreviews,
    announcements: announcementQueue,
    documents,
    balances,
    calendarEvents: manualCalendarEvents,
    billingReminders,
    settingsSections,
  })

  const dashboard: AdminDashboardPreview = {
    metrics,
    leads: enrollmentLeads.slice(0, 3),
    attendance: {
      present: attendancePresent,
      absent: attendanceBoard.reduce((sum, room) => sum + room.absent, 0),
      ratio: attendanceExpected ? `${Math.round((attendancePresent / attendanceExpected) * 100)}% present` : "No attendance snapshot",
    },
    balances: balances.slice(0, 3),
    announcements: announcementQueue.slice(0, 3),
    domains,
  }

  return {
    metrics,
    enrollmentLeads,
    waitlistEntries,
    children,
    families: familyDirectory,
    classrooms: classroomSummaries,
    attendanceBoard,
    balances,
    staffProfiles: staff,
    documents,
    familyHub,
    announcements: announcementQueue,
    messageThreads: messageThreadPreviews,
    calendarEvents: manualCalendarEvents,
    billingReminders,
    reportBars: {
      attendance: attendanceBars,
      revenue: revenueBars,
      enrollment: enrollmentBars,
    },
    settingsSections,
    dashboard,
  }
}

/* ------------------------------------------------------------------ */
/*  Programs & Pricing                                                */
/* ------------------------------------------------------------------ */

export async function getAdminProgramsData() {
  await requireRole("ADMIN")

  const [programs, schedules, rates] = await Promise.all([
    prisma.program.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { rates: true } } },
    }),
    prisma.schedule.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { rates: true } } },
    }),
    prisma.programRate.findMany({
      include: {
        program: { select: { name: true } },
        schedule: { select: { name: true } },
      },
      orderBy: [{ program: { sortOrder: "asc" } }, { schedule: { sortOrder: "asc" } }],
    }),
  ])

  const programPreviews: AdminProgramPreview[] = programs.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    ageRange: p.ageRange,
    description: p.description,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    rateCount: p._count.rates,
  }))

  const schedulePreviews: AdminSchedulePreview[] = schedules.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    daysDescription: s.daysDescription,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
    rateCount: s._count.rates,
  }))

  const ratePreviews: AdminProgramRatePreview[] = rates.map((r) => ({
    id: r.id,
    programId: r.programId,
    programName: r.program.name,
    scheduleId: r.scheduleId,
    scheduleName: r.schedule.name,
    rateCents: r.rateCents,
    billingLabel: r.billingLabel,
    isActive: r.isActive,
  }))

  /* Build the pricing matrix: programs as rows, schedules as columns */
  const matrixRows: PricingMatrixRow[] = programs.map((p) => {
    const cells: Record<string, PricingMatrixCell> = {}
    for (const s of schedules) {
      const rate = rates.find((r) => r.programId === p.id && r.scheduleId === s.id)
      cells[s.id] = rate
        ? { rateId: rate.id, rateCents: rate.rateCents, billingLabel: rate.billingLabel, isActive: rate.isActive }
        : { rateId: null, rateCents: null, billingLabel: null, isActive: false }
    }
    return {
      programId: p.id,
      programName: p.name,
      ageRange: p.ageRange,
      cells,
    }
  })

  const pricingMatrix: PricingMatrixData = {
    schedules: schedules.map((s) => ({ id: s.id, name: s.name })),
    rows: matrixRows,
  }

  return {
    programs: programPreviews,
    schedules: schedulePreviews,
    rates: ratePreviews,
    pricingMatrix,
  }
}

function mapAdminThreadStatus(
  status: "ACTIVE" | "RESPONSE_NEEDED" | "CLOSED"
): AdminMessageThreadDetail["status"] {
  switch (status) {
    case "ACTIVE":
      return "active"
    case "RESPONSE_NEEDED":
      return "response-needed"
    case "CLOSED":
      return "closed"
  }
}

function mapAdminMessageRole(
  role: "STAFF" | "PARENT" | "DIRECTOR"
): ParentMessagePreview["role"] {
  switch (role) {
    case "STAFF":
      return "staff"
    case "PARENT":
      return "parent"
    case "DIRECTOR":
      return "director"
  }
}

function asAdminStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

/**
 * Loads the admin chat workspace dataset — every thread with full message
 * history (no `take: 1`), plus a family directory for the new-thread compose.
 * Distinct from the slim `messageThreads` slice on `getAdminPortalData()`,
 * which is shaped for the dashboard triage card.
 */
export async function getAdminMessagesData(): Promise<AdminMessagesData> {
  const user = await requireRole("ADMIN")

  const [threadRows, familyRows] = await Promise.all([
    prisma.messageThread.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: {
        family: { select: { id: true, familyName: true } },
        messages: { orderBy: { sentAt: "asc" } },
      },
    }),
    prisma.family.findMany({
      orderBy: { familyName: "asc" },
      select: {
        id: true,
        familyName: true,
        parents: {
          select: { user: { select: { name: true } } },
        },
        children: {
          orderBy: { firstName: "asc" },
          select: {
            classroom: { select: { name: true } },
          },
        },
      },
    }),
  ])

  const threads: AdminMessageThreadDetail[] = threadRows.map((thread) => {
    const lastMessage = thread.messages[thread.messages.length - 1]
    const unreadCount =
      thread.status === "RESPONSE_NEEDED" && lastMessage?.role === "PARENT"
        ? 1
        : 0
    return {
      id: thread.id,
      familyId: thread.familyId,
      familyName: thread.family.familyName,
      subject: thread.subject,
      classroomLabel: thread.classroomLabel,
      isBilling: thread.classroomLabel === BILLING_THREAD_LABEL,
      lastMessageAt: formatRelativeDateTime(thread.lastMessageAt),
      preview: lastMessage?.body ?? "No messages yet.",
      unreadCount,
      status: mapAdminThreadStatus(thread.status),
      participants: asAdminStringArray(thread.participants),
      messages: thread.messages.map((message) => ({
        id: message.id,
        sender: message.senderName,
        role: mapAdminMessageRole(message.role),
        sentAt: formatRelativeDateTime(message.sentAt),
        body: message.body,
      })),
    }
  })

  const families: AdminFamilyOption[] = familyRows.map((family) => {
    const classrooms = Array.from(
      new Set(
        family.children
          .map((child) => child.classroom?.name)
          .filter((value): value is string => Boolean(value))
      )
    )
    return {
      id: family.id,
      familyName: family.familyName,
      parentNames: family.parents
        .map((p) => p.user.name)
        .filter((name): name is string => Boolean(name)),
      classroomLabels: classrooms,
    }
  })

  return {
    adminName: user.name,
    threads,
    families,
  }
}

export type EnrollmentClassroomOption = {
  id: string
  name: string
  ageGroup: string
  capacity: number
  enrolled: number
  leadTeacherName: string
}

export type EnrollmentLeadDetail = {
  lead: {
    id: string
    familyId: string | null
    familyName: string
    childName: string
    childAgeLabel: string
    requestedStart: string
    programInterest: string
    note: string
    stage: string
    priority: string
    assignedTo: string
    source: string
  }
  application: {
    id: string
    childFirstName: string
    childLastName: string
    dateOfBirth: string
    childAgeLabel: string
    parentName: string
    parentEmail: string
    parentPhone: string
    relationshipToChild: string
    homeAddress: string
    primaryLanguage: string
    emergencyContactName: string
    emergencyContactPhone: string
    programSlug: string
    scheduleSlug: string
    preferredStartDate: string
    pediatricianName: string
    pediatricianPhone: string
    healthNotes: string
  } | null
  classrooms: EnrollmentClassroomOption[]
}

/**
 * Loads the data needed to review + approve a single enrollment lead in one
 * round trip: the lead row itself, the best-match `EnrollmentApplication` from
 * the parent wizard (when present), and every classroom with current enrollment
 * counts so the admin can pick a placement at approval time.
 */
export async function getEnrollmentLeadDetail(
  leadId: string
): Promise<EnrollmentLeadDetail | null> {
  await requireRole("ADMIN")

  const lead = await prisma.enrollmentLead.findUnique({
    where: { id: leadId },
  })
  if (!lead) return null

  // Best-effort match the matching application by familyId + name match.
  // Multiple apps per family are possible (siblings); we prefer the most
  // recently updated non-decided one.
  const [appRow, classroomRows] = await Promise.all([
    lead.familyId
      ? prisma.enrollmentApplication.findFirst({
          where: {
            familyId: lead.familyId,
            status: { in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW"] },
          },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve(null),
    prisma.classroom.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { children: true } } },
    }),
  ])

  return {
    lead: {
      id: lead.id,
      familyId: lead.familyId,
      familyName: lead.familyName,
      childName: lead.childName,
      childAgeLabel: lead.childAgeLabel,
      requestedStart: lead.requestedStart,
      programInterest: lead.programInterest,
      note: lead.note,
      stage: lead.stage,
      priority: lead.priority,
      assignedTo: lead.assignedTo,
      source: lead.source,
    },
    application: appRow
      ? {
          id: appRow.id,
          childFirstName: appRow.childFirstName,
          childLastName: appRow.childLastName,
          dateOfBirth: appRow.dateOfBirth,
          childAgeLabel: appRow.childAgeLabel,
          parentName: appRow.parentName,
          parentEmail: appRow.parentEmail,
          parentPhone: appRow.parentPhone,
          relationshipToChild: appRow.relationshipToChild,
          homeAddress: appRow.homeAddress,
          primaryLanguage: appRow.primaryLanguage,
          emergencyContactName: appRow.emergencyContactName,
          emergencyContactPhone: appRow.emergencyContactPhone,
          programSlug: appRow.programSlug,
          scheduleSlug: appRow.scheduleSlug,
          preferredStartDate: appRow.preferredStartDate,
          pediatricianName: appRow.pediatricianName,
          pediatricianPhone: appRow.pediatricianPhone,
          healthNotes: appRow.healthNotes,
        }
      : null,
    classrooms: classroomRows.map((room) => ({
      id: room.id,
      name: room.name,
      ageGroup: room.ageGroup,
      capacity: room.capacity,
      enrolled: room._count.children,
      leadTeacherName: room.leadTeacherName,
    })),
  }
}
