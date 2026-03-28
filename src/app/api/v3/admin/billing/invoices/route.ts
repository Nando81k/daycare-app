import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit, writeCommunication } from '@/lib/events';
import { invoiceSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function GET(request: Request) {
  const { error } = await requireApiAdmin();
  if (error) return error;

  const searchParams = new URL(request.url).searchParams;
  const status = searchParams.get('status');

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
    },
    include: {
      parent: { select: { firstName: true, lastName: true, email: true } },
      child: { select: { firstName: true, lastName: true } },
      lineItems: true,
    },
    orderBy: { dueDate: 'asc' },
    take: 200,
  });

  return NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin();
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = invoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid invoice payload' } }, { status: 400 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      ...parsed.data,
      issueDate: new Date(parsed.data.issueDate),
      dueDate: new Date(parsed.data.dueDate),
    },
  });

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'INVOICE_CREATED',
      targetType: 'Invoice',
      targetId: invoice.id,
      metadata: parsed.data,
    }),
    writeCommunication({
      parentId: invoice.parentId,
      childId: invoice.childId,
      invoiceId: invoice.id,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: 'Invoice created',
      message: `A new invoice ${invoice.invoiceNumber} is ready.`,
    }),
  ]);
  await syncFamilyCrmProfile(prisma, invoice.parentId);

  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin();
  if (error || !user) return error;

  const payload = await parseJson<{
    id?: string;
    status?: 'OPEN' | 'VOID' | 'PAST_DUE';
    amountDueCents?: number;
    dueDate?: string;
  }>(request);
  if (!payload?.id) {
    return NextResponse.json({ error: { message: 'Invoice id is required' } }, { status: 400 });
  }

  const parsedDueDate = payload.dueDate ? new Date(payload.dueDate) : null;
  if (parsedDueDate && Number.isNaN(parsedDueDate.getTime())) {
    return NextResponse.json({ error: { message: 'Invalid due date' } }, { status: 400 });
  }

  if (payload.status && !['OPEN', 'PAST_DUE', 'VOID'].includes(payload.status)) {
    return NextResponse.json(
      { error: { message: 'Status must be OPEN, PAST_DUE, or VOID' } },
      { status: 400 },
    );
  }

  const invoice = await prisma.invoice.update({
    where: { id: payload.id },
    data: {
      status: payload.status,
      amountDueCents: payload.amountDueCents,
      dueDate: parsedDueDate ?? undefined,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'INVOICE_UPDATED',
    targetType: 'Invoice',
    targetId: invoice.id,
    metadata: payload,
  });
  await syncFamilyCrmProfile(prisma, invoice.parentId);

  return NextResponse.json({ invoice });
}
