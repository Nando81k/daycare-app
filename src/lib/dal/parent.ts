import type {
  ChildProfilePreview,
  DashboardDomainSummary,
  DailyActivityPreview,
  DailyMealPreview,
  DailyPhotoPreview,
  DailyReportPreview,
  DailyRestPreview,
  MinimalInvoicePreview,
  ParentAnnouncementPreview,
  ParentAttendanceRecordPreview,
  ParentDashboardPreview,
  ParentDocumentPreview,
  ParentEventPreview,
  ParentMessagePreview,
  ParentMessageThreadPreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  ParentReminder,
  ParentSettingsPreview,
} from "@/types/app"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isStripeConfigured } from "@/lib/env"
import {
  formatBirthday,
  formatCurrencyFromCents,
  formatFileSize,
  formatFullDate,
  formatMonthDay,
  formatRelativeDateTime,
  formatTime,
} from "@/lib/format"

type JsonRecord = Record<string, unknown>

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

function toObjectArray<T extends JsonRecord>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : []
}

function mapInvoiceStatus(status: "PAID" | "DUE" | "DRAFT"): MinimalInvoicePreview["status"] {
  switch (status) {
    case "PAID":
      return "paid"
    case "DUE":
      return "due"
    case "DRAFT":
      return "draft"
  }
}

function mapPaymentStatus(status: "PAID" | "PROCESSING" | "FAILED"): ParentPaymentPreview["status"] {
  switch (status) {
    case "PAID":
      return "paid"
    case "PROCESSING":
      return "processing"
    case "FAILED":
      return "failed"
  }
}

function mapDocumentStatus(status: "REQUIRED" | "SUBMITTED" | "APPROVED" | "EXPIRED"): ParentDocumentPreview["status"] {
  switch (status) {
    case "REQUIRED":
      return "required"
    case "SUBMITTED":
      return "submitted"
    case "APPROVED":
      return "approved"
    case "EXPIRED":
      return "expired"
  }
}

function mapAttendanceStatus(status: "PRESENT" | "ABSENT" | "SCHEDULED"): ParentAttendanceRecordPreview["status"] {
  switch (status) {
    case "PRESENT":
      return "present"
    case "ABSENT":
      return "absent"
    case "SCHEDULED":
      return "scheduled"
  }
}

function mapEventCategory(category: "CLASSROOM" | "FAMILY" | "CLOSURE" | "BILLING"): ParentEventPreview["category"] {
  switch (category) {
    case "CLASSROOM":
      return "classroom"
    case "FAMILY":
      return "family"
    case "CLOSURE":
      return "closure"
    case "BILLING":
      return "billing"
  }
}

function mapEventTimeKind(timeLabel: string): ParentEventPreview["timeKind"] {
  if (timeLabel === "All day") {
    return "all-day"
  }

  if (timeLabel.startsWith("By ")) {
    return "deadline"
  }

  return "timed"
}

function mapThreadStatus(status: "ACTIVE" | "RESPONSE_NEEDED" | "CLOSED"): ParentMessageThreadPreview["status"] {
  switch (status) {
    case "ACTIVE":
      return "active"
    case "RESPONSE_NEEDED":
      return "response-needed"
    case "CLOSED":
      return "closed"
  }
}

function mapMessageRole(role: "STAFF" | "PARENT" | "DIRECTOR"): ParentMessagePreview["role"] {
  switch (role) {
    case "STAFF":
      return "staff"
    case "PARENT":
      return "parent"
    case "DIRECTOR":
      return "director"
  }
}

function getCurrentInvoice(invoices: MinimalInvoicePreview[]) {
  return (
    invoices.find((invoice) => invoice.status === "due") ??
    invoices.find((invoice) => invoice.status === "draft") ??
    invoices[0]
  )
}

function buildBillingReminderEvent(invoice: {
  id: string
  label: string
  dueDate: Date
  description: string | null
}): ParentEventPreview {
  return {
    id: `billing:${invoice.id}`,
    title: invoice.label,
    dateLabel: formatMonthDay(invoice.dueDate),
    timeLabel: `By ${formatTime(invoice.dueDate)}`,
    startsAtIso: invoice.dueDate.toISOString(),
    timeKind: "deadline",
    category: "billing",
    description:
      invoice.description ??
      "Generated automatically from the current family invoice and shown on your calendar until the balance is resolved.",
  }
}

