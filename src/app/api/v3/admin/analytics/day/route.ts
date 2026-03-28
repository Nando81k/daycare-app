import { NextResponse } from 'next/server';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';
import { getAdminDayInsights } from '@/lib/v3/queries';

export async function GET(request: Request) {
  const { error } = await requireApiAdmin(PERMISSIONS.OVERVIEW_READ);
  if (error) return error;

  const date = new URL(request.url).searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: { message: 'date is required (YYYY-MM-DD)' } }, { status: 400 });
  }

  const data = await getAdminDayInsights(date);
  if (!data) {
    return NextResponse.json({ error: { message: 'Invalid date format' } }, { status: 400 });
  }

  return NextResponse.json(data);
}
