import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmTagSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

const tagPatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  isSystem: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

const tagDeleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  const { error } = await requireApiAdmin(PERMISSIONS.CRM_READ);
  if (error) return error;

  const tags = await prisma.familyCrmTag.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json({ tags });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmTagSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM tag payload' } }, { status: 400 });
  }

  const tag = await prisma.familyCrmTag.create({
    data: parsed.data,
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TAG_CREATED',
    targetType: 'FamilyCrmTag',
    targetId: tag.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ tag }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = tagPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM tag update payload' } }, { status: 400 });
  }

  const tag = await prisma.familyCrmTag.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      isSystem: parsed.data.isSystem,
      sortOrder: parsed.data.sortOrder,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TAG_UPDATED',
    targetType: 'FamilyCrmTag',
    targetId: tag.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ tag });
}

export async function DELETE(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = tagDeleteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM tag delete payload' } }, { status: 400 });
  }

  const existing = await prisma.familyCrmTag.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Tag not found' } }, { status: 404 });
  }
  if (existing.isSystem) {
    return NextResponse.json({ error: { message: 'System tags cannot be deleted' } }, { status: 400 });
  }

  await prisma.familyCrmTag.delete({
    where: { id: existing.id },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_TAG_DELETED',
    targetType: 'FamilyCrmTag',
    targetId: existing.id,
    metadata: { name: existing.name },
  });

  return NextResponse.json({ ok: true });
}
