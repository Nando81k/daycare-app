import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin(PERMISSIONS.ADMISSIONS_READ);
  if (error) return error;
  const { id } = await params;

  const admission = await prisma.enrollmentApplication.findUnique({
    where: { id },
    include: {
      child: true,
      parent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!admission) {
    return NextResponse.json({ error: { message: 'Admission not found' } }, { status: 404 });
  }

  return NextResponse.json({ admission });
}
