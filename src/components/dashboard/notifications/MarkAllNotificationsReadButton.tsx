'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface MarkAllNotificationsReadButtonProps {
  unreadCount: number;
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function MarkAllNotificationsReadButton({
  unreadCount,
  size = 'sm',
}: MarkAllNotificationsReadButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function markAllRead() {
    setError('');
    startTransition(async () => {
      const response = await fetch('/api/v3/parent/notifications/read-all', {
        method: 'PATCH',
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to mark notifications as read');
        return;
      }

      window.dispatchEvent(new Event('ac:sidebar-counts-refresh'));
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5">
      <Button
        size={size}
        variant="outline"
        onClick={markAllRead}
        isLoading={isPending}
        loadingText="Updating"
        disabled={unreadCount === 0}
      >
        Mark All Read
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
