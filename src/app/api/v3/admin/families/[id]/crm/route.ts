import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { familyCrmProfilePatchSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin(PERMISSIONS.CRM_READ);
  if (error) return error;
  const { id } = await params;

  const parent = await prisma.user.findFirst({
    where: { id, role: 'PARENT' },
    select: { id: true },
  });
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  await syncFamilyCrmProfile(prisma, id);

  const profile = await prisma.familyCrmProfile.findUnique({
    where: { parentId: id },
    include: {
      ownerAdmin: {
        select: { id: true, firstName: true, lastName: true, adminRole: true },
      },
      tasks: {
        orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          ownerAdmin: { select: { id: true, firstName: true, lastName: true } },
          createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      notes: {
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdByAdmin: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      tags: {
        include: {
          tag: true,
          assignedByAdmin: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const parent = await prisma.user.findFirst({
    where: { id, role: 'PARENT' },
    select: { id: true },
  });
  if (!parent) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = familyCrmProfilePatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid CRM profile payload' } }, { status: 400 });
  }
  const payload = parsed.data;

  if (payload.ownerAdminId) {
    const owner = await prisma.user.findFirst({
      where: {
        id: payload.ownerAdminId,
        role: 'ADMIN',
        isActive: true,
      },
      select: { id: true },
    });
    if (!owner) {
      return NextResponse.json({ error: { message: 'Assigned owner not found' } }, { status: 404 });
    }
  }

  if (payload.tagIds?.length) {
    const validTagCount = await prisma.familyCrmTag.count({
      where: { id: { in: payload.tagIds } },
    });
    if (validTagCount !== payload.tagIds.length) {
      return NextResponse.json({ error: { message: 'One or more CRM tags are invalid' } }, { status: 404 });
    }
  }

  const profile = await prisma.familyCrmProfile.upsert({
    where: { parentId: id },
    update: {},
    create: { parentId: id },
  });

  const shouldClearManualOverride = Boolean(payload.clearManualOverride);
  const nextManualOverride = shouldClearManualOverride
    ? false
    : payload.isStageManuallyOverridden ?? (payload.stage ? true : undefined);

  const updated = await prisma.$transaction(async (tx) => {
    const nextProfile = await tx.familyCrmProfile.update({
      where: { id: profile.id },
      data: {
        stage: payload.stage,
        ownerAdminId: payload.ownerAdminId,
        isStageManuallyOverridden: nextManualOverride,
        nextFollowUpAt:
          payload.nextFollowUpAt === undefined
            ? undefined
            : payload.nextFollowUpAt
              ? new Date(payload.nextFollowUpAt)
              : null,
        lastContactedAt:
          payload.lastContactedAt === undefined
            ? undefined
            : payload.lastContactedAt
              ? new Date(payload.lastContactedAt)
              : null,
      },
    });

    if (payload.tagIds) {
      await tx.familyCrmProfileTag.deleteMany({
        where: { profileId: profile.id },
      });
      if (payload.tagIds.length) {
        await tx.familyCrmProfileTag.createMany({
          data: payload.tagIds.map((tagId) => ({
            profileId: profile.id,
            tagId,
            assignedByAdminId: user.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return nextProfile;
  });

  const synced =
    shouldClearManualOverride || payload.isStageManuallyOverridden === false
      ? await syncFamilyCrmProfile(prisma, id)
      : updated;

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_CRM_PROFILE_UPDATED',
    targetType: 'FamilyCrmProfile',
    targetId: profile.id,
    metadata: payload,
  });

  return NextResponse.json({ profile: synced });
}
