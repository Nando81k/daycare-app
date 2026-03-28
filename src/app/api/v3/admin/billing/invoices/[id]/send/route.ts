import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit, writeCommunication } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { id: true, parentId: true, childId: true, invoiceNumber: true, status: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
  }

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'INVOICE_SENT',
      targetType: 'Invoice',
      targetId: invoice.id,
      metadata: { invoiceNumber: invoice.invoiceNumber },
    }),
    writeCommunication({
      parentId: invoice.parentId,
      childId: invoice.childId,
      invoiceId: invoice.id,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: `Invoice ${invoice.invoiceNumber} sent`,
      message: `Invoice ${invoice.invoiceNumber} is ready for payment.`,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
