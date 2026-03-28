import { NextResponse } from 'next/server';
import { markAllParentNotificationsRead } from '@/lib/v3/notifications';
import { requireApiParent } from '@/lib/route-helpers';

export async function PATCH() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const updatedCount = await markAllParentNotificationsRead(user.id);
  return NextResponse.json({ ok: true, updatedCount });
}
