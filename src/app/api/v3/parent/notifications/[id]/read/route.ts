import { NextResponse } from 'next/server';
import { markParentNotificationRead } from '@/lib/v3/notifications';
import { requireApiParent } from '@/lib/route-helpers';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  const { id } = await params;

  const updatedCount = await markParentNotificationRead(user.id, id);
  if (!updatedCount) {
    return NextResponse.json({ error: { message: 'Notification not found' } }, { status: 404 });
  }

  return NextResponse.json({ ok: true, updatedCount });
}
