import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { getStripeServer } from '@/lib/stripe';
import { isSameOriginMutationRequest, requireApiParent, parseJson } from '@/lib/route-helpers';
import { getPortalReadiness, resolveSafeReturnUrl } from '@/lib/billing-portal';

const schema = z.object({
  returnUrl: z.string().optional(),
});

export async function POST(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  if (!isSameOriginMutationRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden origin' } }, { status: 403 });
  }

  const readiness = await getPortalReadiness();
  if (!readiness.enabled) {
    return NextResponse.json({ error: { message: readiness.message }, code: readiness.code }, { status: 503 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = schema.safeParse(raw || {});
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid portal request payload' } }, { status: 400 });
  }

  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json({ error: { message: 'Stripe is not configured' } }, { status: 503 });
  }

  let stripeCustomerId: string;
  const existing = await prisma.stripeCustomer.findUnique({ where: { userId: user.id } });

  if (existing) {
    stripeCustomerId = existing.stripeCustomerId;
    try {
      await stripe.customers.retrieve(stripeCustomerId);
    } catch {
      const parent = await prisma.user.findUnique({ where: { id: user.id } });
      if (!parent) {
        return NextResponse.json({ error: { message: 'Parent account not found' } }, { status: 404 });
      }
      const customer = await stripe.customers.create({
        email: parent.email,
        name: `${parent.firstName} ${parent.lastName}`,
        phone: parent.phone || undefined,
        metadata: { appUserId: parent.id },
      });
      stripeCustomerId = customer.id;
      await prisma.stripeCustomer.update({
        where: { userId: user.id },
        data: { stripeCustomerId },
      });
    }
  } else {
    const parent = await prisma.user.findUnique({ where: { id: user.id } });
    if (!parent) {
      return NextResponse.json({ error: { message: 'Parent account not found' } }, { status: 404 });
    }

    const customer = await stripe.customers.create({
      email: parent.email,
      name: `${parent.firstName} ${parent.lastName}`,
      phone: parent.phone || undefined,
      metadata: { appUserId: parent.id },
    });

    stripeCustomerId = customer.id;

    await prisma.stripeCustomer.create({
      data: {
        userId: user.id,
        stripeCustomerId,
      },
    });
  }

  const origin = new URL(request.url).origin;
  const returnUrl = resolveSafeReturnUrl(parsed.data.returnUrl, origin);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
      configuration: process.env.STRIPE_BILLING_PORTAL_CONFIG_ID || undefined,
    });

    await writeAudit({
      actorId: user.id,
      action: 'BILLING_PORTAL_SESSION_CREATED',
      targetType: 'StripeCustomer',
      targetId: stripeCustomerId,
      metadata: { returnUrl },
    });

    return NextResponse.json({ url: session.url });
  } catch (createError) {
    console.error('Portal session creation error', createError);

    await writeAudit({
      actorId: user.id,
      action: 'BILLING_PORTAL_SESSION_FAILED',
      targetType: 'StripeCustomer',
      targetId: stripeCustomerId,
      metadata: { returnUrl },
    });

    return NextResponse.json(
      {
        error: {
          message: 'Billing portal is temporarily unavailable. Please try again later.',
        },
      },
      { status: 503 }
    );
  }
}
