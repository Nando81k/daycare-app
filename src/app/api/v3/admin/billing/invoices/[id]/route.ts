import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin();
  if (error) return error;
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, firstName: true, lastName: true, email: true } },
      child: { select: { id: true, firstName: true, lastName: true } },
      contract: {
        include: {
          tuitionPlan: true,
        },
      },
      lineItems: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
  }

  return NextResponse.json({ invoice });
}
