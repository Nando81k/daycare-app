import type { Prisma, PrismaClient } from '@prisma/client';
import { FamilyCrmTaskStatus } from '@prisma/client';

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export async function ensureParentFamily(tx: PrismaLike, parentId: string) {
  const parent = await tx.user.findFirst({
    where: { id: parentId, role: 'PARENT' },
    select: { id: true },
  });
  return parent;
}

export async function ensureCrmProfileForParent(tx: PrismaLike, parentId: string) {
  return tx.familyCrmProfile.upsert({
    where: { parentId },
    update: {},
    create: { parentId },
  });
}

export async function validateCrmLinkedEntities(
  tx: PrismaLike,
  parentId: string,
  input: {
    childId?: string | null;
    enrollmentId?: string | null;
    invoiceId?: string | null;
  },
) {
  if (input.childId) {
    const child = await tx.child.findFirst({
      where: { id: input.childId, parentId },
      select: { id: true },
    });
    if (!child) {
      return { ok: false as const, error: 'Child not found for this family' };
    }
  }

  if (input.enrollmentId) {
    const enrollment = await tx.enrollmentApplication.findFirst({
      where: { id: input.enrollmentId, parentId },
      select: { id: true },
    });
    if (!enrollment) {
      return { ok: false as const, error: 'Enrollment not found for this family' };
    }
  }

  if (input.invoiceId) {
    const invoice = await tx.invoice.findFirst({
      where: { id: input.invoiceId, parentId },
      select: { id: true },
    });
    if (!invoice) {
      return { ok: false as const, error: 'Invoice not found for this family' };
    }
  }

  return { ok: true as const };
}

export async function refreshProfileFollowUpFromTasks(tx: PrismaLike, profileId: string) {
  const nextTask = await tx.familyCrmTask.findFirst({
    where: {
      profileId,
      status: { not: FamilyCrmTaskStatus.DONE },
      dueAt: { not: null },
    },
    orderBy: { dueAt: 'asc' },
    select: { dueAt: true },
  });

  return tx.familyCrmProfile.update({
    where: { id: profileId },
    data: {
      nextFollowUpAt: nextTask?.dueAt ?? null,
    },
  });
}
