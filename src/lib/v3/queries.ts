import { EnrollmentStatus, InvoiceStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getStripeRevenueSummary } from '@/lib/v3/stripe-analytics';

export type AdminCrmInboxType = 'ADMISSIONS' | 'TASK' | 'BILLING';
export type AdminCrmInboxPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AdminCrmSuggestedAction =
  | 'OPEN_DECISION_DESK'
  | 'OPEN_FAMILY_WORKSPACE'
  | 'OPEN_BILLING_INVOICE'
  | 'SEND_REMINDER';

export interface AdminCrmInboxItem {
  id: string;
  type: AdminCrmInboxType;
  priority: AdminCrmInboxPriority;
  familyId: string;
  familyName: string;
  childId?: string;
  childName?: string;
  enrollmentId?: string;
  invoiceId?: string;
  ownerAdminId: string | null;
  dueAt: string | null;
  summary: string;
  suggestedAction: AdminCrmSuggestedAction;
  href: string;
}

export interface AdminCrmInboxCounts {
  total: number;
  byType: Record<AdminCrmInboxType, number>;
  byPriority: Record<AdminCrmInboxPriority, number>;
  overdue: number;
  today: number;
  upcoming: number;
}

export interface AdminCrmInboxData {
  items: AdminCrmInboxItem[];
  counts: AdminCrmInboxCounts;
}

const PRIORITY_SCORE: Record<AdminCrmInboxPriority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isoDay(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function daysBetween(from: Date, to: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs);
}

function eventActionHref(event: { invoiceId: string | null; enrollmentId: string | null }) {
  if (event.invoiceId) return `/dashboard/billing/pay/${event.invoiceId}`;
  if (event.enrollmentId) return '/dashboard/family';
  return '/dashboard/notifications';
}

function urgencyScore(item: AdminCrmInboxItem, nowMs: number) {
  const base = PRIORITY_SCORE[item.priority] * 100;
  if (!item.dueAt) return base;
  const dueMs = new Date(item.dueAt).getTime();
  if (Number.isNaN(dueMs)) return base;
  if (dueMs < nowMs) return base + 30;
  if (dueMs - nowMs <= 24 * 60 * 60 * 1000) return base + 20;
  if (dueMs - nowMs <= 72 * 60 * 60 * 1000) return base + 10;
  return base;
}

function compareInboxItems(a: AdminCrmInboxItem, b: AdminCrmInboxItem, nowMs: number) {
  const scoreDiff = urgencyScore(b, nowMs) - urgencyScore(a, nowMs);
  if (scoreDiff !== 0) return scoreDiff;

  const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  if (aDue !== bDue) return aDue - bDue;

  return a.id.localeCompare(b.id);
}

function dueBucket(
  dueAt: string | null,
  input: { todayStartMs: number; tomorrowStartMs: number; upcomingEndMs: number },
) {
  if (!dueAt) return null;
  const dueMs = new Date(dueAt).getTime();
  if (Number.isNaN(dueMs)) return null;
  if (dueMs < input.todayStartMs) return 'overdue' as const;
  if (dueMs < input.tomorrowStartMs) return 'today' as const;
  if (dueMs <= input.upcomingEndMs) return 'upcoming' as const;
  return null;
}

