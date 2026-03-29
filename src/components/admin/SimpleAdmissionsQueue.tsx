'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
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

function formatDate(value: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

function isDecisionOpen(status: EnrollmentStatus) {
  return status === 'PENDING' || status === 'WAITLISTED' || status === 'REQUEST_INFO';
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

  const decide = useCallback(
    (id: string, decision: 'APPROVE' | 'REJECT') => {
      setErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });

      const startDate = startDates[id];
      if (decision === 'APPROVE' && !startDate) {
        setErrors((current) => ({ ...current, [id]: 'Start date is required to approve.' }));
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
          setErrors((current) => ({
            ...current,
            [id]: payload?.error?.message || 'Unable to update application.',
          }));
          return;
        }

        router.refresh();
      });
    },
    [router, startDates, startTransition],
  );

  const columns = useMemo<ColumnDef<ApplicationRow>[]>(
    () => [
      {
        id: 'child',
        header: 'Child',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-ink-900">
              {row.original.child.firstName} {row.original.child.lastName}
            </p>
            <p className="text-xs text-ink-500">Submitted {formatDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        id: 'parent',
        header: 'Parent',
        cell: ({ row }) => (
          <div>
            <p className="text-ink-900">
              {row.original.parent.firstName} {row.original.parent.lastName}
            </p>
            <p className="text-xs text-ink-500">{row.original.parent.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'programType',
        header: 'Program',
        cell: ({ row }) => <span className="text-ink-700">{row.original.programType.replace('_', '-')}</span>,
      },
      {
        id: 'preferredStart',
        header: 'Preferred start',
        cell: ({ row }) => {
          if (isDecisionOpen(row.original.status)) {
            return (
              <Input
                type="date"
                value={startDates[row.original.id] ?? ''}
                onChange={(event) => {
                  setStartDates((current) => ({ ...current, [row.original.id]: event.target.value }));
                }}
                containerClassName="min-w-[10rem]"
              />
            );
          }

          return <span className="text-ink-700">{formatDate(row.original.startDate)}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{statusLabel(row.original.status)}</Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
          if (!isDecisionOpen(row.original.status)) {
            return <span className="text-xs text-ink-500">Decision complete</span>;
          }

          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => decide(row.original.id, 'APPROVE')}
                  isLoading={isPending}
                  loadingText="Saving"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => decide(row.original.id, 'REJECT')}
                  isLoading={isPending}
                  loadingText="Saving"
                >
                  Reject
                </Button>
              </div>
              {errors[row.original.id] ? (
                <p className="text-xs font-medium text-rose-600">{errors[row.original.id]}</p>
              ) : null}
            </div>
          );
        },
      },
    ],
    [decide, errors, isPending, startDates],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700">
        Incoming applications: <span className="font-semibold text-ink-900">{pendingCount}</span>
      </div>

      {rows.length ? (
        <>
          <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1 md:hidden">
            {rows.map((row) => (
              <article key={row.id} className="rounded-[12px] border border-line bg-white p-3 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">
                      {row.child.firstName} {row.child.lastName}
                    </p>
                    <p className="text-xs text-ink-500">Submitted {formatDate(row.createdAt)}</p>
                  </div>
                  <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-ink-700">
                  <p>
                    <span className="font-semibold text-ink-900">Parent:</span> {row.parent.firstName} {row.parent.lastName}
                  </p>
                  <p className="break-all text-xs text-ink-500">{row.parent.email}</p>
                  <p>
                    <span className="font-semibold text-ink-900">Program:</span> {row.programType.replace('_', '-')}
                  </p>
                </div>

                <div className="mt-3">
                  {isDecisionOpen(row.status) ? (
                    <Input
                      label="Start date"
                      type="date"
                      value={startDates[row.id] ?? ''}
                      onChange={(event) => {
                        setStartDates((current) => ({ ...current, [row.id]: event.target.value }));
                      }}
                    />
                  ) : (
                    <p className="text-sm text-ink-700">
                      <span className="font-semibold text-ink-900">Start date:</span> {formatDate(row.startDate)}
                    </p>
                  )}
                </div>

                {isDecisionOpen(row.status) ? (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide(row.id, 'APPROVE')}
                        isLoading={isPending}
                        loadingText="Saving"
                        fullWidth
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => decide(row.id, 'REJECT')}
                        isLoading={isPending}
                        loadingText="Saving"
                        fullWidth
                      >
                        Reject
                      </Button>
                    </div>
                    {errors[row.id] ? <p className="text-xs font-medium text-rose-600">{errors[row.id]}</p> : null}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-500">Decision complete</p>
                )}
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <div className="max-h-[66vh] overflow-auto rounded-[12px] border border-line bg-white">
              <table className="min-w-[74rem] text-left text-sm">
                <thead className="table-head">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-3 py-2.5">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-t border-line bg-white">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-2.5 align-top">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-field border border-line bg-white px-3 py-4 text-sm text-ink-600">
          No applications available.
        </div>
      )}
    </div>
  );
}