function formatDurationSummary(rest: DailyReportPreview["rest"]) {
  const minutes = rest.reduce((sum, item) => {
    const match = item.duration.match(/(\d+)/)
    return sum + (match ? Number(match[1]) : 0)
  }, 0)

  if (!minutes) {
    return "No rest yet"
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

function buildParentDashboardDomains(params: {
  childId: string
  dailyReport: DailyReportPreview
  documents: ParentDocumentPreview[]
  threads: ParentMessageThreadPreview[]
  upcomingEvents: ParentEventPreview[]
  invoice: MinimalInvoicePreview
  settings: ParentSettingsPreview
  announcements: ParentAnnouncementPreview[]
}): DashboardDomainSummary[] {
  const {
    childId,
    dailyReport,
    documents,
    threads,
    upcomingEvents,
    invoice,
    settings,
    announcements,
  } = params

  const requiredDocuments = documents.filter((document) => document.status === "required").length
  const reviewDocuments = documents.filter((document) => document.status === "submitted").length
  const unreadMessages = threads.reduce((count, thread) => count + thread.unreadCount, 0)
  const nextEvent = upcomingEvents[0]
  const latestThread = threads[0]
  const enabledNotifications = settings.notificationPreferences.filter((item) => item.enabled).length

  return [
    {
      key: "child-day",
      label: "Child Day",
      title: "Today's classroom update is ready for family review.",
      description:
        "The school owns the daily report and keeps meals, rest, activities, and photos current in one child-day workspace.",
      ownerLabel: "School-owned update",
      recentLabel: dailyReport.dateLabel,
      actionLabel: "Open child day",
      actionHref: `/parent/child/${childId}`,
      statusLabel: "Updated",
      statusTone: "success",
      stats: [
        { label: "Meals", value: String(dailyReport.meals.length) },
        { label: "Rest", value: formatDurationSummary(dailyReport.rest) },
        { label: "Activities", value: String(dailyReport.activities.length) },
      ],
    },
    {
      key: "messages",
      label: "Messages",
      title: unreadMessages
        ? "A school conversation still needs family attention."
        : "Messages and school updates are currently calm.",
      description:
        "Thread replies and school updates live in the same communication domain so families can catch up without switching channels.",
      ownerLabel: "Shared conversation ownership",
      recentLabel: latestThread ? latestThread.lastMessageAt : announcements[0]?.publishedAt ?? "No recent updates",
      actionLabel: "Open messages",
      actionHref: "/parent/messages",
      statusLabel: unreadMessages ? "Response requested" : "Up to date",
      statusTone: unreadMessages ? "info" : "secondary",
      stats: [
        { label: "Threads", value: String(threads.length) },
        { label: "Unread", value: String(unreadMessages) },
        { label: "Updates", value: String(announcements.length) },
      ],
    },
    {
      key: "documents",
      label: "Documents",
      title: requiredDocuments
        ? "School paperwork still needs a family follow-up."
        : "Documents are either on file or in review.",
      description:
        "The school requests and reviews documents while families upload them, so both sides stay visible in the same workflow.",
      ownerLabel: "Family upload, school review",
      recentLabel: requiredDocuments ? `${requiredDocuments} required now` : `${reviewDocuments} under review`,
      actionLabel: "Open documents",
      actionHref: "/parent/forms",
      statusLabel: requiredDocuments ? "Action needed" : "In review",
      statusTone: requiredDocuments ? "warning" : "info",
      stats: [
        { label: "Required", value: String(requiredDocuments) },
        { label: "Pending review", value: String(reviewDocuments) },
      ],
    },
    {
      key: "billing",
      label: "Billing",
      title: invoice.status === "due" ? "Tuition is due soon." : "Billing looks current right now.",
      description:
        "Families see the same due-state language the school uses for billing follow-up, so balance status stays easy to interpret on both sides.",
      ownerLabel: "Shared billing status",
      recentLabel: `${invoice.amount} · ${invoice.dueDate}`,
      actionLabel: "Open billing",
      actionHref: "/parent/billing",
      statusLabel: invoice.status === "due" ? "Due soon" : invoice.status === "paid" ? "Paid" : "Draft",
      statusTone: invoice.status === "due" ? "warning" : invoice.status === "paid" ? "success" : "secondary",
      stats: [
        { label: "Invoice", value: invoice.label },
        { label: "Status", value: invoice.status },
      ],
    },
    {
      key: "calendar",
      label: "Calendar",
      title: nextEvent
        ? "The next family date is already on the calendar."
        : "There are no upcoming school dates right now.",
      description:
        "School events, closures, and billing reminders all live in one schedule so the family always sees the same timeline the school published.",
      ownerLabel: "School publishes dates",
      recentLabel: nextEvent ? `${nextEvent.dateLabel} · ${nextEvent.timeLabel}` : "No upcoming event",
      actionLabel: "Open calendar",
      actionHref: "/parent/calendar",
      statusLabel: nextEvent ? "Coming up" : "Clear",
      statusTone: nextEvent ? "info" : "secondary",
      stats: [
        { label: "Upcoming", value: String(upcomingEvents.length) },
        {
          label: "Billing reminders",
          value: String(upcomingEvents.filter((event) => event.category === "billing").length),
        },
      ],
    },
    {
      key: "settings",
      label: "Settings",
      title: "Family preferences stay separate from school policy.",
      description:
        "Parents control contact details and notification choices here while school-owned policy remains consistent across the rest of the portal.",
      ownerLabel: "Family-owned preferences",
      recentLabel: `${enabledNotifications} preferences enabled`,
      actionLabel: "Open settings",
      actionHref: "/parent/settings",
      statusLabel: "Up to date",
      statusTone: "secondary",
      stats: [
        { label: "Billing contact", value: settings.billingContact },
        { label: "Email", value: settings.accountEmail },
      ],
    },
  ]
}

async function getParentPortalContext() {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      family: {
        include: {
          billingProfile: true,
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
            orderBy: {
              firstName: "asc",
            },
            include: {
              classroom: true,
              emergencyContacts: true,
              authorizedPickups: true,
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
                  photoAssets: {
                    orderBy: {
                      createdAt: "desc",
                    },
                  },
                },
              },
              documents: {
                orderBy: {
                  updatedAt: "desc",
                },
              },
            },
          },
          invoices: {
            orderBy: {
              dueDate: "asc",
            },
          },
          payments: {
            orderBy: {
              paidAt: "desc",
            },
          },
          documents: {
            orderBy: {
              updatedAt: "desc",
            },
          },
          messageThreads: {
            include: {
              messages: {
                orderBy: {
                  sentAt: "asc",
                },
              },
            },
            orderBy: {
              lastMessageAt: "desc",
            },
          },
        },
      },
    },
  })

  if (!profile || profile.family.children.length === 0) {
    throw new Error("Parent portal data is not configured for this account.")
  }

  const classroomIds = Array.from(new Set(profile.family.children.map((child) => child.classroomId)))
  const events = await prisma.calendarEvent.findMany({
    where: {
      NOT: {
        category: "BILLING",
      },
      OR: [
        {
          classroomId: null,
        },
        {
          classroomId: {
            in: classroomIds,
          },
        },
      ],
    },
    include: {
      classroom: true,
    },
    orderBy: {
      date: "asc",
    },
  })

  const announcements = await prisma.announcement.findMany({
    where: {
      publishStatus: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
  })

  return {
    user,
    profile,
    events,
    announcements,
  }
}

