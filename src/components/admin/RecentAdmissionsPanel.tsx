'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/format';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'DENIED' | 'REQUEST_INFO';
type DateLike = Date | string;

interface RecentAdmission {
  id: string;
  intakeBatchId?: string | null;
  status: EnrollmentStatus;
  programType: 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';
  startDate: DateLike | null;
  notes: string | null;
  reviewNotes: string | null;
  decisionReason: string | null;
  createdAt: DateLike;
  updatedAt: DateLike;
  child: {
    firstName: string;
    lastName: string;
    dateOfBirth: DateLike;
    allergies: string | null;
    medicalNotes: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
  parent: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AdmissionGroup {
  key: string;
  items: RecentAdmission[];
  submittedAt: DateLike;
  parent: RecentAdmission['parent'];
}

function statusVariant(status: EnrollmentStatus): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'APPROVED') return 'success';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO') return 'warning';
  if (status === 'DENIED') return 'danger';
  if (status === 'PENDING') return 'info';
  return 'default';
}

function toDateInputValue(value: DateLike | null) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDateTime(value: DateLike | null) {
  if (!value) return null;
  if (typeof value === 'string') {
    return value.includes('T') ? value : new Date(value).toISOString();
  }
  return value.toISOString();
}

function statusSummary(items: RecentAdmission[]) {
  const counts = items.reduce<Record<EnrollmentStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      PENDING: 0,
      APPROVED: 0,
      WAITLISTED: 0,
      DENIED: 0,
      REQUEST_INFO: 0,
    },
  );

  return (Object.entries(counts) as Array<[EnrollmentStatus, number]>).filter(([, count]) => count > 0);
}

interface RecentAdmissionsPanelProps {
  admissions: RecentAdmission[];
  canManageAdmissions: boolean;
}

