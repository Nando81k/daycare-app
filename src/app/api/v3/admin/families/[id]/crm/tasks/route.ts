import { NextResponse } from 'next/server';
import { FamilyCrmTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ensureCrmProfileForParent, ensureParentFamily, refreshProfileFollowUpFromTasks, validateCrmLinkedEntities } from '@/lib/crm/helpers';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmTaskCreateSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin(PERMISSIONS.CRM_READ);
  if (error) return error;
  const { id } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const profile = await ensureCrmProfileForParent(prisma, id);
  const tasks = await prisma.familyCrmTask.findMany({
    where: { profileId: profile.id },
    include: {
      ownerAdmin: { select: { id: true, firstName: true, lastName: true } },
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmTaskCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM task payload' } }, { status: 400 });
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

  const profile = await ensureCrmProfileForParent(prisma, id);
  const linkageValidation = await validateCrmLinkedEntities(prisma, id, {
    childId: payload.childId,
    enrollmentId: payload.enrollmentId,
    invoiceId: payload.invoiceId,
  });
  if (!linkageValidation.ok) {
    return NextResponse.json({ error: { message: linkageValidation.error } }, { status: 404 });
  }

  const created = await prisma.familyCrmTask.create({
    data: {
      profileId: profile.id,
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status,
      priority: payload.priority,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
      ownerAdminId: payload.ownerAdminId ?? null,
      createdByAdminId: user.id,
      childId: payload.childId ?? null,
      enrollmentId: payload.enrollmentId ?? null,
      invoiceId: payload.invoiceId ?? null,
      completedAt: payload.status === FamilyCrmTaskStatus.DONE ? new Date() : null,
    },
    include: {
      ownerAdmin: { select: { id: true, firstName: true, lastName: true } },
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await refreshProfileFollowUpFromTasks(prisma, profile.id);
  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TASK_CREATED',
    targetType: 'FamilyCrmTask',
    targetId: created.id,
    metadata: {
      parentId: id,
      payload,
      clientMetrics: payload.clientMetrics ?? null,
    },
  });

  return NextResponse.json({ task: created }, { status: 201 });
}
