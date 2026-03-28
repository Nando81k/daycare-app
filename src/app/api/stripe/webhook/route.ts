import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { cadenceToStripeInterval, deriveRecurringAmount } from '@/lib/billing';
import {
  rebalanceBatchSiblingPricing,
  syncSiblingPricingAdjustmentsToStripe,
} from '@/lib/billing/sibling-pricing';
import { writeAudit, writeCommunication } from '@/lib/events';
import {
  getPaymentGateway,
  isPaymentProviderUnavailableError,
} from '@/lib/payments/provider';

export const runtime = 'nodejs';

type BillingCadence = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

function resolveCadence(value: string | undefined): BillingCadence {
  if (value === 'BIWEEKLY') return 'BIWEEKLY';
  if (value === 'WEEKLY') return 'WEEKLY';
  return 'MONTHLY';
}

function resolvePlan(
  plans: Array<{
    id: string;
    name: string;
    programType: 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K' | null;
    monthlyAmountCents: number;
    registrationFeeCents: number;
    allowMonthly: boolean;
    allowBiweekly: boolean;
    allowWeekly: boolean;
  }>,
  programType: 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K'
) {
  return plans.find((plan) => plan.programType === programType) ?? plans.find((plan) => plan.programType === null) ?? null;
}

async function upsertSeatSecureContract(input: {
  enrollment: {
    id: string;
    parentId: string;
    childId: string;
    startDate: Date | null;
  };
  plan: { id: string; monthlyAmountCents: number };
  cadence: BillingCadence;
  now: Date;
  stripeSubscriptionId: string | null;
}) {
  const recurringAmount = deriveRecurringAmount(input.plan.monthlyAmountCents, input.cadence);

  const existingContract = await prisma.childTuitionContract.findFirst({
    where: {
      parentId: input.enrollment.parentId,
      childId: input.enrollment.childId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existingContract) {
    await prisma.childTuitionContract.update({
      where: { id: existingContract.id },
      data: {
        tuitionPlanId: input.plan.id,
        billingCadence: input.cadence,
        recurringAmountCents: recurringAmount,
        startDate: input.enrollment.startDate || input.now,
        invoiceDay: (input.enrollment.startDate || input.now).getDate(),
        status: 'ACTIVE',
        autoPayEnabled: true,
        stripeSubscriptionId: input.stripeSubscriptionId ?? existingContract.stripeSubscriptionId,
        nextChargeDate: input.enrollment.startDate || existingContract.nextChargeDate,
      },
    });
    return;
  }

  await prisma.childTuitionContract.create({
    data: {
      parentId: input.enrollment.parentId,
      childId: input.enrollment.childId,
      tuitionPlanId: input.plan.id,
      billingCadence: input.cadence,
      recurringAmountCents: recurringAmount,
      startDate: input.enrollment.startDate || input.now,
      invoiceDay: (input.enrollment.startDate || input.now).getDate(),
      status: 'ACTIVE',
      autoPayEnabled: true,
      stripeSubscriptionId: input.stripeSubscriptionId,
      nextChargeDate: input.enrollment.startDate || null,
    },
  });
}

async function handleSeatSecureCheckoutCompleted(session: Stripe.Checkout.Session) {
  const enrollmentId = session.metadata?.enrollmentId;
  const planId = session.metadata?.planId;
  const cadence = resolveCadence(session.metadata?.cadence);

  if (!enrollmentId || !planId) return;

  const enrollment = await prisma.enrollmentApplication.findUnique({
    where: { id: enrollmentId },
    include: { child: true, parent: true },
  });

  if (!enrollment) return;

  const plan = await prisma.tuitionPlan.findUnique({ where: { id: planId } });
  if (!plan) return;

  const now = new Date();

  await upsertSeatSecureContract({
    enrollment: {
      id: enrollment.id,
      parentId: enrollment.parentId,
      childId: enrollment.childId,
      startDate: enrollment.startDate,
    },
    plan: {
      id: plan.id,
      monthlyAmountCents: plan.monthlyAmountCents,
    },
    cadence,
    now,
    stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
  });

  await prisma.enrollmentApplication.update({
    where: { id: enrollment.id },
    data: {
      selectedCadence: cadence,
      spotSecuredAt: now,
      spotHoldExpiresAt: null,
      stripeCheckoutRef: session.id,
    },
  });

  await Promise.all([
    writeAudit({
      action: 'SEAT_SECURE_CHECKOUT_COMPLETED',
      targetType: 'EnrollmentApplication',
      targetId: enrollment.id,
      metadata: {
        sessionId: session.id,
        subscriptionId: session.subscription,
        cadence,
      },
    }),
    writeCommunication({
      parentId: enrollment.parentId,
      childId: enrollment.childId,
      enrollmentId: enrollment.id,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: 'Seat secured',
      message: `Registration fee and first tuition were received. First recurring charge will follow your ${cadence.toLowerCase()} cadence.`,
    }),
  ]);

  if (enrollment.intakeBatchId) {
    const pricing = await rebalanceBatchSiblingPricing(prisma, {
      parentId: enrollment.parentId,
      intakeBatchId: enrollment.intakeBatchId,
    });
    const stripeSync = await syncSiblingPricingAdjustmentsToStripe(pricing.adjustments);

    if (pricing.adjustments.length) {
      await writeAudit({
        action: 'SIBLING_PRICING_REBALANCED',
        targetType: 'EnrollmentApplication',
        targetId: enrollment.id,
        metadata: {
          intakeBatchId: enrollment.intakeBatchId,
          adjustments: pricing.adjustments,
          stripeSync,
        },
      });
    }
  }
}

async function handleSeatSecureBatchCheckoutCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const cadence = resolveCadence(session.metadata?.cadence);
  const parentId = session.metadata?.parentId;
  const enrollmentIdsRaw = session.metadata?.enrollmentIds;

  if (!parentId || !enrollmentIdsRaw) return;

  const enrollmentIds = Array.from(
    new Set(
      enrollmentIdsRaw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
  if (!enrollmentIds.length) return;

  const [enrollments, plans] = await Promise.all([
    prisma.enrollmentApplication.findMany({
      where: {
        id: { in: enrollmentIds },
        parentId,
      },
      include: { child: true, parent: true },
    }),
    prisma.tuitionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ programType: 'desc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        programType: true,
        monthlyAmountCents: true,
        registrationFeeCents: true,
        allowMonthly: true,
        allowBiweekly: true,
        allowWeekly: true,
      },
    }),
  ]);

  if (!plans.length || !enrollments.length) return;

  const enrollmentMap = new Map(enrollments.map((enrollment) => [enrollment.id, enrollment]));
  const interval = cadenceToStripeInterval(cadence);
  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const now = new Date();
  const touchedBatchIds = new Set<string>();

  let paymentMethodId: string | null = null;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  if (paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentMethodId =
        typeof paymentIntent.payment_method === 'string'
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id ?? null;
    } catch (error) {
      console.error('Unable to resolve payment method for batch seat secure checkout', error);
    }
  }

  for (const enrollmentId of enrollmentIds) {
    const enrollment = enrollmentMap.get(enrollmentId);
    if (!enrollment) continue;
    if (enrollment.intakeBatchId) touchedBatchIds.add(enrollment.intakeBatchId);

    if (enrollment.spotSecuredAt && enrollment.stripeCheckoutRef === session.id) {
      continue;
    }

    if (enrollment.status !== 'APPROVED' || !enrollment.startDate) {
      await writeAudit({
        action: 'SEAT_SECURE_BATCH_ITEM_SKIPPED',
        targetType: 'EnrollmentApplication',
        targetId: enrollment.id,
        metadata: {
          reason: 'Enrollment no longer approvable for secure spot',
          status: enrollment.status,
          sessionId: session.id,
        },
      });
      continue;
    }

    const plan = resolvePlan(plans, enrollment.programType);
    if (!plan) {
      await writeAudit({
        action: 'SEAT_SECURE_BATCH_ITEM_SKIPPED',
        targetType: 'EnrollmentApplication',
        targetId: enrollment.id,
        metadata: {
          reason: 'No active tuition plan',
          sessionId: session.id,
        },
      });
      continue;
    }

    try {
      const recurringAmount = deriveRecurringAmount(plan.monthlyAmountCents, cadence);
      let stripeSubscriptionId: string | null = null;

      if (stripeCustomerId) {
        const product = await stripe.products.create({
          name: `${plan.name} Tuition`,
          description: `${cadence.toLowerCase()} tuition for ${enrollment.child.firstName} ${enrollment.child.lastName}`,
          metadata: {
            flow: 'seat_secure_batch_v3',
            enrollmentId: enrollment.id,
            planId: plan.id,
          },
        });

        const subscription = await stripe.subscriptions.create(
          {
            customer: stripeCustomerId,
            default_payment_method: paymentMethodId || undefined,
            items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: recurringAmount,
                  recurring: {
                    interval: interval.interval,
                    interval_count: interval.interval_count,
                  },
                  product: product.id,
                },
              },
            ],
            trial_end: Math.floor(enrollment.startDate.getTime() / 1000),
            trial_settings: {
              end_behavior: {
                missing_payment_method: 'cancel',
              },
            },
            metadata: {
              flow: 'seat_secure_batch_v3',
              checkoutSessionId: session.id,
              enrollmentId: enrollment.id,
              parentId: enrollment.parentId,
              childId: enrollment.childId,
              planId: plan.id,
              cadence,
            },
          },
          {
            idempotencyKey: `seat-secure-batch-${session.id}-${enrollment.id}`,
          }
        );

        stripeSubscriptionId = subscription.id;
      }

      await upsertSeatSecureContract({
        enrollment: {
          id: enrollment.id,
          parentId: enrollment.parentId,
          childId: enrollment.childId,
          startDate: enrollment.startDate,
        },
        plan: {
          id: plan.id,
          monthlyAmountCents: plan.monthlyAmountCents,
        },
        cadence,
        now,
        stripeSubscriptionId,
      });

      await prisma.enrollmentApplication.update({
        where: { id: enrollment.id },
        data: {
          selectedCadence: cadence,
          spotSecuredAt: now,
          spotHoldExpiresAt: null,
          stripeCheckoutRef: session.id,
        },
      });

      await Promise.all([
        writeAudit({
          action: 'SEAT_SECURE_BATCH_CHECKOUT_COMPLETED',
          targetType: 'EnrollmentApplication',
          targetId: enrollment.id,
          metadata: {
            sessionId: session.id,
            paymentIntentId,
            cadence,
            subscriptionId: stripeSubscriptionId,
          },
        }),
        writeCommunication({
          parentId: enrollment.parentId,
          childId: enrollment.childId,
          enrollmentId: enrollment.id,
          type: 'BILLING',
          channel: 'IN_APP',
          subject: 'Seat secured',
          message: `Registration fee and first tuition were received for ${enrollment.child.firstName}. Recurring billing will follow your ${cadence.toLowerCase()} cadence.`,
        }),
      ]);
    } catch (error) {
      console.error('Seat secure batch item failed', { enrollmentId: enrollment.id, error });
      await writeAudit({
        action: 'SEAT_SECURE_BATCH_ITEM_FAILED',
        targetType: 'EnrollmentApplication',
        targetId: enrollment.id,
        metadata: {
          sessionId: session.id,
          cadence,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  for (const intakeBatchId of touchedBatchIds) {
    const pricing = await rebalanceBatchSiblingPricing(prisma, {
      parentId,
      intakeBatchId,
    });
    const stripeSync = await syncSiblingPricingAdjustmentsToStripe(pricing.adjustments);

    if (pricing.adjustments.length) {
      await writeAudit({
        action: 'SIBLING_PRICING_REBALANCED',
        targetType: 'EnrollmentBatch',
        targetId: intakeBatchId,
        metadata: {
          intakeBatchId,
          parentId,
          adjustments: pricing.adjustments,
          stripeSync,
          source: 'seat_secure_batch_checkout',
          sessionId: session.id,
        },
      });
    }
  }
}

async function handleInvoiceCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) return;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

  const amount = session.amount_total || invoice.amountDueCents;

  if (paymentIntentId) {
    await prisma.paymentTransaction.upsert({
      where: { stripePaymentIntentId: paymentIntentId },
      create: {
        parentId: invoice.parentId,
        invoiceId: invoice.id,
        amountCents: amount,
        status: 'SUCCEEDED',
        paymentMethod: 'card',
        processedAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
      update: {
        amountCents: amount,
        status: 'SUCCEEDED',
        paymentMethod: 'card',
        processedAt: new Date(),
      },
    });
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'PAID',
      amountDueCents: 0,
      paidAt: new Date(),
    },
  });

  await Promise.all([
    writeAudit({
      action: 'INVOICE_CHECKOUT_COMPLETED',
      targetType: 'Invoice',
      targetId: invoice.id,
      metadata: {
        sessionId: session.id,
        paymentIntentId,
        amount,
      },
    }),
    writeCommunication({
      parentId: invoice.parentId,
      childId: invoice.childId,
      invoiceId: invoice.id,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: `Payment received for ${invoice.invoiceNumber}`,
      message: 'Your payment has been received and posted.',
    }),
  ]);
}

