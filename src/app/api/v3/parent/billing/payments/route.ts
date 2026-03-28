import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiParent } from '@/lib/route-helpers';

export async function GET() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const payments = await prisma.paymentTransaction.findMany({
    where: { parentId: user.id },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
  });

  return NextResponse.json({ payments });
}
