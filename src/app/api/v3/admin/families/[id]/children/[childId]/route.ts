import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

const childUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  preferredName: z.string().max(120).nullable().optional(),
  gender: z.string().max(80).nullable().optional(),
  pronouns: z.string().max(80).nullable().optional(),
  dateOfBirth: z.string().optional(),
  gradeLevel: z.string().max(80).nullable().optional(),
  schoolName: z.string().max(160).nullable().optional(),
  favoriteActivities: z.string().max(500).nullable().optional(),
  favoriteFoods: z.string().max(500).nullable().optional(),
  favoriteToys: z.string().max(500).nullable().optional(),
  comfortItems: z.string().max(500).nullable().optional(),
  temperamentNotes: z.string().max(1000).nullable().optional(),
  learningStyle: z.string().max(500).nullable().optional(),
  napSchedule: z.string().max(500).nullable().optional(),
  languagePreferences: z.string().max(500).nullable().optional(),
  pottyTrainingStatus: z.string().max(160).nullable().optional(),
  allergies: z.string().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  photoStorageKey: z.string().nullable().optional(),
  photoMimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).nullable().optional(),
  photoSizeBytes: z.number().int().positive().max(5 * 1024 * 1024).nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; childId: string }> }
) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.FAMILIES_WRITE);
  if (error || !user) return error;
  const { id, childId } = await params;

  const raw = await parseJson<unknown>(request);
  const parsed = childUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid child payload' } }, { status: 400 });
  }

  const existing = await prisma.child.findFirst({ where: { id: childId, parentId: id } });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Child not found for this family' } }, { status: 404 });
  }

  const updated = await prisma.child.update({
    where: { id: childId },
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
      photoUploadedAt:
        parsed.data.photoStorageKey !== undefined
          ? parsed.data.photoStorageKey
            ? new Date()
            : null
          : undefined,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'CHILD_UPDATED_BY_ADMIN',
    targetType: 'Child',
    targetId: updated.id,
    metadata: parsed.data,
  });
  await syncFamilyCrmProfile(prisma, id);

  return NextResponse.json({ child: updated });
}
