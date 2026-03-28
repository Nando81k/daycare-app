import Link from 'next/link';
import { Card, buttonStyles } from '@/components/ui';
import { DashboardHero } from '@/components/shell';

export const dynamic = 'force-dynamic';

export default function AdminOverviewPage() {
  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="admin"
        eyebrow="Admin Dashboard"
        title="Applications and Payments"
        description="Review incoming enrollment applications and manage tuition invoices from one simplified workspace."
        actions={
          <>
            <Link href="/admin/admissions" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              Open Applications
            </Link>
            <Link href="/admin/billing" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
              Open Payments
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Applications Queue" subtitle="Approve or reject incoming applications">
          <p className="text-sm text-ink-600">
            Applications are reviewed with two decisions only: Approve or Reject. Approved applications auto-create tuition
            invoices.
          </p>
          <div className="mt-4">
            <Link href="/admin/admissions" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              Go to Applications
            </Link>
          </div>
        </Card>

        <Card title="Payments" subtitle="Manage invoice lifecycle states">
          <p className="text-sm text-ink-600">
            Manage invoice states (`OPEN`, `PAST_DUE`, `VOID`) and monitor collection readiness while Stripe integration is
            pending.
          </p>
          <div className="mt-4">
            <Link href="/admin/billing" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
              Go to Payments
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
