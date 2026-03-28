import { NextResponse } from 'next/server';
import { getAdminOverviewData } from '@/lib/v3/queries';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET() {
  const { error } = await requireApiAdmin(PERMISSIONS.OVERVIEW_READ);
  if (error) return error;

  const data = await getAdminOverviewData();
  return NextResponse.json(data);
}