async function handlePaymentIntentFailed(intent: Stripe.PaymentIntent) {
  const invoiceId = intent.metadata?.invoiceId;
  if (!invoiceId) return;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;

  await prisma.paymentTransaction.upsert({
    where: { stripePaymentIntentId: intent.id },
    create: {
      parentId: invoice.parentId,
      invoiceId: invoice.id,
      amountCents: intent.amount,
      status: 'FAILED',
      paymentMethod: 'card',
      processedAt: new Date(),
      failureReason: intent.last_payment_error?.message || 'Payment failed',
      stripePaymentIntentId: intent.id,
    },
    update: {
      status: 'FAILED',
      failureReason: intent.last_payment_error?.message || 'Payment failed',
      processedAt: new Date(),
    },
  });

  await writeCommunication({
    parentId: invoice.parentId,
    childId: invoice.childId,
    invoiceId: invoice.id,
    type: 'BILLING',
    channel: 'IN_APP',
    status: 'FAILED',
    subject: `Payment failed for ${invoice.invoiceNumber}`,
    message: 'A recent payment attempt failed. Please update your payment method and retry.',
  });
}

export async function POST(request: Request) {
  const gateway = getPaymentGateway();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook is not configured', paymentProviderState: gateway.state },
      { status: 503 },
    );
  }
  const stripe = gateway.kind === 'stripe' ? gateway.stripe : null;

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = gateway.constructWebhookEvent({ payload, signature, webhookSecret });
  } catch (error) {
    if (isPaymentProviderUnavailableError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          paymentProviderState: error.paymentProviderState,
        },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const flow = session.metadata?.flow;

        if (flow === 'seat_secure_v3') {
          await handleSeatSecureCheckoutCompleted(session);
        } else if (flow === 'seat_secure_batch_v3' && stripe) {
          await handleSeatSecureBatchCheckoutCompleted(stripe, session);
        } else if (flow === 'invoice_checkout_v3') {
          await handleInvoiceCheckoutCompleted(session);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(intent);
        break;
      }
      case 'payment_intent.succeeded': {
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook processing error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
