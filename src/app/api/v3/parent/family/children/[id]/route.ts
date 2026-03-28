import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { isChildPhotoStorageKeyForParent } from '@/lib/storage/s3';
import { encryptField, maskSsnLast4 } from '@/lib/security/field-encryption';
import { childSchema } from '@/lib/validation';
import { parseJson, requireApiParent } from '@/lib/route-helpers';

const childResponseSelect = {
  id: true,
  parentId: true,
  firstName: true,
  lastName: true,
  preferredName: true,
  gender: true,
  pronouns: true,
  dateOfBirth: true,
  gradeLevel: true,
  schoolName: true,
  favoriteActivities: true,
  favoriteFoods: true,
  favoriteToys: true,
  comfortItems: true,
  temperamentNotes: true,
  learningStyle: true,
  napSchedule: true,
  languagePreferences: true,
  pottyTrainingStatus: true,
  childSsnLast4Masked: true,
  childIdentityUpdatedAt: true,
  allergies: true,
  medicalNotes: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  photoStorageKey: true,
  photoMimeType: true,
  photoSizeBytes: true,
  photoUploadedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  const { id } = await params;

  const child = await prisma.child.findFirst({
    where: {
      id,
      parentId: user.id,
    },
    select: childResponseSelect,
  });

  if (!child) {
    return NextResponse.json({ error: { message: 'Child not found' } }, { status: 404 });
  }

  return NextResponse.json({ child });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  const { id } = await params;

  const raw = await parseJson<unknown>(request);
  const parsed = childSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid child payload' } }, { status: 400 });
  }

  if (
    parsed.data.photoStorageKey !== undefined &&
    parsed.data.photoStorageKey !== null &&
    !isChildPhotoStorageKeyForParent(user.id, parsed.data.photoStorageKey)
  ) {
    return NextResponse.json(
      { error: { message: 'Invalid photo key for this parent account' } },
      { status: 400 }
    );
  }

  const existing = await prisma.child.findFirst({ where: { id, parentId: user.id } });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Child not found' } }, { status: 404 });
  }

  const { childSsnLast4, ...rest } = parsed.data;
  const normalizedChildSsnLast4 =
    childSsnLast4 === undefined ? undefined : childSsnLast4?.trim() ?? null;

  const child = await prisma.child.update({
    where: { id },
    data: {
      ...rest,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
      childSsnLast4Encrypted:
        normalizedChildSsnLast4 === undefined
          ? undefined
          : normalizedChildSsnLast4
            ? encryptField(normalizedChildSsnLast4)
            : null,
      childSsnLast4Masked:
        normalizedChildSsnLast4 === undefined
          ? undefined
          : normalizedChildSsnLast4
            ? maskSsnLast4(normalizedChildSsnLast4)
            : null,
      childIdentityUpdatedAt:
        normalizedChildSsnLast4 === undefined
          ? undefined
          : normalizedChildSsnLast4
            ? new Date()
            : null,
      photoUploadedAt:
        parsed.data.photoStorageKey !== undefined
          ? parsed.data.photoStorageKey
            ? new Date()
            : null
          : undefined,
    },
    select: childResponseSelect,
  });

  await writeAudit({
    actorId: user.id,
    action: 'CHILD_UPDATED_BY_PARENT',
    targetType: 'Child',
    targetId: child.id,
  });

  return NextResponse.json({ child });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  const { id } = await params;

  const existing = await prisma.child.findFirst({
    where: { id, parentId: user.id },
    include: { enrollments: true },
  });

  if (!existing) {
    return NextResponse.json({ error: { message: 'Child not found' } }, { status: 404 });
  }

  if (existing.enrollments.length > 0) {
    return NextResponse.json({ error: { message: 'Cannot delete child with enrollment records' } }, { status: 409 });
  }

  await prisma.child.delete({ where: { id } });

  await writeAudit({
    actorId: user.id,
    action: 'CHILD_DELETED_BY_PARENT',
    targetType: 'Child',
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
