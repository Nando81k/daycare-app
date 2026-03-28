'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
} from '@/components/ui';

type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K' | null;

interface PlanRow {
  id: string;
  name: string;
  programType: ProgramType;
  monthlyAmountCents: number;
  registrationFeeCents: number;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
  isActive: boolean;
}

interface EditablePlanRow {
  id: string;
  name: string;
  programType: ProgramType;
  monthlyAmountUsd: string;
  registrationFeeUsd: string;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
  isActive: boolean;
}

interface NewPlanForm {
  name: string;
  programType: ProgramType;
  monthlyAmountUsd: string;
  registrationFeeUsd: string;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
  isActive: boolean;
}

const PROGRAM_ORDER: ProgramType[] = ['INFANT', 'TODDLER', 'PRESCHOOL', 'PRE_K', null];

function centsToUsd(cents: number) {
  return (cents / 100).toFixed(2);
}

function usdToCents(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function programLabel(programType: ProgramType) {
  if (programType === 'INFANT') return 'Infant';
  if (programType === 'TODDLER') return 'Toddler';
  if (programType === 'PRESCHOOL') return 'Preschool';
  if (programType === 'PRE_K') return 'Pre-K';
  return 'General fallback';
}

function programSortValue(programType: ProgramType) {
  const index = PROGRAM_ORDER.findIndex((value) => value === programType);
  return index === -1 ? PROGRAM_ORDER.length : index;
}

function formatUsdDisplay(value: string) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numeric);
}

function toEditablePlan(plan: PlanRow): EditablePlanRow {
  return {
    id: plan.id,
    name: plan.name,
    programType: plan.programType,
    monthlyAmountUsd: centsToUsd(plan.monthlyAmountCents),
    registrationFeeUsd: centsToUsd(plan.registrationFeeCents),
    allowMonthly: plan.allowMonthly,
    allowBiweekly: plan.allowBiweekly,
    allowWeekly: plan.allowWeekly,
    isActive: plan.isActive,
  };
}

const INITIAL_NEW_PLAN: NewPlanForm = {
  name: '',
  programType: null,
  monthlyAmountUsd: '',
  registrationFeeUsd: '0.00',
  allowMonthly: true,
  allowBiweekly: false,
  allowWeekly: false,
  isActive: true,
};

