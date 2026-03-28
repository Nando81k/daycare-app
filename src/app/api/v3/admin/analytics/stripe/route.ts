import { NextResponse } from 'next/server';
import { getStripeRevenueSummary } from '@/lib/v3/stripe-analytics';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

function parseDays(value: string | null) {
  if (!value) return 90;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 90;
  return Math.min(Math.max(parsed, 7), 180);
}

export async function GET(request: Request) {
  const { error } = await requireApiAdmin(PERMISSIONS.BILLING_READ);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get('days'));

  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const summary = await getStripeRevenueSummary(start, end);

  return NextResponse.json({
    days,
    ...summary,
  });
}
