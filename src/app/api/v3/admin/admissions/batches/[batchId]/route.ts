import { NextResponse } from 'next/server';
import { groupAdmissionsRows } from '@/lib/v3/admissions';
import { prisma } from '@/lib/prisma';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.ADMISSIONS_READ);
  if (error || !user) return error;

  const { batchId } = await params;
  if (!batchId) {
    return NextResponse.json({ error: { message: 'Batch id is required' } }, { status: 400 });
  }

  const canReadSensitive = hasPermission(user.adminRole, PERMISSIONS.SENSITIVE_DATA_READ);
  const rows = await prisma.enrollmentApplication.findMany({
    where: { intakeBatchId: batchId },
    include: {
      child: true,
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          ...(canReadSensitive ? { guardianSsnLast4Masked: true } : {}),
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!rows.length) {
    return NextResponse.json({ error: { message: 'Batch not found' } }, { status: 404 });
  }

  const grouped = groupAdmissionsRows(rows as any);
  return NextResponse.json({ batch: grouped[0] ?? null });
}
