import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  rebalanceBatchSiblingPricing,
  syncSiblingPricingAdjustmentsToStripe,
} from '@/lib/billing/sibling-pricing';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit, writeCommunication } from '@/lib/events';
import { sendEnrollmentDecisionNotifications } from '@/lib/communications/enrollment-decision';
import { getStripeServer } from '@/lib/stripe';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

const unenrollSchema = z.object({
  reason: z.string().min(2).max(240).optional(),
  reviewNotes: z.string().min(2).max(600).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.ADMISSIONS_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const raw = await request.json().catch(() => ({}));
  const parsed = unenrollSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid unenroll payload' } }, { status: 400 });
  }

  const enrollment = await prisma.enrollmentApplication.findUnique({
    where: { id },
    include: {
      child: true,
      parent: true,
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: { message: 'Enrollment not found' } }, { status: 404 });
  }

  const alreadyUnenrolled =
    enrollment.status === 'DENIED' &&
    Boolean(enrollment.decisionReason && enrollment.decisionReason.toLowerCase().includes('unenroll'));
  if (alreadyUnenrolled) {
    return NextResponse.json({
      enrollment,
      contractsCanceled: 0,
      pricingAdjustments: [],
      message: 'Enrollment is already marked as unenrolled.',
    });
  }

  const reason = parsed.data.reason?.trim() || 'Unenrolled by admin';
  const reviewNotes = parsed.data.reviewNotes?.trim() || 'Enrollment closed by admin unenroll action.';
  const now = new Date();

  const activeContracts = await prisma.childTuitionContract.findMany({
    where: {
      parentId: enrollment.parentId,
      childId: enrollment.childId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    select: {
      id: true,
      stripeSubscriptionId: true,
    },
  });

  const txResult = await prisma.$transaction(async (tx) => {
    const updatedEnrollment = await tx.enrollmentApplication.update({
      where: { id: enrollment.id },
      data: {
        status: 'DENIED',
        decisionReason: reason,
        reviewNotes,
        reviewedById: user.id,
        reviewedAt: now,
        approvedAt: null,
        selectedCadence: null,
        spotHoldExpiresAt: null,
        spotSecuredAt: null,
      },
      include: {
        child: true,
        parent: true,
      },
    });

    const canceledContracts = await tx.childTuitionContract.updateMany({
      where: {
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      data: {
        status: 'CANCELED',
        nextChargeDate: null,
      },
    });

    const pricing =
      enrollment.intakeBatchId
        ? await rebalanceBatchSiblingPricing(tx, {
            parentId: enrollment.parentId,
            intakeBatchId: enrollment.intakeBatchId,
          })
        : { securedEnrollmentCount: 0, activeContractCount: 0, adjustments: [] };

    return {
      updatedEnrollment,
      canceledContracts,
      pricing,
    };
  });

  const stripe = getStripeServer();
  let stripeCanceled = 0;
  let stripeCancelFailed = 0;

  if (stripe) {
    for (const contract of activeContracts) {
      if (!contract.stripeSubscriptionId) continue;
      try {
        await stripe.subscriptions.cancel(contract.stripeSubscriptionId);
        stripeCanceled += 1;
      } catch (cancelError) {
        stripeCancelFailed += 1;
        console.error('UNENROLL_STRIPE_CANCEL_FAILED', {
          enrollmentId: enrollment.id,
          contractId: contract.id,
          subscriptionId: contract.stripeSubscriptionId,
          cancelError,
        });
      }
    }
  }

  const stripePricingSync = await syncSiblingPricingAdjustmentsToStripe(txResult.pricing.adjustments);
  await syncFamilyCrmProfile(prisma, enrollment.parentId);

  const dashboardUrl = `${new URL(request.url).origin}/dashboard/family`;
  const delivery = await sendEnrollmentDecisionNotifications({
    status: 'DENIED',
    parentFirstName: txResult.updatedEnrollment.parent.firstName,
    parentEmail: txResult.updatedEnrollment.parent.email,
    parentPhone: txResult.updatedEnrollment.parent.phone,
    childFirstName: txResult.updatedEnrollment.child.firstName,
    childLastName: txResult.updatedEnrollment.child.lastName,
    startDate: txResult.updatedEnrollment.startDate,
    holdExpiresAt: null,
    dashboardUrl,
  });

  await Promise.all([
    writeCommunication({
      parentId: txResult.updatedEnrollment.parentId,
      childId: txResult.updatedEnrollment.childId,
      enrollmentId: txResult.updatedEnrollment.id,
      type: 'ENROLLMENT',
      channel: 'IN_APP',
      subject: 'Enrollment updated',
      message: `${txResult.updatedEnrollment.child.firstName} ${txResult.updatedEnrollment.child.lastName} was unenrolled by admissions. Contact the center for next steps.`,
    }),
    writeAudit({
      actorId: user.id,
      action: 'ENROLLMENT_UNENROLLED_BY_ADMIN',
      targetType: 'EnrollmentApplication',
      targetId: txResult.updatedEnrollment.id,
      metadata: {
        reason,
        reviewNotes,
        contractsCanceled: txResult.canceledContracts.count,
        stripeCanceled,
        stripeCancelFailed,
        pricingAdjustments: txResult.pricing.adjustments,
        stripePricingSync,
        notificationDelivery: delivery,
      },
    }),
  ]);

  return NextResponse.json({
    enrollment: txResult.updatedEnrollment,
    contractsCanceled: txResult.canceledContracts.count,
    stripeCanceled,
    stripeCancelFailed,
    pricingAdjustments: txResult.pricing.adjustments,
    pricingSummary: {
      securedEnrollmentCount: txResult.pricing.securedEnrollmentCount,
      activeContractCount: txResult.pricing.activeContractCount,
    },
  });
}
