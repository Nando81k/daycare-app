import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureParentFamily } from '@/lib/crm/helpers';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmNotePatchSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

async function resolveNote(parentId: string, noteId: string) {
  return prisma.familyCrmNote.findFirst({
    where: {
      id: noteId,
      profile: { parentId },
    },
    include: {
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
      profile: { select: { id: true } },
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id, noteId } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const existing = await resolveNote(id, noteId);
  if (!existing) {
    return NextResponse.json({ error: { message: 'Note not found for this family' } }, { status: 404 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmNotePatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM note payload' } }, { status: 400 });
  }

  const updated = await prisma.familyCrmNote.update({
    where: { id: existing.id },
    data: {
      body: parsed.data.body,
      isPinned: parsed.data.isPinned,
    },
    include: {
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_NOTE_UPDATED',
    targetType: 'FamilyCrmNote',
    targetId: existing.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ note: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id, noteId } = await params;

  const parent = await ensureParentFamily(prisma, id);
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const existing = await resolveNote(id, noteId);
  if (!existing) {
    return NextResponse.json({ error: { message: 'Note not found for this family' } }, { status: 404 });
  }

  await prisma.familyCrmNote.delete({
    where: { id: existing.id },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_NOTE_DELETED',
    targetType: 'FamilyCrmNote',
    targetId: existing.id,
    metadata: { parentId: id },
  });

  return NextResponse.json({ ok: true });
}
