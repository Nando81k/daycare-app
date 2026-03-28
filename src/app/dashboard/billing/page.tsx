import Link from 'next/link';
import { Badge, Button, Card, buttonStyles } from '@/components/ui';
import { DashboardHero } from '@/components/shell';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getPaymentProviderState } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function statusVariant(status: string): 'warning' | 'danger' | 'success' | 'info' {
  if (status === 'PAST_DUE') return 'danger';
  if (status === 'PAID') return 'success';
  if (status === 'VOID') return 'info';
  return 'warning';
}

export default async function ParentBillingPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const providerState = getPaymentProviderState();
  const invoices = await prisma.invoice.findMany({
    where: { parentId: user.id },
    include: {
      child: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 120,
  });

  const dueNowCents = invoices
    .filter((invoice) => invoice.status === 'OPEN' || invoice.status === 'PAST_DUE')
    .reduce((sum, invoice) => sum + invoice.amountDueCents, 0);
  const openCount = invoices.filter((invoice) => invoice.status === 'OPEN').length;
  const pastDueCount = invoices.filter((invoice) => invoice.status === 'PAST_DUE').length;

  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="parent"
        eyebrow="Tuition"
        title="Tuition Invoices"
        description="Review invoice status and payment readiness for your child enrollments."
        stats={[
          { label: 'Invoices', value: invoices.length },
          { label: 'Open', value: openCount },
          { label: 'Past Due', value: pastDueCount },
          { label: 'Due Now', value: formatCurrency(dueNowCents) },
        ]}
      />

      <Card title="Checkout availability" subtitle="Payment provider status">
        <div className="rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700">
          Payment provider state: <span className="font-semibold text-ink-900">{providerState}</span>
          {providerState === 'disconnected'
            ? '. Stripe is not connected yet, so checkout is currently disabled.'
            : '. Stripe checkout is available.'}
        </div>
      </Card>

      <Card title="Invoices" subtitle="Open each invoice to review and pay">
        <div className="table-scroll">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-2.5">Invoice</th>
                <th className="px-3 py-2.5">Child</th>
                <th className="px-3 py-2.5">Due date</th>
                <th className="px-3 py-2.5">Amount due</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length ? (
                invoices.map((invoice) => {
                  const canPay = invoice.status === 'OPEN' || invoice.status === 'PAST_DUE';
                  return (
                    <tr key={invoice.id} className="border-t border-line bg-white">
                      <td className="px-3 py-2.5 font-semibold text-ink-900">{invoice.invoiceNumber}</td>
                      <td className="px-3 py-2.5 text-ink-700">
                        {invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : 'Family invoice'}
                      </td>
                      <td className="px-3 py-2.5 text-ink-700">{invoice.dueDate.toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 font-semibold text-ink-900">{formatCurrency(invoice.amountDueCents)}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {canPay ? (
                          <Button asChild size="sm">
                            <Link href={`/dashboard/billing/pay/${invoice.id}`}>View invoice</Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-500">No action</span>
                        )}
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
        <div className="mt-4">
          <Link href="/dashboard/family" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            Back to Enrollment
          </Link>
        </div>
      </Card>
    </div>
  );
}
