import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function normalizeLegacyEnrollmentStatuses(prismaClient: PrismaClient = prisma) {
  await prismaClient.enrollmentApplication.updateMany({
    where: {
      status: { in: ['WAITLISTED', 'REQUEST_INFO'] },
    },
    data: {
      status: 'PENDING',
    },
  });
}
