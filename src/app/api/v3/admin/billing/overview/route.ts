import { NextResponse } from 'next/server';
import { getAdminBillingOverview, getAdminOverviewData } from '@/lib/v3/queries';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const [overview, billing] = await Promise.all([getAdminOverviewData(), getAdminBillingOverview()]);

  return NextResponse.json({
    metrics: overview.metrics,
    admissionsHandoffMetrics: overview.admissionsHandoffMetrics,
    invoicesByStatus: overview.invoicesByStatus,
    series90d: overview.series90d,
    stripeRevenue: overview.stripeRevenue,
    policy: billing.policy,
  });
}
