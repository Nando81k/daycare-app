import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(request: Request) {
  const { error } = await requireApiAdmin(PERMISSIONS.BILLING_READ);
  if (error) return error;

  const status = new URL(request.url).searchParams.get('status');

  const payments = await prisma.paymentTransaction.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
    },
    include: {
      parent: { select: { firstName: true, lastName: true, email: true } },
      invoice: { select: { id: true, invoiceNumber: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ payments });
}
