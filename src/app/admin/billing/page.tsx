import { Card } from '@/components/ui';
import { DashboardHero } from '@/components/shell';
import { prisma } from '@/lib/prisma';
import { getPaymentProviderState } from '@/lib/payments/provider';
import { SimpleInvoiceOperations } from '@/components/admin/SimpleInvoiceOperations';

export const dynamic = 'force-dynamic';

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default async function AdminBillingPage() {
  const providerState = getPaymentProviderState();
  const invoices = await prisma.invoice.findMany({
    include: {
      parent: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      child: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 200,
  });

  const openCount = invoices.filter((invoice) => invoice.status === 'OPEN').length;
  const pastDueCount = invoices.filter((invoice) => invoice.status === 'PAST_DUE').length;
  const dueNowCents = invoices
    .filter((invoice) => invoice.status === 'OPEN' || invoice.status === 'PAST_DUE')
    .reduce((sum, invoice) => sum + invoice.amountDueCents, 0);

  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="admin"
        eyebrow="Payments"
        title="Invoice Operations"
        description="Manage tuition invoices and lifecycle status while Stripe integration is pending."
        stats={[
          { label: 'Invoices', value: invoices.length },
          { label: 'Open', value: openCount },
          { label: 'Past Due', value: pastDueCount },
          { label: 'Due Now', value: formatCurrency(dueNowCents) },
        ]}
      />

      <Card title="Payment Provider" subtitle="Integration readiness">
        <div className="rounded-field border border-line bg-white px-3 py-2 text-sm text-ink-700">
          Stripe provider state: <span className="font-semibold text-ink-900">{providerState}</span>
          {providerState === 'disconnected'
            ? '. Parent checkout remains disabled until Stripe credentials are configured.'
            : '. Parent checkout is enabled.'}
        </div>
      </Card>

      <Card title="Invoice Management" subtitle="Set lifecycle state and due date (no manual payment posting)">
        <SimpleInvoiceOperations
          invoices={invoices.map((invoice) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            dueDate: invoice.dueDate.toISOString(),
            amountDueCents: invoice.amountDueCents,
            totalCents: invoice.totalCents,
            parentName: `${invoice.parent.firstName} ${invoice.parent.lastName}`,
            childName: invoice.child ? `${invoice.child.firstName} ${invoice.child.lastName}` : 'Family invoice',
          }))}
        />
      </Card>
    </div>
  );
}