export async function getAdminCrmInboxData(input?: {
  adminUserId?: string | null;
  limit?: number;
}): Promise<AdminCrmInboxData> {
  const now = new Date();
  const nowMs = now.getTime();
  const todayStartMs = startOfDay(now).getTime();
  const tomorrow = new Date(todayStartMs);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStartMs = tomorrow.getTime();
  const upcomingEnd = new Date(todayStartMs);
  upcomingEnd.setDate(upcomingEnd.getDate() + 7);
  const upcomingEndMs = upcomingEnd.getTime();
  const holdExpiringSoonMs = nowMs + 24 * 60 * 60 * 1000;
  const limit = Math.min(250, Math.max(10, input?.limit ?? 120));

  const [admissions, tasks, invoices, awaitingSecureSpot] = await Promise.all([
    prisma.enrollmentApplication.findMany({
      where: {
        status: { in: ['PENDING', 'REQUEST_INFO', 'WAITLISTED'] },
      },
      orderBy: [{ updatedAt: 'asc' }],
      take: 220,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        parentId: true,
        childId: true,
        child: { select: { firstName: true, lastName: true } },
        parent: {
          select: {
            firstName: true,
            lastName: true,
            crmProfileParent: { select: { ownerAdminId: true } },
          },
        },
      },
    }),
    prisma.familyCrmTask.findMany({
      where: { status: { not: 'DONE' } },
      orderBy: [{ dueAt: 'asc' }, { updatedAt: 'desc' }],
      take: 260,
      select: {
        id: true,
        title: true,
        priority: true,
        dueAt: true,
        childId: true,
        enrollmentId: true,
        invoiceId: true,
        ownerAdminId: true,
        child: { select: { firstName: true, lastName: true } },
        profile: {
          select: {
            parentId: true,
            ownerAdminId: true,
            parent: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ['OPEN', 'PAST_DUE'] } },
      orderBy: [{ dueDate: 'asc' }],
      take: 220,
      select: {
        id: true,
        status: true,
        dueDate: true,
        amountDueCents: true,
        parentId: true,
        childId: true,
        child: { select: { firstName: true, lastName: true } },
        parent: {
          select: {
            firstName: true,
            lastName: true,
            crmProfileParent: { select: { ownerAdminId: true } },
          },
        },
      },
    }),
    prisma.enrollmentApplication.findMany({
      where: {
        status: 'APPROVED',
        spotSecuredAt: null,
      },
      orderBy: [{ spotHoldExpiresAt: 'asc' }, { updatedAt: 'desc' }],
      take: 180,
      select: {
        id: true,
        parentId: true,
        childId: true,
        spotHoldExpiresAt: true,
        child: { select: { firstName: true, lastName: true } },
        parent: {
          select: {
            firstName: true,
            lastName: true,
            crmProfileParent: { select: { ownerAdminId: true } },
          },
        },
      },
    }),
  ]);

  const items: AdminCrmInboxItem[] = [];

  for (const enrollment of admissions) {
    const familyName = `${enrollment.parent.firstName} ${enrollment.parent.lastName}`;
    const childName = `${enrollment.child.firstName} ${enrollment.child.lastName}`;
    const priority: AdminCrmInboxPriority =
      enrollment.status === 'REQUEST_INFO'
        ? 'URGENT'
        : enrollment.status === 'PENDING'
          ? 'HIGH'
          : 'MEDIUM';

    items.push({
      id: `admission:${enrollment.id}`,
      type: 'ADMISSIONS',
      priority,
      familyId: enrollment.parentId,
      familyName,
      childId: enrollment.childId,
      childName,
      enrollmentId: enrollment.id,
      ownerAdminId: enrollment.parent.crmProfileParent?.ownerAdminId ?? null,
      dueAt: enrollment.updatedAt.toISOString(),
      summary:
        enrollment.status === 'REQUEST_INFO'
          ? `${childName} needs family intake updates before a decision.`
          : enrollment.status === 'WAITLISTED'
            ? `${childName} is waitlisted and needs next-step follow-up.`
            : `${childName} is pending review and decision.`,
      suggestedAction: 'OPEN_DECISION_DESK',
      href: `/admin/admissions?familyId=${encodeURIComponent(enrollment.parentId)}&enrollmentId=${encodeURIComponent(enrollment.id)}`,
    });
  }

  for (const task of tasks) {
    const familyName = `${task.profile.parent.firstName} ${task.profile.parent.lastName}`;
    const childName = task.child ? `${task.child.firstName} ${task.child.lastName}` : undefined;
    const dueAt = task.dueAt ? task.dueAt.toISOString() : null;
    const dueMs = dueAt ? new Date(dueAt).getTime() : null;
    const overdue = typeof dueMs === 'number' && dueMs < todayStartMs;
    const soon = typeof dueMs === 'number' && dueMs <= tomorrowStartMs;
    const priority: AdminCrmInboxPriority =
      overdue
        ? 'URGENT'
        : task.priority === 'URGENT'
          ? 'URGENT'
          : task.priority === 'HIGH' || soon
            ? 'HIGH'
            : task.priority === 'MEDIUM'
              ? 'MEDIUM'
              : 'LOW';

    items.push({
      id: `task:${task.id}`,
      type: 'TASK',
      priority,
      familyId: task.profile.parentId,
      familyName,
      childId: task.childId ?? undefined,
      childName,
      enrollmentId: task.enrollmentId ?? undefined,
      invoiceId: task.invoiceId ?? undefined,
      ownerAdminId: task.ownerAdminId ?? task.profile.ownerAdminId ?? null,
      dueAt,
      summary: childName ? `${task.title} (${childName})` : task.title,
      suggestedAction: 'OPEN_FAMILY_WORKSPACE',
      href: `/admin/families?familyId=${encodeURIComponent(task.profile.parentId)}&tab=tasks`,
    });
  }

  for (const invoice of invoices) {
    const familyName = `${invoice.parent.firstName} ${invoice.parent.lastName}`;
    const childName = invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : undefined;
    const dueAt = invoice.dueDate.toISOString();
    const dueMs = invoice.dueDate.getTime();
    const isPastDue = invoice.status === 'PAST_DUE' || dueMs < todayStartMs;
    const dueSoon = dueMs <= tomorrowStartMs;
    const priority: AdminCrmInboxPriority = isPastDue ? 'URGENT' : dueSoon ? 'HIGH' : 'MEDIUM';

    items.push({
      id: `invoice:${invoice.id}`,
      type: 'BILLING',
      priority,
      familyId: invoice.parentId,
      familyName,
      childId: invoice.childId ?? undefined,
      childName,
      invoiceId: invoice.id,
      ownerAdminId: invoice.parent.crmProfileParent?.ownerAdminId ?? null,
      dueAt,
      summary: `${invoice.status === 'PAST_DUE' ? 'Past due' : 'Open'} balance $${(invoice.amountDueCents / 100).toFixed(2)}${childName ? ` for ${childName}` : ''}.`,
      suggestedAction: 'SEND_REMINDER',
      href: `/admin/billing?invoiceId=${encodeURIComponent(invoice.id)}&familyId=${encodeURIComponent(invoice.parentId)}`,
    });
  }

  for (const enrollment of awaitingSecureSpot) {
    const familyName = `${enrollment.parent.firstName} ${enrollment.parent.lastName}`;
    const childName = `${enrollment.child.firstName} ${enrollment.child.lastName}`;
    const holdDueAt = enrollment.spotHoldExpiresAt ? enrollment.spotHoldExpiresAt.toISOString() : null;
    const holdMs = enrollment.spotHoldExpiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const priority: AdminCrmInboxPriority =
      holdMs <= nowMs ? 'URGENT' : holdMs <= holdExpiringSoonMs ? 'URGENT' : 'HIGH';

    items.push({
      id: `secure-spot:${enrollment.id}`,
      type: 'BILLING',
      priority,
      familyId: enrollment.parentId,
      familyName,
      childId: enrollment.childId,
      childName,
      enrollmentId: enrollment.id,
      ownerAdminId: enrollment.parent.crmProfileParent?.ownerAdminId ?? null,
      dueAt: holdDueAt,
      summary: `${childName} is approved and still awaiting secure-spot checkout.`,
      suggestedAction: 'SEND_REMINDER',
      href: `/admin/families?familyId=${encodeURIComponent(enrollment.parentId)}&tab=billing`,
    });
  }

  const sorted = [...items].sort((a, b) => compareInboxItems(a, b, nowMs));
  const limited = sorted.slice(0, limit);

  const counts: AdminCrmInboxCounts = {
    total: sorted.length,
    byType: { ADMISSIONS: 0, TASK: 0, BILLING: 0 },
    byPriority: { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
    overdue: 0,
    today: 0,
    upcoming: 0,
  };

  for (const item of sorted) {
    counts.byType[item.type] += 1;
    counts.byPriority[item.priority] += 1;
    const bucket = dueBucket(item.dueAt, { todayStartMs, tomorrowStartMs, upcomingEndMs });
    if (bucket) counts[bucket] += 1;
  }

  return {
    items: limited,
    counts,
  };
}

export async function getAdminOverviewData() {
  const now = new Date();
  const nowMs = now.getTime();
  const holdExpiringSoonCutoffMs = nowMs + 24 * 60 * 60 * 1000;
  const recentlySecuredCutoff = new Date(nowMs - 14 * 24 * 60 * 60 * 1000);
  const start90 = new Date(now);
  start90.setDate(now.getDate() - 89);
  start90.setHours(0, 0, 0, 0);

  const [
    enrollmentCounts,
    invoiceCounts,
    invoicesOpenSum,
    pastDueSum,
    paidThisMonth,
    recentAdmissions,
    recentPayments,
    invoices90,
    payments90,
    stripeRevenue,
    approvedEnrollments,
  ] =
    await Promise.all([
      prisma.enrollmentApplication.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'OPEN' },
        _sum: { amountDueCents: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'PAST_DUE' },
        _sum: { amountDueCents: true },
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          status: 'SUCCEEDED',
          processedAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _sum: { amountCents: true },
      }),
      prisma.enrollmentApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          child: {
            select: {
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              allergies: true,
              medicalNotes: true,
              emergencyContactName: true,
              emergencyContactPhone: true,
            },
          },
          parent: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.paymentTransaction.findMany({
        where: { status: 'SUCCEEDED' },
        orderBy: { processedAt: 'desc' },
        take: 6,
        include: {
          parent: {
            select: { firstName: true, lastName: true, email: true },
          },
          invoice: {
            select: { invoiceNumber: true },
          },
        },
      }),
      prisma.invoice.findMany({
        where: {
          issueDate: { gte: start90 },
          status: { in: ['OPEN', 'PAID', 'PAST_DUE'] },
        },
        select: { issueDate: true, totalCents: true },
      }),
      prisma.paymentTransaction.findMany({
        where: {
          status: 'SUCCEEDED',
          processedAt: { gte: start90 },
        },
        select: { processedAt: true, amountCents: true },
      }),
      getStripeRevenueSummary(start90, now),
      prisma.enrollmentApplication.findMany({
        where: { status: 'APPROVED' },
        orderBy: { updatedAt: 'desc' },
        take: 120,
        select: {
          id: true,
          parentId: true,
          childId: true,
          spotHoldExpiresAt: true,
          spotSecuredAt: true,
          selectedCadence: true,
          child: {
            select: { firstName: true, lastName: true },
          },
          parent: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

  const admissionsByStatus = Object.values(EnrollmentStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<EnrollmentStatus, number>);

  for (const item of enrollmentCounts) {
    admissionsByStatus[item.status] = item._count._all;
  }

  const invoicesByStatus = Object.values(InvoiceStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<InvoiceStatus, number>);

  for (const item of invoiceCounts) {
    invoicesByStatus[item.status] = item._count._all;
  }

  const seriesMap = new Map<
    string,
    {
      date: string;
      label: string;
      invoicedCents: number;
      collectedCents: number;
      stripeGrossCollectedCents: number;
      stripeNetCollectedCents: number;
      stripeFeeCents: number;
      stripeRefundedCents: number;
      stripePaymentCount: number;
    }
  >();

  for (let i = 89; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = isoDay(day);
    seriesMap.set(key, {
      date: key,
      label: dayLabel(day),
      invoicedCents: 0,
      collectedCents: 0,
      stripeGrossCollectedCents: 0,
      stripeNetCollectedCents: 0,
      stripeFeeCents: 0,
      stripeRefundedCents: 0,
      stripePaymentCount: 0,
    });
  }

  for (const inv of invoices90) {
    const key = isoDay(inv.issueDate);
    const row = seriesMap.get(key);
    if (row) row.invoicedCents += inv.totalCents;
  }

  for (const pay of payments90) {
    if (!pay.processedAt) continue;
    const key = isoDay(pay.processedAt);
    const row = seriesMap.get(key);
    if (row) row.collectedCents += pay.amountCents;
  }

  for (const stripePoint of stripeRevenue.series) {
    const row = seriesMap.get(stripePoint.date);
    if (!row) continue;
    row.stripeGrossCollectedCents = stripePoint.grossCollectedCents;
    row.stripeNetCollectedCents = stripePoint.netCollectedCents;
    row.stripeFeeCents = stripePoint.feeCents;
    row.stripeRefundedCents = stripePoint.refundedCents;
    row.stripePaymentCount = stripePoint.paymentCount;
  }

  const awaitingSecureSpot = approvedEnrollments.filter((enrollment) => !enrollment.spotSecuredAt);
  const expiringSoon = awaitingSecureSpot
    .filter(
      (enrollment) =>
        enrollment.spotHoldExpiresAt &&
        enrollment.spotHoldExpiresAt.getTime() > nowMs &&
        enrollment.spotHoldExpiresAt.getTime() <= holdExpiringSoonCutoffMs,
    )
    .sort((a, b) => {
      const aTime = a.spotHoldExpiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = b.spotHoldExpiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  const recentlySecured = approvedEnrollments
    .filter(
      (enrollment) =>
        Boolean(enrollment.spotSecuredAt) &&
        (enrollment.spotSecuredAt?.getTime() ?? 0) >= recentlySecuredCutoff.getTime(),
    )
    .sort((a, b) => {
      const aTime = a.spotSecuredAt?.getTime() ?? 0;
      const bTime = b.spotSecuredAt?.getTime() ?? 0;
      return bTime - aTime;
    });

  return {
    metrics: {
      pendingAdmissions: admissionsByStatus.PENDING,
      approvedAdmissions: admissionsByStatus.APPROVED,
      openInvoices: invoicesByStatus.OPEN,
      pastDueInvoices: invoicesByStatus.PAST_DUE,
      openBalanceCents: invoicesOpenSum._sum.amountDueCents || 0,
      pastDueBalanceCents: pastDueSum._sum.amountDueCents || 0,
      collectedThisMonthCents: paidThisMonth._sum.amountCents || 0,
    },
    admissionsByStatus,
    invoicesByStatus,
    series90d: Array.from(seriesMap.values()),
    stripeRevenue,
    recentAdmissions,
    recentPayments,
    admissionsHandoffMetrics: {
      approvedAwaitingSecureSpot: awaitingSecureSpot.length,
      expiringHolds: expiringSoon.length,
      recentlySecured: recentlySecured.length,
      expiringPreview: expiringSoon.slice(0, 4).map((enrollment) => ({
        enrollmentId: enrollment.id,
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        childName: `${enrollment.child.firstName} ${enrollment.child.lastName}`,
        parentName: `${enrollment.parent.firstName} ${enrollment.parent.lastName}`,
        holdExpiresAt: enrollment.spotHoldExpiresAt?.toISOString() ?? null,
      })),
      recentlySecuredPreview: recentlySecured.slice(0, 4).map((enrollment) => ({
        enrollmentId: enrollment.id,
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        childName: `${enrollment.child.firstName} ${enrollment.child.lastName}`,
        parentName: `${enrollment.parent.firstName} ${enrollment.parent.lastName}`,
        securedAt: enrollment.spotSecuredAt?.toISOString() ?? null,
        selectedCadence: enrollment.selectedCadence,
      })),
    },
  };
}

export async function getAdminDayInsights(dateInput: string) {
  const day = new Date(dateInput);
  if (Number.isNaN(day.getTime())) return null;

  const from = startOfDay(day);
  const to = new Date(from);
  to.setDate(from.getDate() + 1);

  const [invoices, payments, admissions, invoiceCounts] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        issueDate: { gte: from, lt: to },
      },
      select: { id: true, status: true, totalCents: true, amountDueCents: true },
    }),
    prisma.paymentTransaction.findMany({
      where: {
        createdAt: { gte: from, lt: to },
      },
      select: { status: true, amountCents: true },
    }),
    prisma.enrollmentApplication.count({
      where: {
        createdAt: { gte: from, lt: to },
      },
    }),
    prisma.invoice.groupBy({
      where: { issueDate: { gte: from, lt: to } },
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const invoiceStatusCounts = Object.values(InvoiceStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<InvoiceStatus, number>);

  for (const row of invoiceCounts) {
    invoiceStatusCounts[row.status] = row._count._all;
  }

  const invoicedCents = invoices.reduce((sum, invoice) => sum + invoice.totalCents, 0);
  const outstandingCents = invoices.reduce((sum, invoice) => sum + invoice.amountDueCents, 0);
  const collectedCents = payments
    .filter((payment) => payment.status === PaymentStatus.SUCCEEDED)
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const failedPayments = payments.filter((payment) => payment.status === PaymentStatus.FAILED).length;

  return {
    date: isoDay(from),
    invoicedCents,
    collectedCents,
    outstandingCents,
    invoiceStatusCounts,
    admissionsCreated: admissions,
    successfulPayments: payments.filter((payment) => payment.status === PaymentStatus.SUCCEEDED).length,
    failedPayments,
  };
}

export async function getAdminBillingOverview() {
  const [policy, plans, contracts, invoices, payments] = await Promise.all([
    prisma.centerBillingPolicy.findUnique({ where: { key: 'PRIMARY' } }),
    prisma.tuitionPlan.findMany({ orderBy: [{ isActive: 'desc' }, { name: 'asc' }] }),
    prisma.childTuitionContract.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { select: { firstName: true, lastName: true, email: true } },
        child: { select: { firstName: true, lastName: true } },
        tuitionPlan: { select: { name: true } },
      },
      take: 50,
    }),
    prisma.invoice.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        child: { select: { firstName: true, lastName: true } },
      },
      take: 80,
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parent: { select: { id: true, firstName: true, lastName: true, email: true } },
        invoice: { select: { invoiceNumber: true } },
      },
      take: 80,
    }),
  ]);

  return {
    policy,
    plans,
    contracts,
    invoices,
    payments,
  };
}

