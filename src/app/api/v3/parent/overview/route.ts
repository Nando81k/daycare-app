import { NextResponse } from 'next/server';
import { requireApiParent } from '@/lib/route-helpers';
import { getParentOverview } from '@/lib/v3/queries';

export async function GET() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const data = await getParentOverview(user.id);
  return NextResponse.json(data);
}
