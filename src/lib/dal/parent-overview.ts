import "server-only"

import type { InvoiceStatus } from "@prisma/client"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isStripeConfigured } from "@/lib/env"
import {
  formatCurrencyFromCents,
  formatMonthDay,
  formatRelativeDateTime,
} from "@/lib/format"
import type { StatusBadgeVariant } from "@/types/app"

export type DashboardChild = {
  id: string
  slug: string
  firstName: string
  lastName: string
  fullName: string
  ageLabel: string
  classroomName: string | null
  teacherLabel: string | null
}

export type DashboardInvoice = {
  id: string
  label: string
  amount: string
  amountCents: number
  dueDate: string
  status: "draft" | "due" | "paid"
  statusTone: StatusBadgeVariant
  description: string | null
}

export type DashboardAnnouncement = {
  id: string
  title: string
  summary: string
  publishedAt: string
}

export type DashboardApplication = {
  id: string
  childName: string
  programInterest: string
  statusLabel: string
  statusTone: StatusBadgeVariant
  updatedAt: string
}

export type DashboardReminder = {
  label: string
  value: string
  tone: StatusBadgeVariant
}

export type ParentOverviewData = {
  parentName: string
  familyName: string
  children: DashboardChild[]
  currentInvoice: DashboardInvoice | null
  upcomingInvoice: DashboardInvoice | null
  announcements: DashboardAnnouncement[]
  applications: DashboardApplication[]
  unreadMessageCount: number
  pendingDocumentCount: number
  upcomingPaymentReminder: DashboardReminder
  stripeConfigured: boolean
}

function mapInvoiceStatus(status: InvoiceStatus): {
  status: DashboardInvoice["status"]
  tone: StatusBadgeVariant
} {
  switch (status) {
    case "PAID":
    case "REFUNDED":
      return { status: "paid", tone: "success" }
    case "OPEN":
    case "PARTIALLY_PAID":
    case "FAILED":
      return { status: "due", tone: "warning" }
    case "DRAFT":
    case "VOID":
      return { status: "draft", tone: "secondary" }
  }
}

function mapApplicationStage(stage: string | null | undefined): {
  label: string
  tone: StatusBadgeVariant
} {
  switch (stage) {
    case "ACCEPTED":
      return { label: "Approved", tone: "success" }
    case "DENIED":
      return { label: "Not approved", tone: "destructive" }
    case "APPLICATION_SENT":
      return { label: "Submitted", tone: "info" }
    case "CONTACTED":
      return { label: "Draft", tone: "secondary" }
    default:
      return { label: "Not started", tone: "secondary" }
  }
}

export async function getParentOverviewData(): Promise<ParentOverviewData | null> {
  const user = await requireRole("PARENT")

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: { select: { name: true } },
      family: {
        select: {
          familyName: true,
          children: {
            orderBy: { firstName: "asc" },
            include: { classroom: { select: { name: true } } },
          },
          invoices: { orderBy: { dueDate: "asc" } },
          messageThreads: {
            select: { id: true, status: true },
          },
          documents: {
            where: { status: { in: ["REQUIRED", "EXPIRED"] } },
            select: { id: true },
          },
          leads: {
            orderBy: { updatedAt: "desc" },
            take: 4,
          },
        },
      },
    },
  })

  if (!profile) return null

  const children: DashboardChild[] = profile.family.children.map((child) => ({
    id: child.id,
    slug: child.slug,
    firstName: child.firstName,
    lastName: child.lastName,
    fullName: `${child.firstName} ${child.lastName}`.trim(),
    ageLabel: child.ageLabel,
    classroomName: child.classroom?.name ?? null,
    teacherLabel: child.teacherLabel ?? null,
  }))

  const currentInvoiceRow =
    profile.family.invoices.find((invoice) => invoice.status === "OPEN") ??
    profile.family.invoices.find((invoice) => invoice.status === "DRAFT") ??
    null
  const paidInvoices = profile.family.invoices.filter((i) => i.status === "PAID")
  const upcomingInvoiceRow =
    currentInvoiceRow?.status === "OPEN"
      ? (profile.family.invoices.find(
          (i) => i.id !== currentInvoiceRow.id && i.status === "DRAFT"
        ) ?? null)
      : null

  const toDashboardInvoice = (
    row: (typeof profile.family.invoices)[number] | null
  ): DashboardInvoice | null => {
    if (!row) return null
    const mapped = mapInvoiceStatus(row.status)
    return {
      id: row.id,
      label: row.label,
      amount: formatCurrencyFromCents(row.amountCents),
      amountCents: row.amountCents,
      dueDate: formatMonthDay(row.dueDate),
      status: mapped.status,
      statusTone: mapped.tone,
      description: row.description ?? null,
    }
  }

  const currentInvoice = toDashboardInvoice(currentInvoiceRow)
  const upcomingInvoice = toDashboardInvoice(upcomingInvoiceRow)

  const announcementRows = await prisma.announcement.findMany({
    where: { publishStatus: "PUBLISHED", publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  })
  const announcements: DashboardAnnouncement[] = announcementRows.map((a) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    publishedAt: a.publishedAt
      ? formatRelativeDateTime(a.publishedAt)
      : formatRelativeDateTime(a.createdAt),
  }))

  const applications: DashboardApplication[] = profile.family.leads.map((lead) => {
    const stage = mapApplicationStage(lead.stage)
    return {
      id: lead.id,
      childName: lead.childName,
      programInterest: lead.programInterest,
      statusLabel: stage.label,
      statusTone: stage.tone,
      updatedAt: formatMonthDay(lead.updatedAt),
    }
  })

  const unreadMessageCount = profile.family.messageThreads.filter(
    (t) => t.status === "RESPONSE_NEEDED"
  ).length
  const pendingDocumentCount = profile.family.documents.length

  const upcomingPaymentReminder: DashboardReminder = currentInvoice
    ? {
        label:
          currentInvoice.status === "due"
            ? `${currentInvoice.amount} due ${currentInvoice.dueDate}`
            : `${currentInvoice.amount} draft`,
        value: currentInvoice.label,
        tone: currentInvoice.statusTone,
      }
    : paidInvoices[0]
      ? {
          label: "All caught up",
          value: `Last paid ${formatMonthDay(paidInvoices[paidInvoices.length - 1].dueDate)}`,
          tone: "success",
        }
      : {
          label: "No invoice yet",
          value: "Check back after enrollment is approved.",
          tone: "secondary",
        }

  return {
    parentName: profile.user.name,
    familyName: profile.family.familyName,
    children,
    currentInvoice,
    upcomingInvoice,
    announcements,
    applications,
    unreadMessageCount,
    pendingDocumentCount,
    upcomingPaymentReminder,
    stripeConfigured: isStripeConfigured(),
  }
}
