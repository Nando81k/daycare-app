'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Select } from '@/components/ui';

interface Policy {
  graceDays: number;
  lateFeeCents: number;
  pauseAfterDaysPastDue: number;
  reminderOffsets: number[];
  holdHours: number;
}

type ReminderPresetKey = 'STANDARD' | 'GENTLE' | 'URGENT' | 'CUSTOM';
type ReminderUnit = 'DAYS_BEFORE' | 'DUE_DATE_MORNING';

interface ReminderRule {
  amount: number;
  unit: ReminderUnit;
}

const REMINDER_PRESETS: Array<{ key: Exclude<ReminderPresetKey, 'CUSTOM'>; label: string; offsets: number[] }> = [
  { key: 'STANDARD', label: 'Standard (7 days, 3 days, due-date morning)', offsets: [7, 3, 0] },
  { key: 'GENTLE', label: 'Gentle (10 days, 5 days, due-date morning)', offsets: [10, 5, 0] },
  { key: 'URGENT', label: 'Urgent (3 days, 1 day, due-date morning)', offsets: [3, 1, 0] },
];

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function normalizeOffsets(offsets: number[]) {
  return Array.from(
    new Set(
      offsets
        .map((value) => Math.max(0, Math.round(value)))
        .filter((value) => Number.isFinite(value)),
    ),
  ).sort((a, b) => b - a);
}

