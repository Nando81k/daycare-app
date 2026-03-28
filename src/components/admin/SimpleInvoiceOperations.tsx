'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Input, Select } from '@/components/ui';

type InvoiceStatus = 'OPEN' | 'PAST_DUE' | 'VOID' | 'PAID' | 'DRAFT';

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  dueDate: string;
  amountDueCents: number;
  totalCents: number;
  parentName: string;
  childName: string;
}

function statusVariant(status: InvoiceStatus): 'warning' | 'danger' | 'success' | 'info' {
  if (status === 'PAST_DUE') return 'danger';
  if (status === 'VOID') return 'info';
  if (status === 'PAID') return 'success';
  return 'warning';
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function toDateInput(isoDate: string) {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return '';
  return value.toISOString().slice(0, 10);
}

export function SimpleInvoiceOperations({ invoices }: { invoices: InvoiceRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState(
    Object.fromEntries(
      invoices.map((invoice) => [
        invoice.id,
        {
          status: invoice.status === 'OPEN' || invoice.status === 'PAST_DUE' || invoice.status === 'VOID'
            ? invoice.status
            : 'OPEN',
          dueDate: toDateInput(invoice.dueDate),
          error: '',
        },
      ]),
    ),
  );

  function updateRow(id: string, patch: Partial<{ status: 'OPEN' | 'PAST_DUE' | 'VOID'; dueDate: string; error: string }>) {
    setRows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  function save(id: string) {
    const current = rows[id];
    if (!current?.dueDate) {
      updateRow(id, { error: 'Due date is required.' });
      return;
    }

    updateRow(id, { error: '' });
    startTransition(async () => {
      const response = await fetch('/api/v3/admin/billing/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: current.status,
          dueDate: current.dueDate,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        updateRow(id, { error: payload?.error?.message || 'Unable to update invoice.' });
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="table-scroll">
      <table className="min-w-full text-left text-sm">
        <thead className="table-head">
          <tr>
            <th className="px-3 py-2.5">Invoice</th>
            <th className="px-3 py-2.5">Family</th>
            <th className="px-3 py-2.5">Amount</th>
            <th className="px-3 py-2.5">Due date</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length ? (
            invoices.map((invoice) => {
              const rowState = rows[invoice.id];
              return (
                <tr key={invoice.id} className="border-t border-line bg-white">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-ink-900">{invoice.invoiceNumber}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-ink-900">{invoice.parentName}</p>
                    <p className="text-xs text-ink-500">{invoice.childName}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-ink-900">{formatCurrency(invoice.amountDueCents)}</p>
                    <p className="text-xs text-ink-500">Total {formatCurrency(invoice.totalCents)}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      type="date"
                      value={rowState?.dueDate || ''}
                      onChange={(event) => updateRow(invoice.id, { dueDate: event.target.value })}
                      containerClassName="min-w-[10rem]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="space-y-2">
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <Select
                        value={rowState?.status || 'OPEN'}
                        onChange={(event) =>
                          updateRow(invoice.id, { status: event.target.value as 'OPEN' | 'PAST_DUE' | 'VOID' })
                        }
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="PAST_DUE">PAST_DUE</option>
                        <option value="VOID">VOID</option>
                      </Select>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button size="sm" onClick={() => save(invoice.id)} isLoading={isPending} loadingText="Saving">
                      Save
                    </Button>
                    {rowState?.error ? <p className="mt-2 text-xs font-medium text-rose-600">{rowState.error}</p> : null}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="border-t border-line bg-white">
              <td className="px-3 py-4 text-sm text-ink-600" colSpan={6}>
                No invoices yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
