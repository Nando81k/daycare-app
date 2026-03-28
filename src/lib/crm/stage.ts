import type { Prisma, PrismaClient } from '@prisma/client';
import { FamilyCrmStage } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export const FAMILY_CRM_STAGES: FamilyCrmStage[] = [
  FamilyCrmStage.LEAD,
  FamilyCrmStage.INTAKE_INCOMPLETE,
  FamilyCrmStage.ADMISSIONS_REVIEW,
  FamilyCrmStage.APPROVED_AWAITING_SPOT,
  FamilyCrmStage.ACTIVE_FAMILY,
  FamilyCrmStage.AT_RISK_BILLING,
];

export interface FamilyStageSignals {
  childrenCount: number;
  hasPendingOrRequestInfoEnrollment: boolean;
  hasApprovedWithoutSecuredSpot: boolean;
  hasActiveContract: boolean;
  openInvoiceCount: number;
  pastDueInvoiceCount: number;
  outstandingBalanceCents: number;
}

export function deriveSuggestedStage(signals: FamilyStageSignals): FamilyCrmStage {
  const billingRisk =
    signals.pastDueInvoiceCount > 0 ||
    (signals.openInvoiceCount >= 3 && signals.outstandingBalanceCents > 0);
  if (billingRisk) return FamilyCrmStage.AT_RISK_BILLING;

  if (signals.hasApprovedWithoutSecuredSpot) {
    return FamilyCrmStage.APPROVED_AWAITING_SPOT;
  }

  if (signals.hasPendingOrRequestInfoEnrollment) {
    return FamilyCrmStage.ADMISSIONS_REVIEW;
  }

  if (signals.hasActiveContract) {
    return FamilyCrmStage.ACTIVE_FAMILY;
  }

  if (signals.childrenCount > 0) {
    return FamilyCrmStage.INTAKE_INCOMPLETE;
  }

  return FamilyCrmStage.LEAD;
}

async function loadFamilySignals(tx: PrismaLike, parentId: string): Promise<FamilyStageSignals> {
  const [childrenCount, enrollments, contracts, invoiceAgg, invoiceCounts] = await Promise.all([
    tx.child.count({ where: { parentId } }),
    tx.enrollmentApplication.findMany({
      where: { parentId },
      select: { status: true, spotSecuredAt: true },
    }),
    tx.childTuitionContract.findMany({
      where: { parentId },
      select: { status: true },
    }),
    tx.invoice.aggregate({
      where: {
        parentId,
        status: { in: ['OPEN', 'PAST_DUE'] },
      },
      _sum: { amountDueCents: true },
    }),
    tx.invoice.groupBy({
      where: { parentId, status: { in: ['OPEN', 'PAST_DUE'] } },
      by: ['status'],
      _count: { _all: true },
    }),
  ]);

  const openInvoiceCount = invoiceCounts.find((item) => item.status === 'OPEN')?._count._all ?? 0;
  const pastDueInvoiceCount = invoiceCounts.find((item) => item.status === 'PAST_DUE')?._count._all ?? 0;

  return {
    childrenCount,
    hasPendingOrRequestInfoEnrollment: enrollments.some(
      (enrollment) => enrollment.status === 'PENDING' || enrollment.status === 'REQUEST_INFO',
    ),
    hasApprovedWithoutSecuredSpot: enrollments.some(
      (enrollment) => enrollment.status === 'APPROVED' && !enrollment.spotSecuredAt,
    ),
    hasActiveContract: contracts.some((contract) => contract.status === 'ACTIVE'),
    openInvoiceCount,
    pastDueInvoiceCount,
    outstandingBalanceCents: invoiceAgg._sum.amountDueCents ?? 0,
  };
}

export async function ensureFamilyCrmProfiles(tx: PrismaLike, parentIds: string[]) {
  const uniqueParentIds = Array.from(new Set(parentIds.filter(Boolean)));
  if (!uniqueParentIds.length) return;

  await tx.familyCrmProfile.createMany({
    data: uniqueParentIds.map((parentId) => ({ parentId })),
    skipDuplicates: true,
  });
}

export async function syncFamilyCrmProfile(tx: PrismaLike, parentId: string) {
  if (!parentId) return null;

  const profile = await tx.familyCrmProfile.upsert({
    where: { parentId },
    update: {},
    create: { parentId },
  });

  const signals = await loadFamilySignals(tx, parentId);
  const suggestedStage = deriveSuggestedStage(signals);
  const nextStage = profile.isStageManuallyOverridden ? profile.stage : suggestedStage;

  return tx.familyCrmProfile.update({
    where: { id: profile.id },
    data: {
      suggestedStage,
      stage: nextStage,
    },
  });
}

export async function syncFamilyCrmProfiles(parentIds: string[]) {
  const uniqueParentIds = Array.from(new Set(parentIds.filter(Boolean)));
  if (!uniqueParentIds.length) return;

  await prisma.$transaction(async (tx) => {
    await ensureFamilyCrmProfiles(tx, uniqueParentIds);
    for (const parentId of uniqueParentIds) {
      await syncFamilyCrmProfile(tx, parentId);
    }
  });
}
