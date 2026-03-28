import Link from 'next/link';
import { Badge, Button, Card } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { getAdminOverviewData } from '@/lib/v3/queries';

type AdminOverviewData = Awaited<ReturnType<typeof getAdminOverviewData>>;

interface AdminOverviewContentProps {
  data: AdminOverviewData;
  canManageAdmissions: boolean;
}

function statusVariant(status: string): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'APPROVED' || status === 'PAID' || status === 'SUCCEEDED') return 'success';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO' || status === 'OPEN') return 'warning';
  if (status === 'PAST_DUE' || status === 'DENIED' || status === 'FAILED') return 'danger';
  if (status === 'PENDING') return 'info';
  return 'default';
}

export function AdminOverviewContent({ data, canManageAdmissions }: AdminOverviewContentProps) {
  const pendingAdmissions =
    data.admissionsByStatus.PENDING +
    data.admissionsByStatus.REQUEST_INFO +
    data.admissionsByStatus.WAITLISTED;
  const visibleAdmissions = data.recentAdmissions.slice(0, 2);
  const hiddenAdmissionCount = Math.max(0, data.recentAdmissions.length - visibleAdmissions.length);

  return (
    <div className="space-y-3">
      <section className="grid gap-3 xl:grid-cols-2">
        <Card title="Admissions Triage" subtitle="Most important queue signals">
          <div className="space-y-1.5">
            <div className="rounded-field border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Actionable queue: {pendingAdmissions} total (pending: {data.admissionsByStatus.PENDING} • request info: {data.admissionsByStatus.REQUEST_INFO} • waitlisted: {data.admissionsByStatus.WAITLISTED})
            </div>
            <div className="rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Approved in system: {data.admissionsByStatus.APPROVED}
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {visibleAdmissions.map((admission) => (
              <article key={admission.id} className="rounded-field border border-line bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink-900">
                    {admission.child.firstName} {admission.child.lastName}
                  </p>
                  <Badge variant={statusVariant(admission.status)}>{admission.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-ink-500">
                  {admission.parent.firstName} {admission.parent.lastName} • {formatDateTime(admission.createdAt)}
                </p>
              </article>
            ))}
          </div>

          {hiddenAdmissionCount > 0 ? (
            <p className="mt-2 text-xs text-ink-500">
              +{hiddenAdmissionCount} more recent admission{hiddenAdmissionCount === 1 ? '' : 's'} in queue.
            </p>
          ) : null}

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <Button asChild size="sm" fullWidth disabled={!canManageAdmissions}>
              <Link href="/admin/admissions">Open Admissions Queue</Link>
            </Button>
            <Button asChild size="sm" variant="outline" fullWidth>
              <Link href="/admin/families">Open Family CRM</Link>
            </Button>
          </div>
        </Card>

        <Card title="Collections Risk" subtitle="Only billing items needing attention">
          <div className="space-y-1.5">
            <div className="rounded-field border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              Past due balance: {formatCurrency(data.metrics.pastDueBalanceCents)} across {data.metrics.pastDueInvoices} invoices.
            </div>
            <div className="rounded-field border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              Open receivables: {formatCurrency(data.metrics.openBalanceCents)} across {data.metrics.openInvoices} invoices.
            </div>
            <div className="rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Collected this month: {formatCurrency(data.metrics.collectedThisMonthCents)}.
            </div>
          </div>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <Button asChild size="sm" fullWidth>
              <Link href="/admin/billing">Open Billing</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" fullWidth>
              <Link href="/admin/tutorial#billing-operations">Billing Help</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
