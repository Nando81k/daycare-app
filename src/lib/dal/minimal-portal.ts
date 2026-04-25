import type {
  ParentDocumentPreview,
  ParentEnrollmentApplicationPreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  SimpleAdminChildPreview,
  SimpleAdminDocumentPreview,
  SimpleAdminInvoicePreview,
  SimpleAdminWorkspacePreview,
  SimpleParentPortalPreview,
  StatusBadgeVariant,
  WaitlistEntryPreview,
} from "@/types/app"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isStripeConfigured } from "@/lib/env"
import { buildDashboardDraftFromLead } from "@/lib/parent-enrollment"
import { formatCurrencyFromCents, formatFileSize, formatMonthDay } from "@/lib/format"

function getEnrollmentStatus(stage: string | null | undefined): {
  label: string
  tone: StatusBadgeVariant
  detail: string
} {
  switch (stage) {
    case "ACCEPTED":
      return {
        label: "Approved",
        tone: "success",
        detail: "Your enrollment has been approved by the center.",
      }
    case "DENIED":
      return {
        label: "Not approved",
        tone: "destructive",
        detail: "The center marked this enrollment as not approved.",
      }
    case "APPLICATION_SENT":
      return {
        label: "Submitted",
        tone: "info",
        detail: "Your enrollment form has been submitted and is waiting for center review.",
      }
    case "CONTACTED":
      return {
        label: "Draft saved",
        tone: "secondary",
        detail: "Your draft is saved. Continue the application when you are ready.",
      }
    default:
      return {
        label: "Not started",
        tone: "secondary",
        detail: "Complete the enrollment form to move this account forward.",
      }
  }
}

