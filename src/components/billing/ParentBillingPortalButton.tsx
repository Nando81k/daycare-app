'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button } from '@/components/ui';

type PortalStatus = {
  enabled: boolean;
  code: 'READY' | 'STRIPE_NOT_CONFIGURED' | 'STRIPE_AUTH_FAILED' | 'PORTAL_CONFIG_MISSING' | 'UNAVAILABLE';
  message: string;
  checkedAt: string;
};

export function ParentBillingPortalButton() {
  const router = useRouter();
  const [status, setStatus] = useState<PortalStatus | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const response = await fetch('/api/v3/parent/billing/portal-status', { cache: 'no-store' });
      const payload = await response.json().catch(() => null);

      if (!mounted) return;

      if (!response.ok || !payload) {
        setStatus({
          enabled: false,
          code: 'UNAVAILABLE',
          message: 'Billing portal is temporarily unavailable. Please try again later.',
          checkedAt: new Date().toISOString(),
        });
        return;
      }

      setStatus(payload as PortalStatus);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function openPortal() {
    setError('');

    startTransition(async () => {
      const response = await fetch('/api/v3/parent/billing/portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: '/dashboard/billing' }),
      });

      if (response.status === 401) {
        router.push('/login?callbackUrl=/dashboard/billing');
        return;
      }

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to open billing portal');
        return;
      }

      if (!payload?.url) {
        setError('Portal URL is missing from response.');
        return;
      }

      window.location.href = payload.url;
    });
  }

  const enabled = status?.enabled ?? false;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={enabled ? 'success' : 'warning'}>{enabled ? 'Portal Available' : 'Portal Unavailable'}</Badge>
        <span className="text-sm text-ink-600">{status?.message || 'Checking billing portal status...'}</span>
      </div>

      <Button variant="outline" onClick={openPortal} disabled={!enabled} isLoading={isPending} loadingText="Opening portal">
        Open Secure Billing Portal
      </Button>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
