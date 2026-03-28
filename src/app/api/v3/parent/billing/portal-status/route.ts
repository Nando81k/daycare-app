import { NextResponse } from 'next/server';
import { requireApiParent } from '@/lib/route-helpers';
import { getPortalReadiness } from '@/lib/billing-portal';

export async function GET() {
  const { error } = await requireApiParent();
  if (error) return error;

  const readiness = await getPortalReadiness();
  return NextResponse.json(readiness);
}