export function RecentAdmissionsPanel({ admissions, canManageAdmissions }: RecentAdmissionsPanelProps) {
  const [rows, setRows] = useState(admissions);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRows(admissions);
  }, [admissions]);

  const groups = useMemo<AdmissionGroup[]>(() => {
    const map = new Map<string, RecentAdmission[]>();
    for (const row of rows) {
      if (row.status === 'APPROVED') continue;
      const key = row.intakeBatchId ? `batch:${row.intakeBatchId}` : `single:${row.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }

    return Array.from(map.entries())
      .map(([key, items]) => {
        const sortedItems = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return {
          key,
          items: sortedItems,
          submittedAt: sortedItems[0]?.createdAt || new Date().toISOString(),
          parent: sortedItems[0].parent,
        };
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [rows]);

  const groupKeyByEnrollment = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of groups) {
      for (const item of group.items) {
        map.set(item.id, group.key);
      }
    }
    return map;
  }, [groups]);

  const activeGroup = useMemo(
    () => (activeGroupKey ? groups.find((group) => group.key === activeGroupKey) ?? null : null),
    [activeGroupKey, groups],
  );

  const selected = useMemo(() => {
    if (!activeGroup) return null;
    if (selectedEnrollmentId) {
      const found = activeGroup.items.find((item) => item.id === selectedEnrollmentId);
      if (found) return found;
    }
    return activeGroup.items[0] ?? null;
  }, [activeGroup, selectedEnrollmentId]);

  useEffect(() => {
    if (!activeGroupKey) return;
    if (groups.some((group) => group.key === activeGroupKey)) return;
    setActiveGroupKey(null);
    setSelectedEnrollmentId(null);
  }, [groups, activeGroupKey]);

  useEffect(() => {
    if (!selected) return;
    setReviewNotes(selected.reviewNotes || '');
    setDecisionReason(selected.decisionReason || '');
    setStartDate(toDateInputValue(selected.startDate));
    setError('');
    setSuccess('');
  }, [selected]);

  function updateRow(updated: RecentAdmission) {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  function openGroup(group: AdmissionGroup) {
    setActiveGroupKey(group.key);
    setSelectedEnrollmentId(group.items[0]?.id ?? null);
    setError('');
    setSuccess('');
  }

  async function submitDecision(target: RecentAdmission, status: 'APPROVED' | 'DENIED', options?: { quick?: boolean }) {
    const quick = options?.quick ?? false;
    const nextReviewNotes = quick
      ? status === 'APPROVED'
        ? 'Approved from admin overview.'
        : 'Denied from admin overview.'
      : reviewNotes.trim();
    const nextReason = quick ? null : decisionReason.trim() || null;
    const nextStartDate = quick ? toIsoDateTime(target.startDate) : startDate ? new Date(startDate).toISOString() : null;

    if (status === 'APPROVED' && !nextStartDate) {
      const groupKey = groupKeyByEnrollment.get(target.id);
      if (groupKey) {
        setActiveGroupKey(groupKey);
        setSelectedEnrollmentId(target.id);
      }
      setError('Start date is required before approving this application.');
      return;
    }
    if (!nextReviewNotes || nextReviewNotes.length < 2) {
      setError('Review notes are required and must be at least 2 characters.');
      return;
    }

    setError('');
    setSuccess('');

    startTransition(async () => {
      const response = await fetch(`/api/v3/admin/admissions/${target.id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: nextReviewNotes,
          decisionReason: nextReason,
          startDate: nextStartDate,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update admissions decision.');
        return;
      }

      const updatedEnrollment = payload?.enrollment;
      if (!updatedEnrollment) {
        setError('Decision saved but no updated row was returned.');
        return;
      }

      updateRow({
        id: updatedEnrollment.id,
        intakeBatchId: updatedEnrollment.intakeBatchId,
        status: updatedEnrollment.status,
        programType: updatedEnrollment.programType,
        startDate: updatedEnrollment.startDate,
        notes: updatedEnrollment.notes,
        reviewNotes: updatedEnrollment.reviewNotes,
        decisionReason: updatedEnrollment.decisionReason,
        createdAt: updatedEnrollment.createdAt,
        updatedAt: updatedEnrollment.updatedAt,
        child: {
          firstName: updatedEnrollment.child.firstName,
          lastName: updatedEnrollment.child.lastName,
          dateOfBirth: updatedEnrollment.child.dateOfBirth,
          allergies: updatedEnrollment.child.allergies,
          medicalNotes: updatedEnrollment.child.medicalNotes,
          emergencyContactName: updatedEnrollment.child.emergencyContactName,
          emergencyContactPhone: updatedEnrollment.child.emergencyContactPhone,
        },
        parent: {
          firstName: updatedEnrollment.parent.firstName,
          lastName: updatedEnrollment.parent.lastName,
          email: updatedEnrollment.parent.email,
        },
      });

      if (quick) {
        setSuccess(
          `${target.child.firstName} ${target.child.lastName} marked ${status === 'APPROVED' ? 'Approved' : 'Denied'}.`,
        );
        return;
      }

      setSuccess('Decision saved.');
    });
  }

  return (
    <div className="space-y-3 list-scroll">
      {error ? <p className="rounded-field border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p> : null}

      {groups.length ? (
        groups.map((group) => {
          const childrenText = group.items.map((item) => `${item.child.firstName} ${item.child.lastName}`);
          const visibleChildren = childrenText.slice(0, 3);
          const remaining = childrenText.length - visibleChildren.length;
          const single = group.items.length === 1 ? group.items[0] : null;
          const statuses = statusSummary(group.items);

          return (
            <article key={group.key} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink-900">
                  {group.parent.firstName} {group.parent.lastName}
                </p>
                <span className="text-xs font-medium text-ink-600">
                  {group.items.length} child{group.items.length === 1 ? '' : 'ren'}
                </span>
              </div>
              <p className="text-sm text-ink-600">{group.parent.email}</p>
              <p className="mt-1 text-xs text-ink-500">
                {visibleChildren.join(', ')}
                {remaining > 0 ? ` +${remaining} more` : ''}
              </p>
              <p className="mt-1 text-xs text-ink-500">Submitted {formatDateTime(group.submittedAt)}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                {statuses.map(([status, count]) => (
                  <Badge key={status} variant={statusVariant(status)}>
                    {count} {status.replace('_', ' ')}
                  </Badge>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4"
                  onClick={() => openGroup(group)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View details
                </Button>
                {canManageAdmissions && single ? (
                  <>
                    <Button
                      size="sm"
                      className="px-4"
                      disabled={!toIsoDateTime(single.startDate)}
                      title={!toIsoDateTime(single.startDate) ? 'Preferred start date is missing. Open details to set one.' : undefined}
                      onClick={() => {
                        void submitDecision(single, 'APPROVED', { quick: true });
                      }}
                      isLoading={isPending}
                      loadingText="Saving"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="px-4"
                      onClick={() => {
                        void submitDecision(single, 'DENIED', { quick: true });
                      }}
                      isLoading={isPending}
                      loadingText="Saving"
                    >
                      Deny
                    </Button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })
      ) : (
        <p className="state-empty">No active admissions in the queue.</p>
      )}

      <Dialog open={Boolean(activeGroup && selected)} onOpenChange={(open) => (!open ? setActiveGroupKey(null) : null)}>
        <DialogContent className="w-[min(96vw,46rem)] max-h-[90vh] overflow-y-auto">
          {activeGroup && selected ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {activeGroup.parent.firstName} {activeGroup.parent.lastName} batch
                </DialogTitle>
                <DialogDescription>
                  {activeGroup.items.length} enrollment request{activeGroup.items.length === 1 ? '' : 's'} • submitted {formatDateTime(activeGroup.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-field border border-line bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Children in this application</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeGroup.items.map((item) => {
                    const isSelected = item.id === selected.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedEnrollmentId(item.id)}
                        className={
                          isSelected
                            ? 'rounded-full border border-sky-300 bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900'
                            : 'rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-sky-200 hover:bg-sky-50'
                        }
                      >
                        {item.child.firstName} {item.child.lastName} ({item.status.replace('_', ' ')})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <article className="rounded-field border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Child profile</p>
                  <p className="mt-1 text-sm text-ink-800">DOB: {formatDate(selected.child.dateOfBirth)}</p>
                  <p className="text-sm text-ink-700">Allergies: {selected.child.allergies || 'None listed'}</p>
                  <p className="text-sm text-ink-700">Medical: {selected.child.medicalNotes || 'None listed'}</p>
                </article>
                <article className="rounded-field border border-line bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Enrollment details</p>
                  <p className="mt-1 text-sm text-ink-800">Program: {selected.programType.replace('_', ' ')}</p>
                  <p className="text-sm text-ink-700">
                    Requested start: {selected.startDate ? formatDate(selected.startDate) : 'Not set'}
                  </p>
                  <p className="text-sm text-ink-700">Status: {selected.status.replace('_', ' ')}</p>
                </article>
              </div>

              {canManageAdmissions ? (
                <>
                  <Input
                    label="Start date (required for approve)"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <Input
                    label="Decision reason"
                    value={decisionReason}
                    onChange={(event) => setDecisionReason(event.target.value)}
                    placeholder="Optional reason for parent context"
                  />
                  <Textarea
                    label="Review notes"
                    value={reviewNotes}
                    onChange={(event) => setReviewNotes(event.target.value)}
                    placeholder="Required review notes"
                    rows={3}
                  />
                </>
              ) : null}

              <DialogFooter>
                <Button variant="danger" className="px-6" onClick={() => setActiveGroupKey(null)}>
                  Close
                </Button>
                {canManageAdmissions ? (
                  <>
                    <Button
                      variant="outline"
                      className="px-6"
                      onClick={() => {
                        void submitDecision(selected, 'DENIED');
                      }}
                      isLoading={isPending}
                      loadingText="Saving"
                    >
                      Deny
                    </Button>
                    <Button
                      className="px-6"
                      onClick={() => {
                        void submitDecision(selected, 'APPROVED');
                      }}
                      isLoading={isPending}
                      loadingText="Saving"
                    >
                      Accept
                    </Button>
                  </>
                ) : null}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
