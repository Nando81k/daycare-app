'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { BellRing } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import {
  NotificationFilterTabs,
  type NotificationStatusFilter,
  type NotificationTypeFilter,
} from './NotificationFilterTabs';
import { NotificationListItem, type NotificationListItemModel } from './NotificationListItem';

interface FeedResponse {
  items: NotificationListItemModel[];
  counts: {
    total: number;
    unread: number;
    event: number;
    liveReminder: number;
  };
}

export function NotificationsHub() {
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>('ALL');
  const [data, setData] = useState<FeedResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchFeed = useCallback(async () => {
    setError('');
    setIsLoading(true);

    const params = new URLSearchParams();
    params.set('type', typeFilter);
    params.set('status', statusFilter);
    params.set('limit', '120');

    const response = await fetch(`/api/v3/parent/notifications?${params.toString()}`, {
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message || 'Unable to load notifications');
      setIsLoading(false);
      return;
    }

    setData(payload as FeedResponse);
    setIsLoading(false);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const items = useMemo(() => data?.items || [], [data?.items]);
  const unreadCount = data?.counts.unread || 0;

  function markOneRead(id: string) {
    setMarkingId(id);
    startTransition(async () => {
      const response = await fetch(`/api/v3/parent/notifications/${id}/read`, {
        method: 'PATCH',
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to mark notification as read');
      }
      setMarkingId(null);
      if (response.ok) {
        window.dispatchEvent(new Event('ac:sidebar-counts-refresh'));
      }
      await fetchFeed();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      const response = await fetch('/api/v3/parent/notifications/read-all', {
        method: 'PATCH',
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to mark notifications as read');
      }
      if (response.ok) {
        window.dispatchEvent(new Event('ac:sidebar-counts-refresh'));
      }
      await fetchFeed();
    });
  }

  return (
    <div className="space-y-4">
      <Card
        title="Notifications Hub"
        subtitle="Enrollment, billing, and operations updates for your family"
        className="glass-shell"
        actions={
          <Button size="sm" variant="outline" onClick={markAllRead} disabled={unreadCount === 0} isLoading={isPending} loadingText="Updating">
            Mark all as read
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-field border border-line bg-white px-3.5 py-2 text-sm text-ink-700 shadow-sm">
              {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}.
            </div>
            <div className="rounded-field border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 shadow-sm">
              Red: billing and payment reminders
            </div>
            <div className="rounded-field border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-700 shadow-sm">
              Green: messages from admins
            </div>
            <div className="rounded-field border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-medium text-sky-700 shadow-sm">
              Blue: enrollment updates
            </div>
          </div>

          <div data-tour-id="parent-notifications-filters">
            <NotificationFilterTabs
              type={typeFilter}
              status={statusFilter}
              onTypeChange={setTypeFilter}
              onStatusChange={setStatusFilter}
            />
          </div>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <div className="list-scroll space-y-2" data-tour-id="parent-notifications-list">
            {isLoading ? (
              <p className="text-sm text-ink-600">Loading notifications...</p>
            ) : items.length ? (
              items.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  onMarkRead={markOneRead}
                  isMarkingRead={Boolean(markingId === item.id && isPending)}
                />
              ))
            ) : (
              <div className="rounded-field border border-dashed border-line bg-white px-4 py-6 text-center text-sm text-ink-600">
                <p className="inline-flex items-center gap-2">
                  <BellRing className="h-4 w-4" />
                  No notifications match the current filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
