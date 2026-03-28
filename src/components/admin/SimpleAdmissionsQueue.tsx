'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Input } from '@/components/ui';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'WAITLISTED' | 'REQUEST_INFO';
type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';

interface ApplicationRow {
  id: string;
  status: EnrollmentStatus;
  programType: ProgramType;
  startDate: string | null;
  createdAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
  parent: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function statusVariant(status: EnrollmentStatus): 'warning' | 'success' | 'danger' {
  if (status === 'APPROVED') return 'success';
  if (status === 'DENIED') return 'danger';
  return 'warning';
}

function statusLabel(status: EnrollmentStatus) {
  if (status === 'DENIED') return 'Rejected';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO') return 'Pending';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function toInputDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function SimpleAdmissionsQueue({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startDates, setStartDates] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((row) => [row.id, toInputDate(row.startDate)])),
  );

  const pendingCount = useMemo(
    () => rows.filter((row) => row.status === 'PENDING' || row.status === 'WAITLISTED' || row.status === 'REQUEST_INFO').length,
    [rows],
  );

  function setRowError(id: string, message: string) {
    setErrors((current) => ({ ...current, [id]: message }));
  }

  function clearRowError(id: string) {
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function decide(id: string, decision: 'APPROVE' | 'REJECT') {
    clearRowError(id);

    const startDate = startDates[id];
    if (decision === 'APPROVE' && !startDate) {
      setRowError(id, 'Start date is required to approve.');
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/v3/admin/admissions/${id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          startDate: decision === 'APPROVE' ? startDate : null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setRowError(id, payload?.error?.message || 'Unable to update application.');
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700">
        Incoming applications: <span className="font-semibold text-ink-900">{pendingCount}</span>
      </div>

      <div className="table-scroll">
        <table className="min-w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-3 py-2.5">Child</th>
              <th className="px-3 py-2.5">Parent</th>
              <th className="px-3 py-2.5">Program</th>
              <th className="px-3 py-2.5">Preferred start</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => {
                const isDecisionOpen =
                  row.status === 'PENDING' || row.status === 'WAITLISTED' || row.status === 'REQUEST_INFO';
                return (
                  <tr key={row.id} className="border-t border-line bg-white">
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-ink-900">
                        {row.child.firstName} {row.child.lastName}
                      </p>
                      <p className="text-xs text-ink-500">
                        Submitted {new Date(row.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-ink-900">
                        {row.parent.firstName} {row.parent.lastName}
                      </p>
                      <p className="text-xs text-ink-500">{row.parent.email}</p>
                    </td>
                    <td className="px-3 py-2.5 text-ink-700">{row.programType.replace('_', '-')}</td>
                    <td className="px-3 py-2.5">
                      {isDecisionOpen ? (
                        <Input
                          type="date"
                          value={startDates[row.id] ?? ''}
                          onChange={(event) => {
                            setStartDates((current) => ({ ...current, [row.id]: event.target.value }));
                          }}
                          containerClassName="min-w-[10rem]"
                        />
                      ) : (
                        <span className="text-ink-700">
                          {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Not set'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {isDecisionOpen ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => decide(row.id, 'APPROVE')}
                              isLoading={isPending}
                              loadingText="Saving"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => decide(row.id, 'REJECT')}
                              isLoading={isPending}
                              loadingText="Saving"
                            >
                              Reject
                            </Button>
                          </div>
                          {errors[row.id] ? (
                            <p className="text-xs font-medium text-rose-600">{errors[row.id]}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-500">Decision complete</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="border-t border-line bg-white">
                <td className="px-3 py-4 text-sm text-ink-600" colSpan={6}>
                  No applications available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
