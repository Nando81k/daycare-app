'use client';

import { useState, useTransition } from 'react';
import { Button, Select } from '@/components/ui';

type Cadence = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

interface Props {
  contractId: string;
  cadence: Cadence;
}

export function ContractCadenceSelect({ contractId, cadence }: Props) {
  const [value, setValue] = useState<Cadence>(cadence);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function save() {
    setError('');
    startTransition(async () => {
      const response = await fetch(`/api/v3/admin/billing/contracts/${contractId}/cadence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCadence: value }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error?.message || 'Unable to update cadence');
        return;
      }

      window.location.reload();
    });
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Select value={value} onChange={(event) => setValue(event.target.value as Cadence)} className="h-8 w-32 px-2.5 py-1 text-xs">
          <option value="MONTHLY">Monthly</option>
          <option value="BIWEEKLY">Biweekly</option>
          <option value="WEEKLY">Weekly</option>
        </Select>
        <Button size="sm" variant="outline" onClick={save} isLoading={isPending} loadingText="...">
          Update
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
