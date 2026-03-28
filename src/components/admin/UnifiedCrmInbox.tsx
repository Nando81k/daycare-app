'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Badge, Button, Card } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import type { AdminCrmInboxData, AdminCrmInboxItem, AdminCrmInboxType } from '@/lib/v3/queries';
import { getUiRevampFlags } from '@/lib/ui-revamp';

type InboxFilter = 'ALL' | AdminCrmInboxType | 'MINE';

interface UnifiedCrmInboxProps {
  data: AdminCrmInboxData;
  currentAdminId?: string | null;
  canSendNotifications?: boolean;
  title?: string;
  subtitle?: string;
}

const FILTER_ORDER: InboxFilter[] = ['ALL', 'ADMISSIONS', 'TASK', 'BILLING', 'MINE'];

function priorityVariant(priority: AdminCrmInboxItem['priority']) {
  if (priority === 'URGENT') return 'danger' as const;
  if (priority === 'HIGH') return 'warning' as const;
  if (priority === 'MEDIUM') return 'info' as const;
  return 'default' as const;
}

function suggestedActionLabel(item: AdminCrmInboxItem) {
  if (item.suggestedAction === 'OPEN_DECISION_DESK') return 'Open decision desk';
  if (item.suggestedAction === 'OPEN_BILLING_INVOICE') return 'Open invoice';
  if (item.suggestedAction === 'OPEN_FAMILY_WORKSPACE') return 'Open family workspace';
  if (item.suggestedAction === 'SEND_REMINDER') return 'Send reminder';
  return 'Open';
}

function itemTypeLabel(type: AdminCrmInboxType) {
  if (type === 'ADMISSIONS') return 'Admissions';
  if (type === 'TASK') return 'Task';
  return 'Billing';
}

export function UnifiedCrmInbox({
  data,
  currentAdminId = null,
  canSendNotifications = false,
  title = 'Unified Action Inbox',
  subtitle = 'One prioritized queue across admissions, CRM follow-up, and billing handoff.',
}: UnifiedCrmInboxProps) {
  const [filter, setFilter] = useState<InboxFilter>('ALL');
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const revampPhase = useMemo(() => getUiRevampFlags().phase, []);

  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return data.items;
    if (filter === 'MINE') {
      if (!currentAdminId) return [];
      return data.items.filter((item) => item.ownerAdminId === currentAdminId);
    }
    return data.items.filter((item) => item.type === filter);
  }, [currentAdminId, data.items, filter]);

  const visibleItems = expanded ? filteredItems : filteredItems.slice(0, 8);

  const filterCounts = useMemo(
    () => ({
      ALL: data.counts.total,
      ADMISSIONS: data.counts.byType.ADMISSIONS,
      TASK: data.counts.byType.TASK,
      BILLING: data.counts.byType.BILLING,
      MINE: currentAdminId ? data.items.filter((item) => item.ownerAdminId === currentAdminId).length : 0,
    }),
    [currentAdminId, data.counts.byType.ADMISSIONS, data.counts.byType.BILLING, data.counts.byType.TASK, data.counts.total, data.items],
  );

  function reminderDraft(item: AdminCrmInboxItem) {
    const childFragment = item.childName ? ` for ${item.childName}` : '';
    if (item.type === 'BILLING') {
      return {
        type: 'BILLING' as const,
        subject: `Billing reminder${childFragment}`,
        message: `Hi ${item.familyName}, this is a reminder to complete your pending billing step${childFragment}. Please review your family portal and complete the next action today.`,
      };
    }

    return {
      type: 'ENROLLMENT' as const,
      subject: `Admissions update${childFragment}`,
      message: `Hi ${item.familyName}, we have an admissions follow-up${childFragment}. Please review your Family Hub and complete the requested next step.`,
    };
  }

  function sendSuggestedReminder(item: AdminCrmInboxItem) {
    if (!canSendNotifications) return;
    if (!item.familyId) return;
    const draft = reminderDraft(item);
    const confirmed = window.confirm(`Send reminder to ${item.familyName}?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    const startedAt = Date.now();
    setPendingItemId(item.id);

    startTransition(async () => {
      const completedAt = Date.now();
      const response = await fetch('/api/v3/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: item.familyId,
          childId: item.childId ?? null,
          enrollmentId: item.enrollmentId ?? null,
          invoiceId: item.invoiceId ?? null,
          type: draft.type,
          subject: draft.subject,
          message: draft.message,
          delivery: { inApp: true, email: true },
          clientMetrics: {
            flow: 'CRM_COMMUNICATION',
            startedAt: new Date(startedAt).toISOString(),
            completedAt: new Date(completedAt).toISOString(),
            elapsedMs: Math.max(0, completedAt - startedAt),
            phase: revampPhase,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      setPendingItemId(null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to send reminder.');
        return;
      }
      setSuccess(`Reminder sent to ${item.familyName}.`);
    });
  }

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className="glass-shell"
      data-tour-id="admin-crm-inbox"
      actions={
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge variant="danger">{data.counts.byPriority.URGENT} urgent</Badge>
          <Badge variant="warning">{data.counts.overdue} overdue</Badge>
          <Badge variant="info">{data.counts.today} due today</Badge>
        </div>
      }
    >
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_ORDER.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={filter === item ? 'primary' : 'ghost'}
              onClick={() => setFilter(item)}
            >
              {item === 'ALL' ? 'All' : item === 'MINE' ? 'Mine' : itemTypeLabel(item)}
              <span className="ml-1.5 text-xs opacity-80">({filterCounts[item]})</span>
            </Button>
          ))}
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}

        <div className="space-y-2">
          {visibleItems.length ? (
            visibleItems.map((item) => (
              <article key={item.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.summary}</p>
                    <p className="mt-0.5 text-xs text-ink-600">
                      {item.familyName}
                      {item.childName ? ` • ${item.childName}` : ''}
                      {item.dueAt ? ` • ${formatDateTime(item.dueAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
                    <Badge variant="default">{itemTypeLabel(item.type)}</Badge>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Button asChild size="sm" variant="outline">
                    <Link href={item.href}>{suggestedActionLabel(item)}</Link>
                  </Button>
                  {canSendNotifications && item.suggestedAction === 'SEND_REMINDER' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => sendSuggestedReminder(item)}
                      isLoading={isPending && pendingItemId === item.id}
                      loadingText="Sending"
                    >
                      Send reminder
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="state-empty">No action items for this filter.</p>
          )}
        </div>

        {filteredItems.length > 8 ? (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? 'Show less' : `View all (${filteredItems.length})`}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
