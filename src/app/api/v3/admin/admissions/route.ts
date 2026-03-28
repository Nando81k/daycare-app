import { NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { groupAdmissionsRows } from '@/lib/v3/admissions';
import { requireApiAdmin } from '@/lib/route-helpers';
import { normalizeLegacyEnrollmentStatuses } from '@/lib/enrollment-normalization';

export async function GET(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  await normalizeLegacyEnrollmentStatuses(prisma);

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim();
  const status = searchParams.get('status') as EnrollmentStatus | null;

  const rows = await prisma.enrollmentApplication.findMany({
    where: {
      ...(status && Object.values(EnrollmentStatus).includes(status) ? { status } : {}),
      ...(query
        ? {
            OR: [
              {
                child: {
                  OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
              {
                parent: {
                  OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
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
    orderBy: [{ createdAt: 'desc' }],
    take: 120,
  });

  const groupedRows = groupAdmissionsRows(rows as any);
  return NextResponse.json({ rows, groupedRows });
}
