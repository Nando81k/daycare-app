import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiParent } from '@/lib/route-helpers';

export async function GET(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const status = new URL(request.url).searchParams.get('status');

  const invoices = await prisma.invoice.findMany({
    where: {
      parentId: user.id,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      child: { select: { firstName: true, lastName: true } },
      lineItems: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  return NextResponse.json({ invoices });
}
