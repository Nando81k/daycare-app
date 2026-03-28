import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit, writeCommunication } from '@/lib/events';
import { enrollmentCreateSchema } from '@/lib/validation';
import { parseJson, requireApiParent } from '@/lib/route-helpers';
import { normalizeLegacyEnrollmentStatuses } from '@/lib/enrollment-normalization';

export async function GET() {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;
  await normalizeLegacyEnrollmentStatuses(prisma);

  const enrollments = await prisma.enrollmentApplication.findMany({
    where: { parentId: user.id },
    include: {
      child: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    enrollments: enrollments.map((row) => ({
      ...row,
      status: row.status === 'DENIED' ? 'DENIED' : row.status,
    })),
  });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = enrollmentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid enrollment payload' } }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: parsed.data.childId, parentId: user.id } });
  if (!child) {
    return NextResponse.json({ error: { message: 'Child not found for this account' } }, { status: 404 });
  }

  const enrollment = await prisma.enrollmentApplication.create({
    data: {
      parentId: user.id,
      childId: child.id,
      programType: parsed.data.programType,
      startDate: new Date(parsed.data.startDate),
      notes: parsed.data.notes,
      status: 'PENDING',
      requiredIntakeComplete: false,
      intakeMissingFields: ['guardianSsnLast4'],
    },
    include: { child: true },
  });

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'ENROLLMENT_CREATED_BY_PARENT',
      targetType: 'EnrollmentApplication',
      targetId: enrollment.id,
      metadata: {
        childId: enrollment.childId,
        programType: enrollment.programType,
      },
    }),
    writeCommunication({
      parentId: user.id,
      childId: enrollment.childId,
      enrollmentId: enrollment.id,
      type: 'ENROLLMENT',
      channel: 'IN_APP',
      subject: 'Enrollment submitted',
      message: `Enrollment request for ${enrollment.child.firstName} was submitted to admissions.`,
    }),
  ]);

  return NextResponse.json({ enrollment }, { status: 201 });
}
