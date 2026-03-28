import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiParent } from '@/lib/route-helpers';
import { getPaymentProviderState } from '@/lib/payments/provider';

export async function GET() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const [invoices, lastPayment] = await Promise.all([
    prisma.invoice.findMany({
      where: { parentId: user.id },
      orderBy: { dueDate: 'asc' },
      take: 80,
    }),
    prisma.paymentTransaction.findFirst({
      where: { parentId: user.id, status: 'SUCCEEDED' },
      orderBy: { processedAt: 'desc' },
    }),
  ]);

  const dueNowCents = invoices
    .filter((invoice) => invoice.status === 'OPEN' || invoice.status === 'PAST_DUE')
    .reduce((sum, invoice) => sum + invoice.amountDueCents, 0);

  const nextDue = invoices.find((invoice) => invoice.status === 'OPEN' || invoice.status === 'PAST_DUE')?.dueDate || null;

  return NextResponse.json({
    paymentProviderState: getPaymentProviderState(),
    dueNowCents,
    nextDue,
    invoiceCount: invoices.length,
    openInvoices: invoices.filter((invoice) => invoice.status === 'OPEN').length,
    pastDueInvoices: invoices.filter((invoice) => invoice.status === 'PAST_DUE').length,
    lastPayment,
  });
}