function mapChildProfile(child: Awaited<ReturnType<typeof getParentPortalContext>>["profile"]["family"]["children"][number]): ChildProfilePreview {
  const latestAttendance = child.attendanceRecords[0]

  return {
    id: child.slug,
    name: `${child.firstName} ${child.lastName}`,
    ageLabel: child.ageLabel,
    birthday: formatBirthday(child.birthday),
    classroom: child.classroom.name,
    attendanceNote: latestAttendance?.checkInAt
      ? `Checked in at ${formatTime(latestAttendance.checkInAt)}`
      : latestAttendance?.note ?? "No attendance record yet.",
    teacher: child.teacherLabel,
    summary: child.summary,
    allergies: toStringArray(child.allergies),
    medicalNotes: toStringArray(child.medicalNotes),
    comfortNotes: toStringArray(child.comfortNotes),
    emergencyContacts: child.emergencyContacts.map((contact) => ({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      priority: contact.priority as "Primary" | "Secondary",
    })),
    authorizedPickups: child.authorizedPickups.map((contact) => ({
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      note: contact.note ?? undefined,
    })),
  }
}

function mapDailyReport(
  report: Awaited<ReturnType<typeof getParentPortalContext>>["profile"]["family"]["children"][number]["dailyReports"][number]
): DailyReportPreview {
  const photoAssets: DailyPhotoPreview[] = report.photoAssets.map((photo) => ({
    id: photo.id,
    title: photo.title,
    caption: photo.caption ?? "",
    url: photo.blobUrl,
    downloadUrl: photo.blobDownloadUrl,
    uploadedAt: formatRelativeDateTime(photo.createdAt),
  }))

  return {
    dateLabel: formatFullDate(report.date),
    arrivalMood: report.arrivalMood,
    summary: report.summary,
    meals: toObjectArray<DailyMealPreview>(report.meals),
    rest: toObjectArray<DailyRestPreview>(report.rest),
    activities: toObjectArray<DailyActivityPreview>(report.activities),
    staffNotes: toStringArray(report.staffNotes),
    photos: photoAssets,
  }
}