export async function getParentOverview(parentId: string) {
  const today = startOfDay(new Date());
  const dueSoonCutoff = new Date(today);
  dueSoonCutoff.setDate(today.getDate() + 7);

  const [children, enrollments, invoices, payments, unreadNotifications, unreadNotificationEvents] = await Promise.all([
    prisma.child.count({ where: { parentId } }),
    prisma.enrollmentApplication.findMany({
      where: { parentId },
      include: { child: { select: { firstName: true, lastName: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 24,
    }),
    prisma.invoice.findMany({
      where: { parentId },
      orderBy: { dueDate: 'asc' },
      take: 30,
      include: { child: { select: { firstName: true, lastName: true } } },
    }),
    prisma.paymentTransaction.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { invoice: { select: { invoiceNumber: true } } },
    }),
    prisma.communicationEvent.count({
      where: {
        parentId,
        channel: 'IN_APP',
        status: { not: 'READ' },
      },
    }),
    prisma.communicationEvent.findMany({
      where: {
        parentId,
        channel: 'IN_APP',
        status: { not: 'READ' },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        type: true,
        subject: true,
        message: true,
        createdAt: true,
        invoiceId: true,
        enrollmentId: true,
      },
    }),
  ]);

  const collectibleInvoices = invoices.filter(
    (invoice) => invoice.status === 'OPEN' || invoice.status === 'PAST_DUE',
  );

  const dueNowCents = collectibleInvoices.reduce((sum, invoice) => sum + invoice.amountDueCents, 0);
  const pastDueInvoices = invoices.filter((invoice) => invoice.status === 'PAST_DUE');
  const dueSoonInvoices = invoices.filter(
    (invoice) =>
      invoice.status === 'OPEN' &&
      startOfDay(invoice.dueDate).getTime() >= today.getTime() &&
      startOfDay(invoice.dueDate).getTime() <= dueSoonCutoff.getTime(),
  );

  const lastPayment =
    payments.find((payment) => payment.status === 'SUCCEEDED') ?? payments[0] ?? null;

  const enrollmentLaneMap = new Map<
    string,
    {
      enrollmentId: string;
      childId: string;
      childName: string;
      status: string;
      programType: string;
      startDate: string | null;
      updatedAt: string;
    }
  >();

  for (const enrollment of enrollments) {
    if (enrollmentLaneMap.has(enrollment.childId)) continue;
    enrollmentLaneMap.set(enrollment.childId, {
      enrollmentId: enrollment.id,
      childId: enrollment.childId,
      childName: `${enrollment.child.firstName} ${enrollment.child.lastName}`,
      status: enrollment.status,
      programType: enrollment.programType,
      startDate: enrollment.startDate ? enrollment.startDate.toISOString() : null,
      updatedAt: enrollment.updatedAt.toISOString(),
    });
  }

  const enrollmentLane = Array.from(enrollmentLaneMap.values())
    .sort((a, b) => {
      const weight = (status: string) => {
        if (status === 'REQUEST_INFO') return 0;
        if (status === 'PENDING') return 1;
        if (status === 'WAITLISTED') return 2;
        if (status === 'APPROVED') return 3;
        if (status === 'DENIED') return 4;
        return 5;
      };

      const weightDiff = weight(a.status) - weight(b.status);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 8);

  type ActionQueueItem = {
    id: string;
    kind:
      | 'ENROLLMENT_REQUEST_INFO'
      | 'ENROLLMENT_PENDING'
      | 'INVOICE_PAST_DUE'
      | 'INVOICE_DUE_SOON'
      | 'NOTIFICATION_UNREAD';
    priority: number;
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
    occurredAt?: string;
    dueDate?: string;
    amountDueCents?: number;
    invoiceId?: string;
    unreadCount?: number;
  };

  const actionQueue: ActionQueueItem[] = [];

  const requestInfoEnrollments = enrollments
    .filter((enrollment) => enrollment.status === 'REQUEST_INFO')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  for (const enrollment of requestInfoEnrollments) {
    actionQueue.push({
      id: `request-info-${enrollment.id}`,
      kind: 'ENROLLMENT_REQUEST_INFO',
      priority: 1,
      title: `${enrollment.child.firstName} ${enrollment.child.lastName}: info requested`,
      description: 'Admissions requested more details before a decision can be finalized.',
      href: '/dashboard/family',
      ctaLabel: 'Update Enrollment',
      occurredAt: enrollment.updatedAt.toISOString(),
    });
  }

  const pendingEnrollments = enrollments
    .filter((enrollment) => enrollment.status === 'PENDING')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  for (const enrollment of pendingEnrollments) {
    actionQueue.push({
      id: `pending-${enrollment.id}`,
      kind: 'ENROLLMENT_PENDING',
      priority: 2,
      title: `${enrollment.child.firstName} ${enrollment.child.lastName}: under admissions review`,
      description: 'Check status updates and prepare any requested follow-up.',
      href: '/dashboard/family',
      ctaLabel: 'View Enrollment',
      occurredAt: enrollment.updatedAt.toISOString(),
    });
  }

  for (const invoice of pastDueInvoices.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())) {
    const childLabel = invoice.child
      ? `${invoice.child.firstName} ${invoice.child.lastName}`
      : 'your family';

    actionQueue.push({
      id: `past-due-${invoice.id}`,
      kind: 'INVOICE_PAST_DUE',
      priority: 3,
      title: `${invoice.invoiceNumber} is past due`,
      description: `${childLabel} has $${(invoice.amountDueCents / 100).toFixed(2)} due and needs payment.`,
      href: `/dashboard/billing/pay/${invoice.id}`,
      ctaLabel: 'Pay Now',
      dueDate: invoice.dueDate.toISOString(),
      amountDueCents: invoice.amountDueCents,
      invoiceId: invoice.id,
    });
  }

  for (const invoice of dueSoonInvoices.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())) {
    const daysUntilDue = daysBetween(today, invoice.dueDate);
    const dayLabel = daysUntilDue <= 0 ? 'due today' : `due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
    actionQueue.push({
      id: `due-soon-${invoice.id}`,
      kind: 'INVOICE_DUE_SOON',
      priority: 4,
      title: `${invoice.invoiceNumber} ${dayLabel}`,
      description: `Upcoming invoice payment of $${(invoice.amountDueCents / 100).toFixed(2)}.`,
      href: `/dashboard/billing/pay/${invoice.id}`,
      ctaLabel: 'Pay Now',
      dueDate: invoice.dueDate.toISOString(),
      amountDueCents: invoice.amountDueCents,
      invoiceId: invoice.id,
    });
  }

  if (unreadNotifications > 0) {
    actionQueue.push({
      id: 'notification-summary',
      kind: 'NOTIFICATION_UNREAD',
      priority: 5,
      title: `${unreadNotifications} unread notification${unreadNotifications === 1 ? '' : 's'}`,
      description: 'Review messages from admins and enrollment updates.',
      href: '/dashboard/notifications',
      ctaLabel: 'Review Notifications',
      unreadCount: unreadNotifications,
    });
  }

  actionQueue.sort((a, b) => {
    const priorityDiff = a.priority - b.priority;
    if (priorityDiff !== 0) return priorityDiff;

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (a.occurredAt && b.occurredAt) {
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
    }

    return a.title.localeCompare(b.title);
  });

  return {
    metrics: {
      children,
      activeEnrollments: enrollments.filter((enrollment) => enrollment.status === 'APPROVED').length,
      pendingEnrollments: enrollments.filter(
        (enrollment) =>
          enrollment.status === 'PENDING' || enrollment.status === 'REQUEST_INFO',
      ).length,
      dueNowCents,
      pastDueCount: invoices.filter((invoice) => invoice.status === 'PAST_DUE').length,
      unreadNotifications: unreadNotifications,
    },
    actionQueue,
    enrollmentLane,
    financeSummary: {
      dueNowCents,
      dueSoonCount: dueSoonInvoices.length,
      pastDueCount: pastDueInvoices.length,
      openInvoiceCount: invoices.filter((invoice) => invoice.status === 'OPEN').length,
      nextDueInvoice: collectibleInvoices[0]
        ? {
            id: collectibleInvoices[0].id,
            invoiceNumber: collectibleInvoices[0].invoiceNumber,
            dueDate: collectibleInvoices[0].dueDate.toISOString(),
            status: collectibleInvoices[0].status,
            amountDueCents: collectibleInvoices[0].amountDueCents,
            childName: collectibleInvoices[0].child
              ? `${collectibleInvoices[0].child.firstName} ${collectibleInvoices[0].child.lastName}`
              : 'Family invoice',
          }
        : null,
      lastPayment: lastPayment
        ? {
            id: lastPayment.id,
            status: lastPayment.status,
            amountCents: lastPayment.amountCents,
            createdAt: lastPayment.createdAt.toISOString(),
            processedAt: lastPayment.processedAt
              ? lastPayment.processedAt.toISOString()
              : null,
            invoiceNumber: lastPayment.invoice?.invoiceNumber || null,
          }
        : null,
    },
    notificationSummary: {
      unreadCount: unreadNotifications,
      previewItems: unreadNotificationEvents.map((event) => ({
        id: event.id,
        type: event.type,
        subject: event.subject || 'Update from Ambassadors Care',
        message: event.message || 'You have a new portal update.',
        createdAt: event.createdAt.toISOString(),
        actionHref: eventActionHref(event),
      })),
    },
    enrollments,
    invoices,
    payments,
  };
}
