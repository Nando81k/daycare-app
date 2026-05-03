import "server-only"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  applicationStatusInfo,
  type EnrollmentApplicationListItem,
} from "@/lib/dal/enrollment-applications"
import { formatCurrencyFromCents, formatMonthDay } from "@/lib/format"
import type { StatusBadgeVariant } from "@/types/app"

export type AdminSearchFamily = {
  id: string
  name: string
  enrollmentStage: string
  href: string
}

export type AdminSearchChild = {
  id: string
  slug: string
  name: string
  ageLabel: string
  classroomName: string | null
  href: string
}

export type AdminSearchApplication = {
  id: string
  childName: string
  parentName: string
  statusLabel: string
  statusTone: StatusBadgeVariant
  updatedAt: string
  href: string
}

export type AdminSearchInvoice = {
  id: string
  label: string
  familyName: string
  amount: string
  status: string
  dueDate: string
  href: string
}

export type AdminSearchResult = {
  families: AdminSearchFamily[]
  children: AdminSearchChild[]
  applications: AdminSearchApplication[]
  invoices: AdminSearchInvoice[]
}

const RESULT_LIMIT = 6

/**
 * Server-only entity search for the admin command palette.
 * Empty query returns the most recently-updated entities in each section.
 */
export async function searchAdminEntities(
  query: string
): Promise<AdminSearchResult> {
  await requireRole("ADMIN")

  const trimmed = query.trim()
  const hasQuery = trimmed.length > 0

  const [familyRows, childRows, applicationRows, invoiceRows] = await Promise.all([
    prisma.family.findMany({
      where: hasQuery
        ? { familyName: { contains: trimmed, mode: "insensitive" } }
        : undefined,
      orderBy: hasQuery ? { familyName: "asc" } : { updatedAt: "desc" },
      take: RESULT_LIMIT,
    }),
    prisma.child.findMany({
      where: hasQuery
        ? {
            OR: [
              { firstName: { contains: trimmed, mode: "insensitive" } },
              { lastName: { contains: trimmed, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: hasQuery
        ? { firstName: "asc" }
        : { updatedAt: "desc" },
      take: RESULT_LIMIT,
      include: { classroom: { select: { name: true } } },
    }),
    prisma.enrollmentApplication.findMany({
      where: hasQuery
        ? {
            OR: [
              { childFirstName: { contains: trimmed, mode: "insensitive" } },
              { childLastName: { contains: trimmed, mode: "insensitive" } },
              { parentName: { contains: trimmed, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      take: RESULT_LIMIT,
    }),
    prisma.invoice.findMany({
      where: hasQuery
        ? {
            OR: [
              { label: { contains: trimmed, mode: "insensitive" } },
              {
                family: {
                  familyName: { contains: trimmed, mode: "insensitive" },
                },
              },
            ],
          }
        : { status: { in: ["OPEN", "PARTIALLY_PAID", "FAILED"] } },
      orderBy: hasQuery ? { dueDate: "desc" } : { dueDate: "asc" },
      take: RESULT_LIMIT,
      include: { family: { select: { familyName: true } } },
    }),
  ])

  const families: AdminSearchFamily[] = familyRows.map((family) => ({
    id: family.id,
    name: family.familyName,
    enrollmentStage: family.enrollmentStage,
    href: "/admin/families",
  }))

  const children: AdminSearchChild[] = childRows.map((child) => ({
    id: child.id,
    slug: child.slug,
    name: `${child.firstName} ${child.lastName}`.trim(),
    ageLabel: child.ageLabel,
    classroomName: child.classroom?.name ?? null,
    href: "/admin/families",
  }))

  const applications: AdminSearchApplication[] = applicationRows.map((app) => {
    const status = applicationStatusInfo(app.status)
    const childName = `${app.childFirstName} ${app.childLastName}`.trim()
    return {
      id: app.id,
      childName: childName || "Application",
      parentName: app.parentName,
      statusLabel: status.label,
      statusTone: status.tone,
      updatedAt: formatMonthDay(app.updatedAt),
      href: `/admin/enrollment/${app.id}`,
    } satisfies AdminSearchApplication
  })

  const invoices: AdminSearchInvoice[] = invoiceRows.map((invoice) => ({
    id: invoice.id,
    label: invoice.label,
    familyName: invoice.family.familyName,
    amount: formatCurrencyFromCents(invoice.amountCents),
    status: invoice.status.toLowerCase(),
    dueDate: formatMonthDay(invoice.dueDate),
    href: "/admin/billing",
  }))

  return { families, children, applications, invoices }
}

export type { EnrollmentApplicationListItem }
