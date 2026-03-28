import type { BillingCadence, Prisma, PrismaClient } from '@prisma/client';
import { cadenceToStripeInterval, deriveRecurringAmount } from '@/lib/billing';
import { getStripeServer } from '@/lib/stripe';

type DbClient = PrismaClient | Prisma.TransactionClient;

export const SIBLING_BATCH_DISCOUNT_RATE = 0.1;

export interface SiblingPricingAdjustment {
  contractId: string;
  parentId: string;
  childId: string;
  billingCadence: BillingCadence;
  previousRecurringAmountCents: number;
  nextRecurringAmountCents: number;
  stripeSubscriptionId: string | null;
}

function applySiblingDiscount(baseCents: number, siblingIndex: number) {
  if (siblingIndex <= 0) return baseCents;
  return Math.max(0, Math.round(baseCents * (1 - SIBLING_BATCH_DISCOUNT_RATE)));
}

export async function rebalanceBatchSiblingPricing(
  db: DbClient,
  input: { parentId: string; intakeBatchId: string },
): Promise<{
  securedEnrollmentCount: number;
  activeContractCount: number;
  adjustments: SiblingPricingAdjustment[];
}> {
  const securedEnrollments = await db.enrollmentApplication.findMany({
    where: {
      parentId: input.parentId,
      intakeBatchId: input.intakeBatchId,
      status: 'APPROVED',
      spotSecuredAt: { not: null },
    },
    select: {
      id: true,
      childId: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  if (!securedEnrollments.length) {
    return { securedEnrollmentCount: 0, activeContractCount: 0, adjustments: [] };
  }

  const childIds = Array.from(new Set(securedEnrollments.map((enrollment) => enrollment.childId)));
  const contracts = await db.childTuitionContract.findMany({
    where: {
      parentId: input.parentId,
      childId: { in: childIds },
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    include: {
      tuitionPlan: {
        select: {
          monthlyAmountCents: true,
        },
      },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
  });

  const latestByChild = new Map<string, (typeof contracts)[number]>();
  for (const contract of contracts) {
    if (!latestByChild.has(contract.childId)) {
      latestByChild.set(contract.childId, contract);
    }
  }

  const activeOrderedContracts = securedEnrollments
    .map((enrollment) => latestByChild.get(enrollment.childId))
    .filter((contract): contract is NonNullable<typeof contract> => Boolean(contract));

  if (!activeOrderedContracts.length) {
    return {
      securedEnrollmentCount: securedEnrollments.length,
      activeContractCount: 0,
      adjustments: [],
    };
  }

  const updates: SiblingPricingAdjustment[] = [];

  for (let index = 0; index < activeOrderedContracts.length; index += 1) {
    const contract = activeOrderedContracts[index];
    const baseRecurring = deriveRecurringAmount(contract.tuitionPlan.monthlyAmountCents, contract.billingCadence);
    const targetRecurring = applySiblingDiscount(baseRecurring, index);

    if (targetRecurring === contract.recurringAmountCents) continue;

    await db.childTuitionContract.update({
      where: { id: contract.id },
      data: {
        recurringAmountCents: targetRecurring,
      },
    });

    updates.push({
      contractId: contract.id,
      parentId: contract.parentId,
      childId: contract.childId,
      billingCadence: contract.billingCadence,
      previousRecurringAmountCents: contract.recurringAmountCents,
      nextRecurringAmountCents: targetRecurring,
      stripeSubscriptionId: contract.stripeSubscriptionId,
    });
  }

  return {
    securedEnrollmentCount: securedEnrollments.length,
    activeContractCount: activeOrderedContracts.length,
    adjustments: updates,
  };
}

export async function syncSiblingPricingAdjustmentsToStripe(adjustments: SiblingPricingAdjustment[]) {
  const stripe = getStripeServer();
  if (!stripe) {
    return {
      attempted: 0,
      updated: 0,
      failed: 0,
      skipped: adjustments.length,
      reason: 'STRIPE_NOT_CONFIGURED',
    };
  }

  let attempted = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const adjustment of adjustments) {
    if (!adjustment.stripeSubscriptionId) {
      skipped += 1;
      continue;
    }

    attempted += 1;

    try {
      const subscription = await stripe.subscriptions.retrieve(adjustment.stripeSubscriptionId);
      const firstItem = subscription.items.data[0];

      if (!firstItem) {
        skipped += 1;
        continue;
      }

      const productId = typeof firstItem.price.product === 'string' ? firstItem.price.product : null;
      if (!productId) {
        skipped += 1;
        continue;
      }

      const interval = cadenceToStripeInterval(adjustment.billingCadence);
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: adjustment.nextRecurringAmountCents,
        recurring: {
          interval: interval.interval,
          interval_count: interval.interval_count,
        },
        product: productId,
        metadata: {
          flow: 'sibling_pricing_rebalance_v3',
          contractId: adjustment.contractId,
          childId: adjustment.childId,
        },
      });

      await stripe.subscriptions.update(adjustment.stripeSubscriptionId, {
        items: [
          {
            id: firstItem.id,
            price: price.id,
          },
        ],
        proration_behavior: 'none',
      });

      updated += 1;
    } catch (error) {
      failed += 1;
      console.error('SIBLING_PRICING_STRIPE_SYNC_FAILED', {
        contractId: adjustment.contractId,
        subscriptionId: adjustment.stripeSubscriptionId,
        error,
      });
    }
  }

  return { attempted, updated, failed, skipped };
}