function getPaymentStatus(params: {
  latestInvoice:
    | {
        label: string
        amountCents: number
        dueDate: Date
        status: "PAID" | "DUE" | "DRAFT"
      }
    | null
  latestPaidPayment:
    | {
        amountCents: number
        paidAt: Date
      }
    | null
}): {
  label: string
  tone: StatusBadgeVariant
  detail: string
} {
  const { latestInvoice, latestPaidPayment } = params

  if (!latestInvoice && !latestPaidPayment) {
    return {
      label: "No payment requested",
      tone: "secondary",
      detail: "The center has not posted an invoice to this account yet.",
    }
  }

  if (latestInvoice?.status === "PAID") {
    return {
      label: "Paid",
      tone: "success",
      detail: `${latestInvoice.label} has already been paid.`,
    }
  }

  if (latestInvoice?.status === "DUE") {
    return {
      label: "Payment due",
      tone: "warning",
      detail: `${latestInvoice.label} is due ${formatMonthDay(latestInvoice.dueDate)}.`,
    }
  }

  if (latestInvoice?.status === "DRAFT") {
    return {
      label: "Invoice pending",
      tone: "info",
      detail: `${latestInvoice.label} has been drafted but is not marked paid yet.`,
    }
  }

  return {
    label: "Paid",
    tone: "success",
    detail: latestPaidPayment
      ? `The latest payment was received on ${formatMonthDay(latestPaidPayment.paidAt)}.`
      : "This account is currently paid.",
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

function mapInvoiceStatus(status: "PAID" | "DUE" | "DRAFT") {
  switch (status) {
    case "PAID":
      return "paid" as const
    case "DUE":
      return "due" as const
    case "DRAFT":
      return "draft" as const
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

export async function getSimpleParentPortalData(): Promise<SimpleParentPortalPreview> {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      family: {
        include: {
          leads: {
            where: {
              leadType: {
                not: "WAITLIST",
              },
            },
            orderBy: {
              updatedAt: "desc",
            },
          },
          invoices: {
            orderBy: {
              dueDate: "desc",
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
          billingProfile: true,
        },
      },
    },
  })

  if (!profile) {
    throw new Error("Parent account is not configured.")
  }

  const latestLead = profile.family.leads[0] ?? null
  const latestInvoice = profile.family.invoices[0] ?? null
  const latestPaidPayment =
    profile.family.payments.find((payment) => payment.status === "PAID") ?? null

  const enrollmentStatus = getEnrollmentStatus(latestLead?.stage)
  const paymentStatus = getPaymentStatus({
    latestInvoice,
    latestPaidPayment,
  })

  const paymentHistory: ParentPaymentPreview[] = profile.family.payments.map((payment) => ({
    id: payment.id,
    label: payment.label,
    date: formatMonthDay(payment.paidAt),
    amount: formatCurrencyFromCents(payment.amountCents),
    method: payment.method,
    status: mapPaymentStatus(payment.status),
  }))

  const billingProfile = profile.family.billingProfile
  const invoices = profile.family.invoices.map((invoice) => ({
    id: invoice.id,
    label: invoice.label,
    amount: formatCurrencyFromCents(invoice.amountCents),
    dueDate: formatMonthDay(invoice.dueDate),
    status: mapInvoiceStatus(invoice.status),
    description: invoice.description ?? undefined,
  }))

  const paymentMethod: ParentPaymentMethodPreview = {
    familyId: profile.family.id,
    label: "Primary payment method",
    detail:
      billingProfile?.defaultPaymentMethodLabel ??
      paymentHistory[0]?.method ??
      "No payment method on file",
    note: isStripeConfigured()
      ? "You can keep a card on file and pay manually whenever the center posts an invoice."
      : "Online payment controls need Stripe keys before card collection can go live in this environment.",
    brand: billingProfile?.defaultPaymentMethodBrand ?? undefined,
    last4: billingProfile?.defaultPaymentMethodLast4 ?? undefined,
    stripeConfigured: isStripeConfigured(),
  }

  const applications: ParentEnrollmentApplicationPreview[] = profile.family.leads.map((lead) => {
    const stage = getEnrollmentStatus(lead.stage)
    const draft = buildDashboardDraftFromLead({
      familyName: lead.familyName,
      parentName: lead.parentName,
      email: lead.email,
      phone: lead.phone,
      leadId: lead.id,
      childName: lead.childName,
      childAgeLabel: lead.childAgeLabel,
      requestedStart: lead.requestedStart,
      programInterest: lead.programInterest,
      scheduleNeed: lead.scheduleNeed,
      note: lead.note,
    })

    return {
      id: lead.id,
      childName: lead.childName,
      ageLabel: lead.childAgeLabel,
      programLabel: lead.programInterest,
      statusLabel: stage.label,
      statusTone: stage.tone,
      submittedAt: formatMonthDay(lead.createdAt),
      updatedAt: formatMonthDay(lead.updatedAt),
      draft,
    }
  })

  const documents: ParentDocumentPreview[] = profile.family.documents.map((document) => ({
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

  return {
    parentName: profile.user.name,
    familyName: profile.family.familyName,
    accountEmail: profile.user.email,
    phone: profile.phone,
    billingContact: profile.billingContact,
    enrollment: {
      leadId: latestLead?.id ?? null,
      stageLabel: enrollmentStatus.label,
      stageTone: enrollmentStatus.tone,
      detail: enrollmentStatus.detail,
      submittedAt: latestLead ? formatMonthDay(latestLead.createdAt) : undefined,
      draft: {
        familyName: profile.family.familyName,
        phone: profile.phone,
        childName: latestLead?.childName ?? "",
        childAgeLabel: latestLead?.childAgeLabel ?? "",
        requestedStart: latestLead?.requestedStart ?? "",
        programInterest: latestLead?.programInterest ?? "",
        scheduleNeed: latestLead?.scheduleNeed ?? "",
        note: latestLead?.note ?? "",
      },
    },
    applications,
    documents,
    payments: {
      statusLabel: paymentStatus.label,
      statusTone: paymentStatus.tone,
      detail: paymentStatus.detail,
      currentInvoice: latestInvoice
        ? {
            id: latestInvoice.id,
            label: latestInvoice.label,
            amount: formatCurrencyFromCents(latestInvoice.amountCents),
            dueDate: formatMonthDay(latestInvoice.dueDate),
            status: mapInvoiceStatus(latestInvoice.status),
            description: latestInvoice.description ?? undefined,
          }
        : null,
      invoices,
      paymentHistory,
      paymentMethod,
    },
  }
}

function getAdminPaymentStatus(family:
  | {
      invoices: Array<{
        amountCents: number
        dueDate: Date
        status: "PAID" | "DUE" | "DRAFT"
      }>
      payments: Array<{
        amountCents: number
        paidAt: Date
        status: "PAID" | "PROCESSING" | "FAILED"
      }>
    }
  | null
) {
  if (!family) {
    return {
      label: "No portal account",
      tone: "secondary" as const,
      detail: "This enrollment is not linked to a parent portal account yet.",
    }
  }

  const dueInvoice = family.invoices.find((invoice) => invoice.status === "DUE")
  const paidPayment = family.payments.find((payment) => payment.status === "PAID")

  if (dueInvoice) {
    return {
      label: "Not paid",
      tone: "warning" as const,
      detail: `${formatCurrencyFromCents(dueInvoice.amountCents)} due ${formatMonthDay(dueInvoice.dueDate)}`,
    }
  }

  if (paidPayment) {
    return {
      label: "Paid",
      tone: "success" as const,
      detail: `${formatCurrencyFromCents(paidPayment.amountCents)} paid ${formatMonthDay(paidPayment.paidAt)}`,
    }
  }

  const draftInvoice = family.invoices.find((invoice) => invoice.status === "DRAFT")

  if (draftInvoice) {
    return {
      label: "Invoice drafted",
      tone: "info" as const,
      detail: `${formatCurrencyFromCents(draftInvoice.amountCents)} drafted for ${formatMonthDay(draftInvoice.dueDate)}`,
    }
  }

  return {
    label: "No payment yet",
    tone: "secondary" as const,
    detail: "No invoice or payment has been recorded for this family yet.",
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

function mapPriority(priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW"): WaitlistEntryPreview["priority"] {
  switch (priority) {
    case "HIGH":
      return "high"
    case "MEDIUM":
      return "medium"
    case "NORMAL":
      return "low"
    case "LOW":
      return "low"
  }
}

export async function getSimpleAdminWorkspaceData(): Promise<SimpleAdminWorkspacePreview> {
  await requireRole("ADMIN")

  const enrollments = await prisma.enrollmentLead.findMany({
    where: {
      leadType: {
        not: "WAITLIST",
      },
    },
    include: {
      family: {
        include: {
          invoices: {
            orderBy: {
              dueDate: "desc",
            },
          },
          payments: {
            orderBy: {
              paidAt: "desc",
            },
          },
          documents: {
            orderBy: {
              createdAt: "desc",
            },
          },
          children: {
            include: {
              classroom: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const waitlistLeads = await prisma.enrollmentLead.findMany({
    where: {
      leadType: "WAITLIST",
      waitlistStatus: {
        not: null,
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  })

  return {
    enrollments: enrollments.map((lead) => {
      const enrollmentStatus = getEnrollmentStatus(lead.stage)
      const paymentStatus = getAdminPaymentStatus(lead.family)

      return {
        id: lead.id,
        familyId: lead.familyId,
        parentName: lead.parentName,
        familyName: lead.familyName,
        email: lead.email,
        phone: lead.phone,
        childName: lead.childName,
        childAgeLabel: lead.childAgeLabel,
        requestedStart: lead.requestedStart,
        programInterest: lead.programInterest,
        scheduleNeed: lead.scheduleNeed ?? undefined,
        note: lead.note,
        submittedAt: formatMonthDay(lead.createdAt),
        enrollmentStatusLabel: enrollmentStatus.label,
        enrollmentStatusTone: enrollmentStatus.tone,
        paymentStatusLabel: paymentStatus.label,
        paymentStatusTone: paymentStatus.tone,
        paymentDetail: paymentStatus.detail,
        documents: mapDocumentPreviews(lead.family?.documents ?? []),
        invoices: mapInvoicePreviews(lead.family?.invoices ?? []),
        children: mapChildPreviews(lead.family?.children ?? []),
      }
    }),
    waitlistEntries: waitlistLeads.map((lead) => ({
      id: lead.id,
      familyName: lead.familyName,
      childName: lead.childName,
      ageLabel: lead.childAgeLabel,
      scheduleNeed: lead.scheduleNeed ?? "Schedule not set",
      requestedStart: lead.requestedStart,
      priority: mapPriority(lead.priority),
      status: mapWaitlistStatus(lead.waitlistStatus ?? "REVIEW"),
      assignedTo: lead.assignedTo,
      note: lead.note,
    })),
  }
}

function getDocumentStatusTone(status: string): StatusBadgeVariant {
  switch (status) {
    case "APPROVED":
      return "success"
    case "SUBMITTED":
      return "info"
    case "REQUIRED":
      return "warning"
    case "EXPIRED":
      return "destructive"
    default:
      return "secondary"
  }
}

function getInvoiceStatusTone(status: string): StatusBadgeVariant {
  switch (status) {
    case "PAID":
      return "success"
    case "DUE":
      return "warning"
    case "DRAFT":
      return "info"
    default:
      return "secondary"
  }
}

function mapDocumentPreviews(
  documents: Array<{
    id: string
    title: string
    status: string
    category: string
    fileName: string | null
    blobUrl: string | null
    blobDownloadUrl: string | null
    submittedAt: Date | null
  }>,
): SimpleAdminDocumentPreview[] {
  return documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    status: doc.status,
    statusTone: getDocumentStatusTone(doc.status),
    fileName: doc.fileName,
    blobUrl: doc.blobUrl,
    blobDownloadUrl: doc.blobDownloadUrl,
    category: doc.category,
    submittedAt: doc.submittedAt ? formatMonthDay(doc.submittedAt) : null,
  }))
}

function mapChildPreviews(
  children: Array<{
    id: string
    firstName: string
    lastName: string
    ageLabel: string
    birthday: Date
    teacherLabel: string
    summary: string
    allergies: unknown
    medicalNotes: unknown
    comfortNotes: unknown
    classroom: {
      name: string
      ageGroup: string
      capacity: number
      leadTeacherName: string
      ratioLabel: string
    } | null
  }>,
): SimpleAdminChildPreview[] {
  return children.map((child) => ({
    id: child.id,
    firstName: child.firstName,
    lastName: child.lastName,
    ageLabel: child.ageLabel,
    birthday: formatMonthDay(child.birthday),
    teacherLabel: child.teacherLabel,
    summary: child.summary,
    allergies: child.allergies,
    medicalNotes: child.medicalNotes,
    comfortNotes: child.comfortNotes,
    classroomName: child.classroom?.name ?? "Unassigned",
    classroomAgeGroup: child.classroom?.ageGroup ?? "",
    classroomCapacity: child.classroom?.capacity ?? 0,
    classroomLeadTeacher: child.classroom?.leadTeacherName ?? "",
    classroomRatioLabel: child.classroom?.ratioLabel ?? "",
  }))
}

function getInvoiceStatusLabel(status: string): string {
  switch (status) {
    case "PAID":
      return "Paid"
    case "DUE":
      return "Due"
    case "DRAFT":
      return "Draft"
    default:
      return status
  }
}

function mapInvoicePreviews(
  invoices: Array<{ id: string; label: string; amountCents: number; dueDate: Date; status: string }>,
): SimpleAdminInvoicePreview[] {
  return invoices.map((inv) => ({
    id: inv.id,
    label: inv.label,
    amountCents: inv.amountCents,
    amount: formatCurrencyFromCents(inv.amountCents),
    dueDate: formatMonthDay(inv.dueDate),
    status: getInvoiceStatusLabel(inv.status),
    statusTone: getInvoiceStatusTone(inv.status),
  }))
}