export async function getParentPortalData(): Promise<
  ParentDashboardPreview & {
    invoices: MinimalInvoicePreview[]
    paymentHistory: ParentPaymentPreview[]
    paymentMethod: ParentPaymentMethodPreview
    attendanceHistory: ParentAttendanceRecordPreview[]
    settings: ParentSettingsPreview
    childProfile: ChildProfilePreview
    announcements: ParentAnnouncementPreview[]
  }
> {
  const { profile, events, announcements: rawAnnouncements } = await getParentPortalContext()
  const currentChild = profile.family.children[0]
  const childProfile = mapChildProfile(currentChild)
  const latestReport = currentChild.dailyReports[0]

  if (!latestReport) {
    throw new Error("No daily report is available for the current child.")
  }

  const dailyReport = mapDailyReport(latestReport)
  const invoices = profile.family.invoices.map((invoice) => ({
    id: invoice.id,
    label: invoice.label,
    amount: formatCurrencyFromCents(invoice.amountCents),
    dueDate: formatMonthDay(invoice.dueDate),
    status: mapInvoiceStatus(invoice.status),
    description: invoice.description ?? undefined,
  }))
  const invoice = getCurrentInvoice(invoices)

  if (!invoice) {
    throw new Error("No invoice data is available for the current family.")
  }

  const documents = profile.family.documents.map((document) => ({
    id: document.id,
    title: document.title,
    category: document.category,
    status: mapDocumentStatus(document.status),
    dueDate: document.dueDate ? formatMonthDay(document.dueDate) : undefined,
    lastUpdated: formatMonthDay(document.updatedAt),
    note: document.note,
    fileName: document.fileName ?? undefined,
    downloadUrl: document.blobDownloadUrl ?? document.blobUrl ?? undefined,
    submittedAt: document.submittedAt ? formatMonthDay(document.submittedAt) : undefined,
    sizeLabel: document.sizeBytes ? formatFileSize(document.sizeBytes) : undefined,
  }))

  const threads = profile.family.messageThreads.map((thread) => {
    const previewMessage = thread.messages[thread.messages.length - 1]
    const unreadCount =
      thread.status === "RESPONSE_NEEDED" && previewMessage?.role !== "PARENT"
        ? 1
        : 0

    return {
      id: thread.id,
      subject: thread.subject,
      classroom: thread.classroomLabel,
      lastMessageAt: formatRelativeDateTime(thread.lastMessageAt),
      preview: previewMessage?.body ?? "No messages yet.",
      unreadCount,
      status: mapThreadStatus(thread.status),
      participants: toStringArray(thread.participants),
      messages: thread.messages.map((message) => ({
        id: message.id,
        sender: message.senderName,
        role: mapMessageRole(message.role),
        sentAt: formatRelativeDateTime(message.sentAt),
        body: message.body,
      })),
    }
  })

  const manualEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    dateLabel: formatMonthDay(event.date),
    timeLabel: event.timeLabel,
    startsAtIso: event.date.toISOString(),
    timeKind: mapEventTimeKind(event.timeLabel),
    category: mapEventCategory(event.category),
    description: event.description,
    classroomLabel: event.classroom?.name ?? undefined,
  }))

  const billingEvents = profile.family.invoices
    .filter((entry) => entry.status === "DUE")
    .map((entry) =>
      buildBillingReminderEvent({
        id: entry.id,
        label: entry.label,
        dueDate: entry.dueDate,
        description: entry.description ?? null,
      })
    )

  const upcomingEvents = [...manualEvents, ...billingEvents].sort(
    (left, right) => new Date(left.startsAtIso).getTime() - new Date(right.startsAtIso).getTime()
  )

  const attendanceHistory = currentChild.attendanceRecords.map((record) => ({
    dateLabel: formatMonthDay(record.date),
    checkIn: record.checkInAt ? formatTime(record.checkInAt) : undefined,
    checkOut: record.checkOutAt ? formatTime(record.checkOutAt) : undefined,
    status: mapAttendanceStatus(record.status),
    note: record.note,
  }))

  const paymentHistory = profile.family.payments.map((payment) => ({
    id: payment.id,
    label: payment.label,
    date: formatMonthDay(payment.paidAt),
    amount: formatCurrencyFromCents(payment.amountCents),
    method: payment.method,
    status: mapPaymentStatus(payment.status),
  }))

  const billingProfile = profile.family.billingProfile
  const paymentMethod: ParentPaymentMethodPreview = {
    familyId: profile.family.id,
    label: "Primary payment method",
    detail:
      billingProfile?.defaultPaymentMethodLabel ??
      paymentHistory[0]?.method ??
      "No card on file yet",
    autopayStatus: billingProfile?.autopayEnabled ? "enabled" : "manual",
    note: isStripeConfigured()
      ? billingProfile?.autopayEnabled
        ? "Autopay is active for the default payment method on file."
        : "Card setup is available and manual payments stay visible below."
      : "Stripe keys are not configured in this environment yet. Billing controls will stay visible, but online collection needs setup before use.",
    brand: billingProfile?.defaultPaymentMethodBrand ?? undefined,
    last4: billingProfile?.defaultPaymentMethodLast4 ?? undefined,
    stripeConfigured: isStripeConfigured(),
  }

  const reminders: ParentReminder[] = []
  const requiredDocument = documents.find((document) => document.status === "required")
  const responseThread = threads.find((thread) => thread.status === "response-needed")

  if (requiredDocument?.dueDate) {
    reminders.push({
      label: requiredDocument.title,
      value: `Due ${requiredDocument.dueDate}`,
      tone: "warning",
    })
  }

  if (invoice.status === "due") {
    reminders.push({
      label: invoice.label,
      value: `${invoice.amount} due ${invoice.dueDate}`,
      tone: "warning",
    })
  }

  if (responseThread) {
    reminders.push({
      label: "Classroom message",
      value: `${Math.max(responseThread.unreadCount, 1)} response requested`,
      tone: "info",
    })
  }

  const settings: ParentSettingsPreview = {
    accountEmail: profile.user.email,
    phone: profile.phone,
    billingContact: profile.billingContact,
    pickupPolicy: profile.pickupPolicy,
    notificationPreferences: toObjectArray<ParentSettingsPreview["notificationPreferences"][number]>(
      profile.notificationPreferences
    ),
  }

  const announcements: ParentAnnouncementPreview[] = rawAnnouncements
    .filter((entry) => entry.publishedAt !== null)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      audience: entry.audience,
      publishedAt: formatRelativeDateTime(entry.publishedAt!),
    }))

  const domains = buildParentDashboardDomains({
    childId: childProfile.id,
    dailyReport,
    documents,
    threads,
    upcomingEvents,
    invoice,
    settings,
    announcements,
  })

  return {
    child: childProfile,
    childProfile,
    dailyReport,
    reminders,
    invoice,
    documents,
    threads,
    upcomingEvents,
    domains,
    invoices,
    paymentHistory,
    paymentMethod,
    attendanceHistory,
    settings,
    announcements,
  }
}

