import { NextResponse } from 'next/server';
import { getAdminCrmInboxData } from '@/lib/v3/queries';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_READ);
  if (error || !user) return error;

  const params = new URL(request.url).searchParams;
  const limit = Number(params.get('limit') || '120');

  const inbox = await getAdminCrmInboxData({
    adminUserId: user.id,
    limit,
  });

  return NextResponse.json(inbox);
}