export function TuitionPlansManager({ initialPlans }: { initialPlans: PlanRow[] }) {
  const [plans, setPlans] = useState<EditablePlanRow[]>(() => initialPlans.map(toEditablePlan));
  const [newPlan, setNewPlan] = useState<NewPlanForm>(INITIAL_NEW_PLAN);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<EditablePlanRow | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  const sortedPlans = useMemo(
    () =>
      [...plans].sort(
        (a, b) => programSortValue(a.programType) - programSortValue(b.programType) || a.name.localeCompare(b.name),
      ),
    [plans],
  );

  function updatePlanRow(id: string, patch: Partial<EditablePlanRow>) {
    setPlans((prev) => prev.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));
  }

  function validateCadenceFlags(flags: Pick<EditablePlanRow, 'allowMonthly' | 'allowBiweekly' | 'allowWeekly'>) {
    return flags.allowMonthly || flags.allowBiweekly || flags.allowWeekly;
  }

  function savePlan(plan: EditablePlanRow, onSuccess?: () => void) {
    setError('');
    setNotice('');

    const monthlyAmountCents = usdToCents(plan.monthlyAmountUsd);
    const registrationFeeCents = usdToCents(plan.registrationFeeUsd);

    if (!plan.name.trim()) {
      setError('Each plan needs a name.');
      return;
    }
    if (monthlyAmountCents === null || monthlyAmountCents <= 0) {
      setError(`Enter a valid monthly tuition for ${plan.name || 'this plan'}.`);
      return;
    }
    if (registrationFeeCents === null) {
      setError(`Enter a valid registration fee for ${plan.name || 'this plan'}.`);
      return;
    }
    if (!validateCadenceFlags(plan)) {
      setError(`Enable at least one billing cadence for ${plan.name || 'this plan'}.`);
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/v3/admin/billing/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: plan.id,
          name: plan.name.trim(),
          programType: plan.programType,
          monthlyAmountCents,
          registrationFeeCents,
          allowMonthly: plan.allowMonthly,
          allowBiweekly: plan.allowBiweekly,
          allowWeekly: plan.allowWeekly,
          isActive: plan.isActive,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update tuition plan.');
        return;
      }

      const updated = payload?.plan as PlanRow | undefined;
      if (updated) {
        updatePlanRow(plan.id, toEditablePlan(updated));
      }
      setNotice(`Updated ${plan.name}.`);
      onSuccess?.();
    });
  }

  function createPlan() {
    setError('');
    setNotice('');

    const monthlyAmountCents = usdToCents(newPlan.monthlyAmountUsd);
    const registrationFeeCents = usdToCents(newPlan.registrationFeeUsd);

    if (!newPlan.name.trim()) {
      setError('Enter a plan name before creating it.');
      return;
    }
    if (monthlyAmountCents === null || monthlyAmountCents <= 0) {
      setError('Enter a valid monthly tuition amount for the new plan.');
      return;
    }
    if (registrationFeeCents === null) {
      setError('Enter a valid registration fee for the new plan.');
      return;
    }
    if (!validateCadenceFlags(newPlan)) {
      setError('Enable at least one cadence option for the new plan.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/v3/admin/billing/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlan.name.trim(),
          programType: newPlan.programType,
          monthlyAmountCents,
          registrationFeeCents,
          allowMonthly: newPlan.allowMonthly,
          allowBiweekly: newPlan.allowBiweekly,
          allowWeekly: newPlan.allowWeekly,
          isActive: newPlan.isActive,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to create tuition plan.');
        return;
      }

      const created = payload?.plan as PlanRow | undefined;
      if (created) {
        setPlans((prev) => [...prev, toEditablePlan(created)]);
      }
      setNewPlan(INITIAL_NEW_PLAN);
      setIsCreateOpen(false);
      setNotice('New class pricing plan created.');
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="rounded-field border border-line bg-bg-soft px-3 py-2 text-sm text-ink-700">
          Control what parents pay by class. These plan prices drive secure-spot checkout and default recurring tuition.
        </p>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setError('');
              }}
            >
              Create New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[min(95vw,56rem)] max-w-[56rem]">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>
                Set tuition, registration fee, and billing cadence options for a class pricing plan.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[58vh] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="Plan name"
                  placeholder="Infant Full-Time"
                  value={newPlan.name}
                  onChange={(event) => setNewPlan((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Select
                  label="Class"
                  value={newPlan.programType ?? 'GENERAL'}
                  onChange={(event) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      programType: event.target.value === 'GENERAL' ? null : (event.target.value as ProgramType),
                    }))
                  }
                >
                  <option value="GENERAL">General fallback</option>
                  <option value="INFANT">Infant</option>
                  <option value="TODDLER">Toddler</option>
                  <option value="PRESCHOOL">Preschool</option>
                  <option value="PRE_K">Pre-K</option>
                </Select>
                <Input
                  label="Monthly tuition (USD)"
                  type="number"
                  step="0.01"
                  min={0}
                  value={newPlan.monthlyAmountUsd}
                  onChange={(event) => setNewPlan((prev) => ({ ...prev, monthlyAmountUsd: event.target.value }))}
                />
                <Input
                  label="Registration fee (USD)"
                  type="number"
                  step="0.01"
                  min={0}
                  value={newPlan.registrationFeeUsd}
                  onChange={(event) => setNewPlan((prev) => ({ ...prev, registrationFeeUsd: event.target.value }))}
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-ink-700">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.allowMonthly}
                    onChange={(event) => setNewPlan((prev) => ({ ...prev, allowMonthly: event.target.checked }))}
                  />
                  Monthly
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.allowBiweekly}
                    onChange={(event) => setNewPlan((prev) => ({ ...prev, allowBiweekly: event.target.checked }))}
                  />
                  Biweekly
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.allowWeekly}
                    onChange={(event) => setNewPlan((prev) => ({ ...prev, allowWeekly: event.target.checked }))}
                  />
                  Weekly
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.isActive}
                    onChange={(event) => setNewPlan((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active
                </label>
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

            <DialogFooter className="justify-between border-t border-line/70">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsCreateOpen(false);
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button size="md" onClick={createPlan} isLoading={isPending} loadingText="Creating">
                Create New Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-[min(95vw,56rem)] max-w-[56rem]">
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
              <DialogDescription>Update pricing, cadence, and class mapping for this tuition plan.</DialogDescription>
            </DialogHeader>

            {editDraft ? (
              <div className="max-h-[58vh] overflow-y-auto pr-1">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Plan name"
                    value={editDraft.name}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                    }
                  />
                  <Select
                    label="Class"
                    value={editDraft.programType ?? 'GENERAL'}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              programType: event.target.value === 'GENERAL' ? null : (event.target.value as ProgramType),
                            }
                          : prev,
                      )
                    }
                  >
                    <option value="GENERAL">General fallback</option>
                    <option value="INFANT">Infant</option>
                    <option value="TODDLER">Toddler</option>
                    <option value="PRESCHOOL">Preschool</option>
                    <option value="PRE_K">Pre-K</option>
                  </Select>
                  <Input
                    label="Monthly tuition (USD)"
                    type="number"
                    step="0.01"
                    min={0}
                    value={editDraft.monthlyAmountUsd}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, monthlyAmountUsd: event.target.value } : prev))
                    }
                  />
                  <Input
                    label="Registration fee (USD)"
                    type="number"
                    step="0.01"
                    min={0}
                    value={editDraft.registrationFeeUsd}
                    onChange={(event) =>
                      setEditDraft((prev) => (prev ? { ...prev, registrationFeeUsd: event.target.value } : prev))
                    }
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-ink-700">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editDraft.allowMonthly}
                      onChange={(event) =>
                        setEditDraft((prev) => (prev ? { ...prev, allowMonthly: event.target.checked } : prev))
                      }
                    />
                    Monthly
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editDraft.allowBiweekly}
                      onChange={(event) =>
                        setEditDraft((prev) => (prev ? { ...prev, allowBiweekly: event.target.checked } : prev))
                      }
                    />
                    Biweekly
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editDraft.allowWeekly}
                      onChange={(event) =>
                        setEditDraft((prev) => (prev ? { ...prev, allowWeekly: event.target.checked } : prev))
                      }
                    />
                    Weekly
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editDraft.isActive}
                      onChange={(event) =>
                        setEditDraft((prev) => (prev ? { ...prev, isActive: event.target.checked } : prev))
                      }
                    />
                    Active
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-600">Select a plan to edit.</p>
            )}

            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

            <DialogFooter className="justify-between border-t border-line/70">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditDraft(null);
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="md"
                onClick={() => {
                  if (!editDraft) return;
                  savePlan(editDraft, () => {
                    setIsEditOpen(false);
                    setEditDraft(null);
                  });
                }}
                isLoading={isPending}
                loadingText="Saving"
                disabled={!editDraft}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="list-scroll space-y-2.5 pr-1">
        {sortedPlans.map((plan) => (
          <article key={plan.id} className="rounded-field border border-line bg-white px-3 py-3 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink-900">{plan.name}</p>
                <Badge variant="info">{programLabel(plan.programType)}</Badge>
                <Badge variant={plan.isActive ? 'success' : 'warning'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setError('');
                  setEditDraft(plan);
                  setIsEditOpen(true);
                }}
              >
                Edit Plan
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-field border border-line/80 bg-bg-soft/55 px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Monthly tuition</p>
                <p className="text-sm font-semibold text-ink-900">{formatUsdDisplay(plan.monthlyAmountUsd)}</p>
              </div>
              <div className="rounded-field border border-line/80 bg-bg-soft/55 px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Registration fee</p>
                <p className="text-sm font-semibold text-ink-900">{formatUsdDisplay(plan.registrationFeeUsd)}</p>
              </div>
              <div className="rounded-field border border-line/80 bg-bg-soft/55 px-2.5 py-2 sm:col-span-2 lg:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.08em] text-ink-500">Cadence options</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {plan.allowMonthly ? <Badge variant="default">Monthly</Badge> : null}
                  {plan.allowBiweekly ? <Badge variant="default">Biweekly</Badge> : null}
                  {plan.allowWeekly ? <Badge variant="default">Weekly</Badge> : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {error && !isCreateOpen && !isEditOpen ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      {notice ? <p className="text-sm font-medium text-emerald-600">{notice}</p> : null}
    </div>
  );
}
