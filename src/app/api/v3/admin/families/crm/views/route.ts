import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmSavedViewSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

const viewPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120).optional(),
  isDefault: z.boolean().optional(),
  filtersJson: z.record(z.string(), z.any()).optional(),
  columnsJson: z.record(z.string(), z.any()).nullable().optional(),
});

const viewDeleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_READ);
  if (error || !user) return error;

  const views = await prisma.familyCrmSavedView.findMany({
    where: { adminUserId: user.id },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ views });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmSavedViewSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM saved view payload' } }, { status: 400 });
  }

  const columnsJson =
    parsed.data.columnsJson === undefined
      ? undefined
      : parsed.data.columnsJson === null
        ? Prisma.JsonNull
        : parsed.data.columnsJson;

  const view = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.familyCrmSavedView.updateMany({
        where: { adminUserId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.familyCrmSavedView.create({
      data: {
        adminUserId: user.id,
        name: parsed.data.name,
        isDefault: parsed.data.isDefault,
        filtersJson: parsed.data.filtersJson,
        columnsJson,
      },
    });
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_VIEW_CREATED',
    targetType: 'FamilyCrmSavedView',
    targetId: view.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ view }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = viewPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM saved view update payload' } }, { status: 400 });
  }

  const existing = await prisma.familyCrmSavedView.findFirst({
    where: { id: parsed.data.id, adminUserId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Saved view not found' } }, { status: 404 });
  }

  const columnsJson =
    parsed.data.columnsJson === undefined
      ? undefined
      : parsed.data.columnsJson === null
        ? Prisma.JsonNull
        : parsed.data.columnsJson;

  const view = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.familyCrmSavedView.updateMany({
        where: { adminUserId: user.id, isDefault: true, id: { not: existing.id } },
        data: { isDefault: false },
      });
    }

    return tx.familyCrmSavedView.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name,
        isDefault: parsed.data.isDefault,
        filtersJson: parsed.data.filtersJson,
        columnsJson,
      },
    });
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_VIEW_UPDATED',
    targetType: 'FamilyCrmSavedView',
    targetId: view.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ view });
}

export async function DELETE(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = viewDeleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM saved view delete payload' } }, { status: 400 });
  }

  const existing = await prisma.familyCrmSavedView.findFirst({
    where: { id: parsed.data.id, adminUserId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Saved view not found' } }, { status: 404 });
  }

  await prisma.familyCrmSavedView.delete({
    where: { id: existing.id },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_VIEW_DELETED',
    targetType: 'FamilyCrmSavedView',
    targetId: existing.id,
    metadata: { name: existing.name },
  });

  return NextResponse.json({ ok: true });
}
