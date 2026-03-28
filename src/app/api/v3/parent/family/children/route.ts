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

export async function GET() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const children = await prisma.child.findMany({
    where: { parentId: user.id },
    select: childResponseSelect,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ children });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = childSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid child payload' } }, { status: 400 });
  }

  if (
    parsed.data.photoStorageKey &&
    !isChildPhotoStorageKeyForParent(user.id, parsed.data.photoStorageKey)
  ) {
    return NextResponse.json(
      { error: { message: 'Invalid photo key for this parent account' } },
      { status: 400 }
    );
  }

  const { childSsnLast4, ...rest } = parsed.data;
  const normalizedChildSsnLast4 = childSsnLast4?.trim();

  const child = await prisma.child.create({
    data: {
      parentId: user.id,
      ...rest,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      childSsnLast4Encrypted: normalizedChildSsnLast4 ? encryptField(normalizedChildSsnLast4) : null,
      childSsnLast4Masked: normalizedChildSsnLast4 ? maskSsnLast4(normalizedChildSsnLast4) : null,
      childIdentityUpdatedAt: normalizedChildSsnLast4 ? new Date() : null,
      photoUploadedAt: parsed.data.photoStorageKey ? new Date() : null,
    },
    select: childResponseSelect,
  });

  await writeAudit({
    actorId: user.id,
    action: 'CHILD_CREATED_BY_PARENT',
    targetType: 'Child',
    targetId: child.id,
  });

  return NextResponse.json({ child }, { status: 201 });
}
