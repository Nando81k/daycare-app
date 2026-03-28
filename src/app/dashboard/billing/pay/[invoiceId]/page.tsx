import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Badge, Card, InfoHint, TableEmptyRow, buttonStyles } from '@/components/ui';
import { DashboardHero } from '@/components/shell';
import { PayInvoiceButton } from '@/components/billing';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getPaymentProviderState } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';

function statusVariant(status: string): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'PAID') return 'success';
  if (status === 'OPEN') return 'warning';
  if (status === 'PAST_DUE') return 'danger';
  if (status === 'DRAFT') return 'info';
  return 'default';
}

export default async function InvoicePayPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const { invoiceId } = await params;
  const { checkout } = await searchParams;
  const providerState = getPaymentProviderState();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      parentId: user.id,
    },
    include: {
      child: true,
      lineItems: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const collectible = invoice.status === 'OPEN' || invoice.status === 'PAST_DUE';

  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="parent"
        eyebrow="Invoice Checkout"
        title={`Pay ${invoice.invoiceNumber}`}
        description="Review invoice details and complete secure Stripe checkout."
        actions={
          <Link href="/dashboard/billing" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            Back to Billing
          </Link>
        }
        stats={[
          { label: 'Status', value: invoice.status.replace('_', ' ') },
          { label: 'Amount Due', value: formatCurrency(invoice.amountDueCents) },
          { label: 'Issue Date', value: formatDate(invoice.issueDate) },
          { label: 'Due Date', value: formatDate(invoice.dueDate) },
        ]}
      />

      {checkout === 'success' ? (
        <div className="rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Checkout completed. Payment confirmation will appear shortly after Stripe reconciliation.
        </div>
      ) : null}
      {checkout === 'cancel' ? (
        <div className="rounded-field border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Payment was canceled. You can retry anytime.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <Card
          title={`Invoice ${invoice.invoiceNumber}`}
          subtitle="Review details before secure checkout"
          className="glass-shell"
          actions={
            <InfoHint label="Invoice detail help" title="Invoice detail notes">
              <ul className="space-y-1">
                <li>Line items show what is included in this invoice total.</li>
                <li>`Amount due now` is the charge sent to checkout.</li>
              </ul>
            </InfoHint>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Child</p>
              <p className="mt-1 text-sm text-ink-900">
                {invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : 'Family invoice'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Status</p>
              <div className="mt-1">
                <Badge variant={statusVariant(invoice.status)}>{invoice.status.replace('_', ' ')}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Issue Date</p>
              <p className="mt-1 text-sm text-ink-900">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Due Date</p>
              <p className="mt-1 text-sm text-ink-900">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="mt-4 table-scroll rounded-field border border-line bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-3 py-2.5">Qty</th>
                  <th className="px-3 py-2.5">Unit</th>
                  <th className="px-3 py-2.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.length ? (
                  invoice.lineItems.map((lineItem) => (
                    <tr key={lineItem.id} className="border-t border-line bg-white">
                      <td className="px-3 py-2.5 text-ink-800">{lineItem.description}</td>
                      <td className="px-3 py-2.5 text-ink-700">{lineItem.quantity}</td>
                      <td className="px-3 py-2.5 text-ink-700">{formatCurrency(lineItem.unitAmountCents)}</td>
                      <td className="px-3 py-2.5 font-semibold text-ink-900">{formatCurrency(lineItem.totalAmountCents)}</td>
                    </tr>
                  ))
                ) : (
                  <TableEmptyRow
                    colSpan={4}
                    title="No line items on this invoice."
                    description="Please contact support if you expected billing details to appear here."
                  />
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
            <p className="text-sm text-ink-700">Total invoice: <span className="font-semibold text-ink-900">{formatCurrency(invoice.totalCents)}</span></p>
            <p className="text-sm text-ink-700">Amount due now: <span className="font-semibold text-ink-900">{formatCurrency(invoice.amountDueCents)}</span></p>
          </div>
        </Card>

        <Card
          title="Secure Payment"
          subtitle="Card payment processed through Stripe Checkout"
          className="glass-shell"
          actions={
            <InfoHint label="Secure payment help" title="Payment step details">
              <ul className="space-y-1">
                <li>You are redirected to Stripe-hosted checkout for card payment.</li>
                <li>Invoice status updates after webhook reconciliation.</li>
              </ul>
            </InfoHint>
          }
        >
          {collectible && invoice.amountDueCents > 0 ? (
            <>
              <p className="text-sm text-ink-600">You will be redirected to Stripe to complete payment securely.</p>
              {providerState === 'disconnected' ? (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Stripe is not connected yet. Checkout is temporarily disabled.
                </p>
              ) : null}
              <div className="mt-3">
                <PayInvoiceButton invoiceId={invoice.id} providerState={providerState} />
              </div>
            </>
          ) : (
            <div className="rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700 shadow-sm">
              This invoice is not eligible for payment checkout. Current status: {invoice.status.replace('_', ' ')}.
            </div>
          )}

          <div className="mt-4 rounded-field border border-sky-200 bg-sky-50/75 px-3 py-2 text-xs text-sky-900">
            Registration policies and late fee rules are shown on your billing center. Need help? Contact support.
          </div>

          {invoice.payments[0] ? (
            <div className="mt-4 rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700 shadow-sm">
              Last payment attempt: {formatDateTime(invoice.payments[0].createdAt)} ({invoice.payments[0].status.toLowerCase()})
            </div>
          ) : (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-600">
              <AlertCircle className="h-4 w-4" />
              No payment attempts recorded yet.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
