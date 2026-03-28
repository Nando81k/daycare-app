'use client';

import { useMemo, useState, useTransition } from 'react';
import { Button, Input, Select } from '@/components/ui';

type Cadence = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

interface PlanOption {
  id: string;
  name: string;
  programType: 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K' | null;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
  isActive: boolean;
}

interface ContractPricingEditorProps {
  contractId: string;
  tuitionPlanId: string;
  billingCadence: Cadence;
  recurringAmountCents: number;
  plans: PlanOption[];
}

function centsToUsd(cents: number) {
  return (cents / 100).toFixed(2);
}

function usdToCents(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

function classLabel(programType: PlanOption['programType']) {
  if (programType === 'INFANT') return 'Infant';
  if (programType === 'TODDLER') return 'Toddler';
  if (programType === 'PRESCHOOL') return 'Preschool';
  if (programType === 'PRE_K') return 'Pre-K';
  return 'General';
}

function getAllowedCadences(plan: PlanOption | undefined) {
  if (!plan) return [] as Cadence[];
  const allowed: Cadence[] = [];
  if (plan.allowMonthly) allowed.push('MONTHLY');
  if (plan.allowBiweekly) allowed.push('BIWEEKLY');
  if (plan.allowWeekly) allowed.push('WEEKLY');
  return allowed;
}

export function ContractPricingEditor({
  contractId,
  tuitionPlanId,
  billingCadence,
  recurringAmountCents,
  plans,
}: ContractPricingEditorProps) {
  const [planId, setPlanId] = useState(tuitionPlanId);
  const [cadence, setCadence] = useState<Cadence>(billingCadence);
  const [recurringUsd, setRecurringUsd] = useState(centsToUsd(recurringAmountCents));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive || plan.id === tuitionPlanId),
    [plans, tuitionPlanId],
  );
  const selectedPlan = useMemo(() => activePlans.find((plan) => plan.id === planId), [activePlans, planId]);
  const allowedCadences = useMemo(() => getAllowedCadences(selectedPlan), [selectedPlan]);

  function save() {
    setError('');
    setNotice('');

    if (!selectedPlan) {
      setError('Select a valid tuition plan.');
      return;
    }
    if (!allowedCadences.includes(cadence)) {
      setError('Selected cadence is not allowed for this class plan.');
      return;
    }
    const recurringAmount = usdToCents(recurringUsd);
    if (recurringAmount === null) {
      setError('Enter a valid recurring amount in USD.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/v3/admin/billing/contracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: contractId,
          tuitionPlanId: planId,
          billingCadence: cadence,
          recurringAmountCents: recurringAmount,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update child pricing.');
        return;
      }

      setNotice('Pricing updated.');
      setTimeout(() => window.location.reload(), 400);
    });
  }

  return (
    <div className="mt-2 space-y-2 rounded-field border border-line bg-bg-soft p-2.5">
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          label="Class plan"
          value={planId}
          onChange={(event) => {
            const nextPlanId = event.target.value;
            const nextPlan = activePlans.find((plan) => plan.id === nextPlanId);
            const nextAllowed = getAllowedCadences(nextPlan);
            setPlanId(nextPlanId);
            if (nextAllowed.length && !nextAllowed.includes(cadence)) {
              setCadence(nextAllowed[0]);
            }
          }}
        >
          {activePlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} ({classLabel(plan.programType)})
            </option>
          ))}
        </Select>

        <Select
          label="Cadence"
          value={cadence}
          onChange={(event) => setCadence(event.target.value as Cadence)}
        >
          {allowedCadences.map((value) => (
            <option key={value} value={value}>
              {value === 'MONTHLY' ? 'Monthly' : value === 'BIWEEKLY' ? 'Biweekly' : 'Weekly'}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Input
          label="Recurring charge (USD per cycle)"
          type="number"
          step="0.01"
          min={0}
          value={recurringUsd}
          onChange={(event) => setRecurringUsd(event.target.value)}
        />
        <Button size="sm" variant="outline" onClick={save} isLoading={isPending} loadingText="Saving">
          Save child pricing
        </Button>
      </div>

      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      {notice ? <p className="text-xs font-medium text-emerald-600">{notice}</p> : null}
    </div>
  );
}
