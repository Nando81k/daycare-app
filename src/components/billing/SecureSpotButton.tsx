'use client';

import { useState, useTransition } from 'react';
import { Button, Select } from '@/components/ui';

type Cadence = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

interface Props {
  enrollmentId: string;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
}

export function SecureSpotButton({ enrollmentId, allowMonthly, allowBiweekly, allowWeekly }: Props) {
  const defaults: Cadence[] = [];
  if (allowMonthly) defaults.push('MONTHLY');
  if (allowBiweekly) defaults.push('BIWEEKLY');
  if (allowWeekly) defaults.push('WEEKLY');

  const [cadence, setCadence] = useState<Cadence>(defaults[0] || 'MONTHLY');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function startCheckout() {
    setError('');

    startTransition(async () => {
      const response = await fetch(`/api/v3/parent/family/enrollments/${enrollmentId}/secure-spot-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCadence: cadence }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to start secure seat checkout');
        return;
      }

      if (!payload?.url) {
        setError('Checkout URL missing from response');
        return;
      }

      window.location.href = payload.url;
    });
  }

  if (!defaults.length) {
    return <p className="text-sm text-amber-700">No payment cadence is currently enabled for this program. Contact billing.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Select label="Tuition cadence" value={cadence} onChange={(event) => setCadence(event.target.value as Cadence)}>
          {allowMonthly ? <option value="MONTHLY">Monthly</option> : null}
          {allowBiweekly ? <option value="BIWEEKLY">Biweekly</option> : null}
          {allowWeekly ? <option value="WEEKLY">Weekly</option> : null}
        </Select>
        <Button
          size="lg"
          className="px-8"
          onClick={startCheckout}
          isLoading={isPending}
          loadingText="Opening checkout"
        >
          Secure Spot
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-ink-500">Registration fee and first tuition are charged now. Autopay is enabled by default.</p>
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
