import "server-only"

import { prisma } from "@/lib/db"

/**
 * Lightweight count queries that drive numeric badges in the portal
 * sidebars. Each function returns a map keyed by nav href so the sidebar
 * component can pick the right number without re-implementing the lookup
 * logic.
 *
 * The shapes are intentionally flat and JSON-serializable so they can be
 * passed through server-component → client-component prop boundaries.
 */

export type AdminSidebarBadges = {
  "/admin/enrollment": number
  "/admin/documents": number
  "/admin/billing": number
  "/admin/communications": number
}

export type ParentSidebarBadges = {
  "/parent/messages": number
  "/parent/documents": number
  "/parent/billing": number
}

const UNPAID_INVOICE_STATUSES = ["OPEN", "PARTIALLY_PAID", "FAILED"] as const

/**
 * Counts driving the admin sidebar badges. Each value is the number of
 * items needing attention right now — admins should see the badge and
 * know "X things are waiting for me here."
 */
export async function getAdminSidebarBadges(): Promise<AdminSidebarBadges> {
  const now = new Date()

  const [
    applicationsWaiting,
    documentsAttention,
    overdueInvoices,
    threadsNeedingResponse,
  ] = await Promise.all([
    // Use EnrollmentLead stage rather than EnrollmentApplication, because the
    // admin dashboard's "Applications waiting" tile uses the same lead-stage
    // signal — keeps the badge and the dashboard tile counting the same thing.
    prisma.enrollmentLead.count({
      where: { stage: "APPLICATION_SENT" },
    }),
    prisma.document.count({
      where: { status: { in: ["REQUIRED", "EXPIRED"] } },
    }),
    prisma.invoice.count({
      where: {
        status: { in: [...UNPAID_INVOICE_STATUSES] },
        dueDate: { lt: now },
      },
    }),
    prisma.messageThread.count({
      where: { status: "RESPONSE_NEEDED" },
    }),
  ])

  return {
    "/admin/enrollment": applicationsWaiting,
    "/admin/documents": documentsAttention,
    "/admin/billing": overdueInvoices,
    "/admin/communications": threadsNeedingResponse,
  }
}

/**
 * Counts driving the parent sidebar badges — messaging unreads,
 * required/expired forms, and any unpaid invoice (regardless of due date,
 * since families want to see open balances even before they're overdue).
 */
export async function getParentSidebarBadges(
  parentUserId: string,
): Promise<ParentSidebarBadges> {
  const profile = await prisma.parentProfile.findUnique({
    where: { userId: parentUserId },
    select: { familyId: true },
  })

  if (!profile?.familyId) {
    return {
      "/parent/messages": 0,
      "/parent/documents": 0,
      "/parent/billing": 0,
    }
  }

  const [responseNeededThreads, requiredDocs, openInvoices] = await Promise.all([
    prisma.messageThread.count({
      where: {
        familyId: profile.familyId,
        status: "RESPONSE_NEEDED",
      },
    }),
    prisma.document.count({
      where: {
        familyId: profile.familyId,
        status: { in: ["REQUIRED", "EXPIRED"] },
      },
    }),
    prisma.invoice.count({
      where: {
        familyId: profile.familyId,
        status: { in: [...UNPAID_INVOICE_STATUSES] },
      },
    }),
  ])

  return {
    "/parent/messages": responseNeededThreads,
    "/parent/documents": requiredDocs,
    "/parent/billing": openInvoices,
  }
}
