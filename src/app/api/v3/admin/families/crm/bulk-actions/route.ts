import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCrmProfileForParent, refreshProfileFollowUpFromTasks } from '@/lib/crm/helpers';
import { syncFamilyCrmProfiles } from '@/lib/crm/stage';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmBulkActionSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmBulkActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM bulk action payload' } }, { status: 400 });
  }
  const payload = parsed.data;

  const familyIds = Array.from(new Set(payload.familyIds));
  const familyCount = await prisma.user.count({
    where: { id: { in: familyIds }, role: 'PARENT' },
  });
  if (familyCount !== familyIds.length) {
    return NextResponse.json({ error: { message: 'One or more families were not found' } }, { status: 404 });
  }

  if (payload.action === 'ASSIGN_OWNER' && payload.ownerAdminId) {
    const owner = await prisma.user.findFirst({
      where: { id: payload.ownerAdminId, role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: { message: 'Assigned owner not found' } }, { status: 404 });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.familyCrmProfile.createMany({
      data: familyIds.map((familyId) => ({ parentId: familyId })),
      skipDuplicates: true,
    });

    if (payload.action === 'ASSIGN_OWNER') {
      const updated = await tx.familyCrmProfile.updateMany({
        where: { parentId: { in: familyIds } },
        data: { ownerAdminId: payload.ownerAdminId ?? null },
      });
      return { updatedCount: updated.count };
    }

    if (payload.action === 'SET_STAGE') {
      const updated = await tx.familyCrmProfile.updateMany({
        where: { parentId: { in: familyIds } },
        data: {
          stage: payload.stage,
          isStageManuallyOverridden: payload.isStageManuallyOverridden ?? true,
        },
      });
      return { updatedCount: updated.count };
    }

    if (payload.action === 'CLEAR_MANUAL_OVERRIDE') {
      const updated = await tx.familyCrmProfile.updateMany({
        where: { parentId: { in: familyIds } },
        data: {
          isStageManuallyOverridden: false,
        },
      });
      return { updatedCount: updated.count };
    }

    if (payload.action === 'SET_ACTIVE') {
      const updated = await tx.user.updateMany({
        where: { id: { in: familyIds }, role: 'PARENT' },
        data: {
          isActive: payload.isActive,
        },
      });
      return { updatedCount: updated.count };
    }

    if (payload.action === 'CREATE_TASK' && payload.task) {
      let createdCount = 0;
      for (const familyId of familyIds) {
        const profile = await ensureCrmProfileForParent(tx, familyId);
        await tx.familyCrmTask.create({
          data: {
            profileId: profile.id,
            title: payload.task.title,
            description: payload.task.description ?? null,
            status: payload.task.status,
            priority: payload.task.priority,
            dueAt: payload.task.dueAt ? new Date(payload.task.dueAt) : null,
            ownerAdminId: payload.task.ownerAdminId ?? null,
            childId: payload.task.childId ?? null,
            enrollmentId: payload.task.enrollmentId ?? null,
            invoiceId: payload.task.invoiceId ?? null,
            createdByAdminId: user.id,
          },
        });
        await refreshProfileFollowUpFromTasks(tx, profile.id);
        createdCount += 1;
      }

      return { updatedCount: createdCount };
    }

    return { updatedCount: 0 };
  });

  if (payload.action === 'CLEAR_MANUAL_OVERRIDE') {
    await syncFamilyCrmProfiles(familyIds);
  }

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_BULK_ACTION_APPLIED',
    targetType: 'FamilyCrmProfile',
    targetId: `bulk:${payload.action}`,
    metadata: {
      action: payload.action,
      familyIds,
      updatedCount: result.updatedCount,
      payload,
      clientMetrics: payload.clientMetrics ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    action: payload.action,
    familyCount: familyIds.length,
    updatedCount: result.updatedCount,
  });
}