export async function getParentBillingData(): Promise<{
  invoices: MinimalInvoicePreview[]
  paymentHistory: ParentPaymentPreview[]
  paymentMethod: ParentPaymentMethodPreview
  settings: ParentSettingsPreview
}> {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { email: true } },
      family: {
        include: {
          billingProfile: true,
          invoices: { orderBy: { dueDate: "desc" } },
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
    },
  })

  const stripeConfigured = isStripeConfigured()

  if (!profile) {
    return {
      invoices: [],
      paymentHistory: [],
      paymentMethod: {
        familyId: "",
        label: "Primary payment method",
        detail: "No card on file yet",
        autopayStatus: "manual",
        note: stripeConfigured
          ? "Card setup is available and manual payments stay visible below."
          : "Stripe keys are not configured in this environment yet. Billing controls will stay visible, but online collection needs setup before use.",
        stripeConfigured,
      },
      settings: {
        accountEmail: user.email,
        phone: "",
        billingContact: "",
        pickupPolicy: "",
        notificationPreferences: [],
      },
    }
  }

  const invoices = profile.family.invoices.map((invoice) => ({
    id: invoice.id,
    label: invoice.label,
    amount: formatCurrencyFromCents(invoice.amountCents),
    dueDate: formatMonthDay(invoice.dueDate),
    status: mapInvoiceStatus(invoice.status),
    description: invoice.description ?? undefined,
  }))

  const paymentHistory = profile.family.payments.map((payment) => ({
    id: payment.id,
    label: payment.label,
    date: formatMonthDay(payment.paidAt),
    amount: formatCurrencyFromCents(payment.amountCents),
    method: payment.method,
    status: mapPaymentStatus(payment.status),
  }))

  const billingProfile = profile.family.billingProfile
  const paymentMethod: ParentPaymentMethodPreview = {
    familyId: profile.family.id,
    label: "Primary payment method",
    detail:
      billingProfile?.defaultPaymentMethodLabel ??
      paymentHistory[0]?.method ??
      "No card on file yet",
    autopayStatus: billingProfile?.autopayEnabled ? "enabled" : "manual",
    note: stripeConfigured
      ? billingProfile?.autopayEnabled
        ? "Autopay is active for the default payment method on file."
        : "Card setup is available and manual payments stay visible below."
      : "Stripe keys are not configured in this environment yet. Billing controls will stay visible, but online collection needs setup before use.",
    brand: billingProfile?.defaultPaymentMethodBrand ?? undefined,
    last4: billingProfile?.defaultPaymentMethodLast4 ?? undefined,
    stripeConfigured,
  }

  const settings: ParentSettingsPreview = {
    accountEmail: profile.user.email,
    phone: profile.phone,
    billingContact: profile.billingContact,
    pickupPolicy: profile.pickupPolicy,
    notificationPreferences: toObjectArray<ParentSettingsPreview["notificationPreferences"][number]>(
      profile.notificationPreferences
    ),
  }

  return { invoices, paymentHistory, paymentMethod, settings }
}