function sameOffsets(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function detectPreset(offsets: number[]): ReminderPresetKey {
  for (const preset of REMINDER_PRESETS) {
    if (sameOffsets(offsets, preset.offsets)) {
      return preset.key;
    }
  }
  return 'CUSTOM';
}

function rulesFromOffsets(offsets: number[]): ReminderRule[] {
  const normalized = normalizeOffsets(offsets);
  if (!normalized.length) {
    return [{ amount: 7, unit: 'DAYS_BEFORE' }, { amount: 0, unit: 'DUE_DATE_MORNING' }];
  }

  return normalized.map((offset) => {
    if (offset === 0) return { amount: 0, unit: 'DUE_DATE_MORNING' as const };
    return { amount: offset, unit: 'DAYS_BEFORE' as const };
  });
}

function offsetsFromRules(rules: ReminderRule[]) {
  const offsets = rules.map((rule) => (rule.unit === 'DUE_DATE_MORNING' ? 0 : Math.max(0, Math.round(rule.amount))));
  return normalizeOffsets(offsets);
}

export function BillingPolicyForm({ policy }: { policy: Policy }) {
  const initialOffsets = normalizeOffsets(policy.reminderOffsets.length ? policy.reminderOffsets : [7, 3, 0]);
  const initialPreset = detectPreset(initialOffsets);

  const [state, setState] = useState({
    ...policy,
    reminderOffsets: initialOffsets,
    lateFeeDollars: centsToDollars(policy.lateFeeCents),
  });
  const [preset, setPreset] = useState<ReminderPresetKey>(initialPreset);
  const [customRules, setCustomRules] = useState<ReminderRule[]>(rulesFromOffsets(initialOffsets));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  function applyCustomRules(nextRules: ReminderRule[]) {
    setCustomRules(nextRules);
    setState((prev) => ({ ...prev, reminderOffsets: offsetsFromRules(nextRules) }));
  }

  function onPresetChange(nextPreset: ReminderPresetKey) {
    setPreset(nextPreset);
    if (nextPreset === 'CUSTOM') {
      return;
    }
    const selected = REMINDER_PRESETS.find((presetItem) => presetItem.key === nextPreset);
    if (!selected) return;
    setState((prev) => ({ ...prev, reminderOffsets: selected.offsets }));
    setCustomRules(rulesFromOffsets(selected.offsets));
  }

  function save() {
    setError('');
    setNotice('');

    const lateFeeCents = dollarsToCents(state.lateFeeDollars);
    if (lateFeeCents === null) {
      setError('Enter a valid late fee in USD (for example: 25 or 25.00).');
      return;
    }
    if (!state.reminderOffsets.length) {
      setError('Add at least one reminder timing.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/v3/admin/billing/policy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graceDays: state.graceDays,
          lateFeeCents,
          pauseAfterDaysPastDue: state.pauseAfterDaysPastDue,
          reminderOffsets: state.reminderOffsets,
          holdHours: state.holdHours,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update billing policy');
        return;
      }

      setNotice('Billing policy updated.');
      setTimeout(() => window.location.reload(), 500);
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-field border border-line bg-bg-soft px-3 py-2 text-sm text-ink-700">
        Set center-wide collections rules. Tuition pricing is managed in class plans.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Grace Days"
          type="number"
          min={0}
          max={30}
          value={String(state.graceDays)}
          onChange={(event) => setState((prev) => ({ ...prev, graceDays: Number(event.target.value) }))}
        />
        <Input
          label="Late Fee (USD)"
          type="number"
          step="0.01"
          min={0}
          value={state.lateFeeDollars}
          onChange={(event) => setState((prev) => ({ ...prev, lateFeeDollars: event.target.value }))}
          helpText="Flat fee applied once after grace period."
        />
        <Input
          label="Pause Threshold (Days Past Due)"
          type="number"
          min={1}
          max={90}
          value={String(state.pauseAfterDaysPastDue)}
          onChange={(event) => setState((prev) => ({ ...prev, pauseAfterDaysPastDue: Number(event.target.value) }))}
        />
        <Input
          label="Seat Hold Hours"
          type="number"
          min={1}
          max={72}
          value={String(state.holdHours)}
          onChange={(event) => setState((prev) => ({ ...prev, holdHours: Number(event.target.value) }))}
        />
        <Select
          label="Reminder schedule"
          value={preset}
          onChange={(event) => onPresetChange(event.target.value as ReminderPresetKey)}
          helpText="Choose a preset or build your own reminders with explicit units."
        >
          {REMINDER_PRESETS.map((presetOption) => (
            <option key={presetOption.key} value={presetOption.key}>
              {presetOption.label}
            </option>
          ))}
          <option value="CUSTOM">Custom schedule</option>
        </Select>
      </div>

      {preset === 'CUSTOM' ? (
        <div className="rounded-field border border-line bg-white px-3 py-3">
          <p className="text-sm font-semibold text-ink-900">Custom reminders</p>
          <p className="mt-1 text-xs text-ink-600">Set reminder timings using clear units.</p>

          <div className="mt-3 space-y-2">
            {customRules.map((rule, index) => (
              <div key={`${index}-${rule.unit}`} className="grid gap-2 sm:grid-cols-[8.5rem_1fr_auto] sm:items-end">
                <Input
                  label={index === 0 ? 'When' : undefined}
                  type="number"
                  min={0}
                  value={String(rule.amount)}
                  disabled={rule.unit === 'DUE_DATE_MORNING'}
                  onChange={(event) => {
                    const amount = Number(event.target.value);
                    const nextRules = [...customRules];
                    nextRules[index] = { ...rule, amount: Number.isFinite(amount) ? amount : 0 };
                    applyCustomRules(nextRules);
                  }}
                />
                <Select
                  label={index === 0 ? 'Unit' : undefined}
                  value={rule.unit}
                  onChange={(event) => {
                    const unit = event.target.value as ReminderUnit;
                    const nextRules = [...customRules];
                    nextRules[index] = {
                      amount: unit === 'DUE_DATE_MORNING' ? 0 : Math.max(1, rule.amount || 1),
                      unit,
                    };
                    applyCustomRules(nextRules);
                  }}
                >
                  <option value="DAYS_BEFORE">Days before due date</option>
                  <option value="DUE_DATE_MORNING">Due-date morning</option>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="sm:mb-[2px]"
                  onClick={() => {
                    const nextRules = customRules.filter((_, itemIndex) => itemIndex !== index);
                    applyCustomRules(nextRules.length ? nextRules : [{ amount: 7, unit: 'DAYS_BEFORE' }]);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() =>
              applyCustomRules([...customRules, { amount: 1, unit: 'DAYS_BEFORE' }])
            }
          >
            Add reminder
          </Button>
        </div>
      ) : (
        <p className="rounded-field border border-line bg-bg-soft px-3 py-2 text-sm text-ink-700">
          Active reminders: {state.reminderOffsets.map((offset) => (offset === 0 ? 'Due-date morning' : `${offset} day(s) before`)).join(', ')}
        </p>
      )}

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      {notice ? <p className="text-sm font-medium text-emerald-600">{notice}</p> : null}

      <Button onClick={save} isLoading={isPending} loadingText="Saving" className="px-6">
        Save Policy
      </Button>
    </div>
  );
}
