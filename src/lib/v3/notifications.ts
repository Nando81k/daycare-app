import { InvoiceStatus } from '@prisma/client';
import { BILLING_DEFAULTS } from '@/lib/billing';
import { prisma } from '@/lib/prisma';

export type NotificationSource = 'EVENT' | 'LIVE_REMINDER';
export type NotificationStatus = 'READ' | 'UNREAD';
export type NotificationFeedType = 'GENERAL' | 'ENROLLMENT' | 'BILLING';
export type NotificationFilterType = NotificationFeedType | 'REMINDER' | 'ALL';
export type NotificationFilterStatus = NotificationStatus | 'ALL';

export interface NotificationFeedItem {
  id: string;
  source: NotificationSource;
  type: NotificationFeedType;
  subject: string;
  message: string;
  createdAt: string;
  status: NotificationStatus;
  actionHref: string;
  senderName: string | null;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function daysBetween(from: Date, to: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs);
}

function eventActionHref(event: {
  invoiceId: string | null;
  enrollmentId: string | null;
}) {
  if (event.invoiceId) return `/dashboard/billing/pay/${event.invoiceId}`;
  if (event.enrollmentId) return '/dashboard/family';
  return '/dashboard/notifications';
}

function reminderActionHref(invoiceId: string) {
  return `/dashboard/billing/pay/${invoiceId}`;
}

export async function getParentNotificationFeed(
  parentId: string,
  options?: {
    type?: NotificationFilterType;
    status?: NotificationFilterStatus;
    limit?: number;
  }
) {
  const typeFilter = options?.type || 'ALL';
  const statusFilter = options?.status || 'ALL';
  const limit = Math.min(Math.max(options?.limit || 100, 1), 200);

  const [policy, events, invoices] = await Promise.all([
    prisma.centerBillingPolicy.findUnique({
      where: { key: 'PRIMARY' },
      select: { reminderOffsets: true },
    }),
    prisma.communicationEvent.findMany({
      where: {
        parentId,
        channel: 'IN_APP',
      },
      include: {
        createdByAdmin: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 120,
    }),
    prisma.invoice.findMany({
      where: {
        parentId,
        status: { in: [InvoiceStatus.OPEN, InvoiceStatus.PAST_DUE] },
      },
      include: {
        child: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 60,
    }),
  ]);

  const reminderOffsets: number[] = policy?.reminderOffsets?.length
    ? policy.reminderOffsets
    : [...BILLING_DEFAULTS.reminderOffsets];
  const today = new Date();

  const persisted: NotificationFeedItem[] = events.map((event) => ({
    id: event.id,
    source: 'EVENT',
    type: event.type,
    subject: event.subject || 'Update from Ambassadors Care',
    message: event.message || 'You have a new update in your parent portal.',
    createdAt: event.createdAt.toISOString(),
    status: event.status === 'READ' ? 'READ' : 'UNREAD',
    actionHref: eventActionHref(event),
    senderName: event.createdByAdmin
      ? `${event.createdByAdmin.firstName} ${event.createdByAdmin.lastName}`
      : null,
  }));

  const liveReminders: NotificationFeedItem[] = [];
  for (const invoice of invoices) {
    const daysUntilDue = daysBetween(today, invoice.dueDate);
    const childLabel = invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : 'your family';
    const amount = (invoice.amountDueCents / 100).toFixed(2);

    if (invoice.status === InvoiceStatus.PAST_DUE || daysUntilDue < 0) {
      liveReminders.push({
        id: `live-past-due-${invoice.id}`,
        source: 'LIVE_REMINDER',
        type: 'BILLING',
        subject: 'Invoice past due',
        message: `Invoice ${invoice.invoiceNumber} for ${childLabel} is past due. $${amount} is outstanding.`,
        createdAt: today.toISOString(),
        status: 'UNREAD',
        actionHref: reminderActionHref(invoice.id),
        senderName: null,
      });
      continue;
    }

    if (invoice.status === InvoiceStatus.OPEN && reminderOffsets.includes(daysUntilDue)) {
      const dayLabel = daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`;
      liveReminders.push({
        id: `live-open-${invoice.id}-${daysUntilDue}`,
        source: 'LIVE_REMINDER',
        type: 'BILLING',
        subject: 'Upcoming payment reminder',
        message: `Invoice ${invoice.invoiceNumber} for ${childLabel} is due ${dayLabel}. $${amount} is due.`,
        createdAt: today.toISOString(),
        status: 'UNREAD',
        actionHref: reminderActionHref(invoice.id),
        senderName: null,
      });
    }
  }

  let merged = [...persisted, ...liveReminders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (typeFilter !== 'ALL') {
    if (typeFilter === 'REMINDER') {
      merged = merged.filter((item) => item.source === 'LIVE_REMINDER');
    } else {
      merged = merged.filter((item) => item.type === typeFilter);
    }
  }

  if (statusFilter !== 'ALL') {
    merged = merged.filter((item) => item.status === statusFilter);
  }

  const counts = {
    total: [...persisted, ...liveReminders].length,
    unread: [...persisted, ...liveReminders].filter((item) => item.status === 'UNREAD').length,
    event: persisted.length,
    liveReminder: liveReminders.length,
  };

  return {
    items: merged.slice(0, limit),
    counts,
  };
}

export async function markParentNotificationRead(parentId: string, notificationId: string) {
  const updated = await prisma.communicationEvent.updateMany({
    where: {
      id: notificationId,
      parentId,
      channel: 'IN_APP',
      status: { not: 'READ' },
    },
    data: {
      status: 'READ',
    },
  });

  return updated.count;
}

export async function markAllParentNotificationsRead(parentId: string) {
  const updated = await prisma.communicationEvent.updateMany({
    where: {
      parentId,
      channel: 'IN_APP',
      status: { not: 'READ' },
    },
    data: {
      status: 'READ',
    },
  });

  return updated.count;
}
