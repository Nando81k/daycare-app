import { NextResponse } from 'next/server';
import { getParentNotificationFeed } from '@/lib/v3/notifications';
import { requireApiParent } from '@/lib/route-helpers';

export async function GET(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const url = new URL(request.url);
  const type = (url.searchParams.get('type') || 'ALL') as
    | 'ALL'
    | 'GENERAL'
    | 'ENROLLMENT'
    | 'BILLING'
    | 'REMINDER';
  const status = (url.searchParams.get('status') || 'ALL') as 'ALL' | 'READ' | 'UNREAD';
  const limit = Number(url.searchParams.get('limit') || '100');

  const data = await getParentNotificationFeed(user.id, { type, status, limit });
  return NextResponse.json(data);
}
