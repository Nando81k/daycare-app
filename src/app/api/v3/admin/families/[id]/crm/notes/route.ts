import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCrmProfileForParent, ensureParentFamily } from '@/lib/crm/helpers';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmNoteCreateSchema } from '@/lib/validation';
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
  const notes = await prisma.familyCrmNote.findMany({
    where: { profileId: profile.id },
    include: {
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ notes });
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
  const parsed = familyCrmNoteCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM note payload' } }, { status: 400 });
  }

  const profile = await ensureCrmProfileForParent(prisma, id);
  const note = await prisma.familyCrmNote.create({
    data: {
      profileId: profile.id,
      createdByAdminId: user.id,
      body: parsed.data.body,
      isPinned: parsed.data.isPinned,
    },
    include: {
      createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_NOTE_CREATED',
    targetType: 'FamilyCrmNote',
    targetId: note.id,
    metadata: { parentId: id, isPinned: note.isPinned },
  });

  return NextResponse.json({ note }, { status: 201 });
}