export async function getInvoiceForPayment(
  invoiceId: string
): Promise<{
  invoice: MinimalInvoicePreview
  enrollmentApproved: boolean
} | null> {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      family: {
        include: {
          invoices: {
            where: { id: invoiceId },
            take: 1,
          },
        },
      },
    },
  })

  const invoice = profile?.family?.invoices[0]
  if (!invoice) return null

  return {
    invoice: {
      id: invoice.id,
      label: invoice.label,
      amount: formatCurrencyFromCents(invoice.amountCents),
      dueDate: formatMonthDay(invoice.dueDate),
      status: mapInvoiceStatus(invoice.status),
      description: invoice.description ?? undefined,
    },
    enrollmentApproved: profile.family.enrollmentStage === "Approved",
  }
}

export async function getParentChildBySlug(slug: string) {
  const { profile } = await getParentPortalContext()
  const child = profile.family.children.find((item) => item.slug === slug)

  return child ? mapChildProfile(child) : null
}

export async function getParentChildPageData(
  slug: string
): Promise<{
  child: ChildProfilePreview
  dailyReport: DailyReportPreview | null
  attendanceHistory: ParentAttendanceRecordPreview[]
} | null> {
  const { profile } = await getParentPortalContext()
  const child = profile.family.children.find((item) => item.slug === slug)

  if (!child) {
    return null
  }

  return {
    child: mapChildProfile(child),
    dailyReport: child.dailyReports[0] ? mapDailyReport(child.dailyReports[0]) : null,
    attendanceHistory: child.attendanceRecords.map((record) => ({
      dateLabel: formatMonthDay(record.date),
      checkIn: record.checkInAt ? formatTime(record.checkInAt) : undefined,
      checkOut: record.checkOutAt ? formatTime(record.checkOutAt) : undefined,
      status: mapAttendanceStatus(record.status),
      note: record.note,
    })),
  }
}
