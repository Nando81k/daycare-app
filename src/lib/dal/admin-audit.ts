import "server-only"

import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRelativeDateTime } from "@/lib/format"

export type AdminAuditEntry = {
  id: string
  action: string
  subjectType: string
  subjectId: string | null
  actorName: string | null
  actorEmail: string | null
  actorRole: string | null
  details: unknown
  createdAt: Date
  createdAtLabel: string
}

export type AdminAuditFilters = {
  query?: string
  action?: string
  subjectType?: string
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

export async function getAdminAuditData(filters: AdminAuditFilters = {}) {
  await requireRole("ADMIN")

  const pageSize = Math.min(
    Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  )
  const page = Math.max(1, filters.page ?? 1)
  const skip = (page - 1) * pageSize
  const trimmed = filters.query?.trim() ?? ""

  const where = {
    AND: [
      filters.action ? { action: filters.action } : {},
      filters.subjectType ? { subjectType: filters.subjectType } : {},
      trimmed
        ? {
            OR: [
              { action: { contains: trimmed, mode: "insensitive" as const } },
              {
                subjectType: {
                  contains: trimmed,
                  mode: "insensitive" as const,
                },
              },
              { subjectId: { contains: trimmed, mode: "insensitive" as const } },
              {
                actorUser: {
                  is: {
                    OR: [
                      {
                        name: {
                          contains: trimmed,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        email: {
                          contains: trimmed,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {},
    ],
  }

  const [rows, total, distinctActions, distinctSubjects] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        actorUser: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog
      .findMany({
        select: { action: true },
        distinct: ["action"],
        orderBy: { action: "asc" },
        take: 200,
      })
      .then((items) => items.map((i) => i.action)),
    prisma.auditLog
      .findMany({
        select: { subjectType: true },
        distinct: ["subjectType"],
        orderBy: { subjectType: "asc" },
        take: 100,
      })
      .then((items) => items.map((i) => i.subjectType)),
  ])

  const entries: AdminAuditEntry[] = rows.map((row) => ({
    id: row.id,
    action: row.action,
    subjectType: row.subjectType,
    subjectId: row.subjectId,
    actorName: row.actorUser?.name ?? null,
    actorEmail: row.actorUser?.email ?? null,
    actorRole: row.actorUser?.role ?? null,
    details: row.details,
    createdAt: row.createdAt,
    createdAtLabel: formatRelativeDateTime(row.createdAt),
  }))

  return {
    entries,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    actions: distinctActions,
    subjectTypes: distinctSubjects,
  }
}
