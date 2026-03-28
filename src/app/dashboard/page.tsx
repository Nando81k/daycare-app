import Link from 'next/link';
import { Card, buttonStyles } from '@/components/ui';
import { DashboardHero } from '@/components/shell';

export const dynamic = 'force-dynamic';

export default function ParentOverviewPage() {
  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="parent"
        eyebrow="Parent Dashboard"
        title="Enrollment and Tuition"
        description="Use this dashboard to submit child enrollment applications and manage tuition invoices."
        actions={
          <>
            <Link href="/dashboard/family" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              Open Enrollment
            </Link>
            <Link href="/dashboard/billing" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
              Open Tuition
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Enrollment" subtitle="Add children and submit applications">
          <p className="text-sm text-ink-600">
            Complete a simple multi-child wizard and track application statuses: Pending, Approved, or Rejected.
          </p>
          <div className="mt-4">
            <Link href="/dashboard/family" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
              Go to Enrollment
            </Link>
          </div>
        </Card>

        <Card title="Tuition" subtitle="View invoices and payment readiness">
          <p className="text-sm text-ink-600">
            Review outstanding invoices and payment status. Checkout activates automatically when Stripe is connected.
          </p>
          <div className="mt-4">
            <Link href="/dashboard/billing" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
              Go to Tuition
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
