import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit, writeCommunication } from '@/lib/events';
import { isSameOriginMutationRequest, requireApiParent } from '@/lib/route-helpers';
import {
  getPaymentGateway,
  isPaymentProviderUnavailableError,
} from '@/lib/payments/provider';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  if (!isSameOriginMutationRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden origin' } }, { status: 403 });
  }
  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      parentId: user.id,
    },
    include: {
      child: true,
      parent: true,
      lineItems: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
  }

  if (!(invoice.status === 'OPEN' || invoice.status === 'PAST_DUE')) {
    return NextResponse.json({ error: { message: 'Invoice is not collectible' } }, { status: 409 });
  }

  if (invoice.amountDueCents <= 0) {
    return NextResponse.json({ error: { message: 'Invoice has no remaining balance' } }, { status: 409 });
  }

  const gateway = getPaymentGateway();

  let stripeCustomerId: string;

  if (gateway.kind === 'stripe') {
    const existing = await prisma.stripeCustomer.findUnique({ where: { userId: user.id } });
    if (existing) {
      stripeCustomerId = existing.stripeCustomerId;
    } else {
      const customer = await gateway.stripe.customers.create({
        email: invoice.parent.email,
        name: `${invoice.parent.firstName} ${invoice.parent.lastName}`,
        phone: invoice.parent.phone || undefined,
        metadata: { appUserId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.stripeCustomer.create({
        data: {
          userId: user.id,
          stripeCustomerId,
        },
      });
    }
  } else {
    stripeCustomerId = '';
  }

  const origin = new URL(request.url).origin;

  let session: { url: string; sessionId: string; paymentProviderState: 'connected' | 'disconnected' };
  try {
    session = await gateway.createInvoiceCheckoutSession({
      customerId: stripeCustomerId,
      origin,
      invoice: {
        id: invoice.id,
        parentId: user.id,
        invoiceNumber: invoice.invoiceNumber,
        amountDueCents: invoice.amountDueCents,
        childLabel: invoice.child
          ? `${invoice.child.firstName} ${invoice.child.lastName} tuition`
          : 'Tuition invoice payment',
      },
    });
  } catch (error) {
    if (isPaymentProviderUnavailableError(error)) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
          paymentProviderState: error.paymentProviderState,
        },
        { status: error.statusCode },
      );
    }
    console.error('PARENT_INVOICE_CHECKOUT_SESSION_FAILED', error);
    return NextResponse.json({ error: { message: 'Unable to start checkout session' } }, { status: 500 });
  }

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'INVOICE_CHECKOUT_SESSION_CREATED',
      targetType: 'Invoice',
      targetId: invoice.id,
      metadata: { sessionId: session.sessionId },
    }),
    writeCommunication({
      parentId: user.id,
      childId: invoice.childId,
      invoiceId: invoice.id,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: `Payment started for ${invoice.invoiceNumber}`,
      message: 'Secure checkout started for your invoice.',
    }),
  ]);

  return NextResponse.json({ url: session.url, paymentProviderState: session.paymentProviderState });
}
