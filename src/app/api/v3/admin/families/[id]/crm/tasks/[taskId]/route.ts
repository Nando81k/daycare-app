import { NextResponse } from 'next/server';
import { FamilyCrmTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ensureParentFamily, refreshProfileFollowUpFromTasks, validateCrmLinkedEntities } from '@/lib/crm/helpers';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmTaskPatchSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

async function resolveTask(parentId: string, taskId: string) {
  return prisma.familyCrmTask.findFirst({
    where: {
      id: taskId,
      profile: { parentId },
    },
    include: {
      profile: {
        select: { id: true, parentId: true },
      },
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id, taskId } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const existing = await resolveTask(id, taskId);
  if (!existing) {
    return NextResponse.json({ error: { message: 'Task not found for this family' } }, { status: 404 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmTaskPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM task update payload' } }, { status: 400 });
  }
  const payload = parsed.data;

  if (payload.ownerAdminId) {
    const owner = await prisma.user.findFirst({
      where: { id: payload.ownerAdminId, role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: { message: 'Task owner not found' } }, { status: 404 });
    }
  }

  const linkageValidation = await validateCrmLinkedEntities(prisma, id, {
    childId: payload.childId,
    enrollmentId: payload.enrollmentId,
    invoiceId: payload.invoiceId,
  });
  if (!linkageValidation.ok) {
    return NextResponse.json({ error: { message: linkageValidation.error } }, { status: 404 });
  }

  const status = payload.status ?? existing.status;
  const completedAt =
    status === FamilyCrmTaskStatus.DONE
      ? existing.completedAt ?? new Date()
      : null;

  const updated = await prisma.familyCrmTask.update({
    where: { id: existing.id },
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      dueAt:
        payload.dueAt === undefined
          ? undefined
          : payload.dueAt
            ? new Date(payload.dueAt)
            : null,
      ownerAdminId: payload.ownerAdminId,
      childId: payload.childId,
      enrollmentId: payload.enrollmentId,
      invoiceId: payload.invoiceId,
      completedAt,
    },
    include: {
      ownerAdmin: { select: { id: true, firstName: true, lastName: true } },
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await refreshProfileFollowUpFromTasks(prisma, existing.profile.id);
  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TASK_UPDATED',
    targetType: 'FamilyCrmTask',
    targetId: existing.id,
    metadata: {
      ...payload,
      clientMetrics: payload.clientMetrics ?? null,
    },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id, taskId } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const existing = await resolveTask(id, taskId);
  if (!existing) {
    return NextResponse.json({ error: { message: 'Task not found for this family' } }, { status: 404 });
  }

  await prisma.familyCrmTask.delete({
    where: { id: existing.id },
  });
  await refreshProfileFollowUpFromTasks(prisma, existing.profile.id);

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TASK_DELETED',
    targetType: 'FamilyCrmTask',
    targetId: existing.id,
    metadata: { parentId: id },
  });

  return NextResponse.json({ ok: true });
}
