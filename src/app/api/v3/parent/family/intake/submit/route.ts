import { NextResponse } from 'next/server';
import { CommunicationType } from '@prisma/client';
import { isSameOriginMutationRequest, parseJson, requireApiParent } from '@/lib/route-helpers';
import { simpleFamilyIntakeSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';

type EnrollmentResponse = {
  id: string;
  status: string;
  programType: string;
  startDate: string | null;
  createdAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
};

export async function POST(request: Request) {
  const { error, user } = await requireApiParent();
  if (error || !user) return error;

  if (!isSameOriginMutationRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden origin' } }, { status: 403 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = simpleFamilyIntakeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid enrollment payload' } }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollments: EnrollmentResponse[] = [];

      for (const entry of parsed.data.children) {
        const dateOfBirth = new Date(entry.dateOfBirth);
        const startDate = new Date(entry.startDate);
        if (Number.isNaN(dateOfBirth.getTime()) || Number.isNaN(startDate.getTime())) {
          throw new Error('INVALID_DATE');
        }

        const child = await tx.child.create({
          data: {
            parentId: user.id,
            firstName: entry.firstName.trim(),
            lastName: entry.lastName.trim(),
            dateOfBirth,
            emergencyContactName: entry.emergencyContactName.trim(),
            emergencyContactPhone: entry.emergencyContactPhone.trim(),
            allergies: entry.allergies?.trim() || null,
            medicalNotes: entry.medicalNotes?.trim() || null,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        const enrollment = await tx.enrollmentApplication.create({
          data: {
            parentId: user.id,
            childId: child.id,
            status: 'PENDING',
            programType: entry.programType,
            startDate,
            requiredIntakeComplete: true,
            intakeMissingFields: [],
          },
          select: {
            id: true,
            status: true,
            programType: true,
            startDate: true,
            createdAt: true,
          },
        });

        await tx.communicationEvent.create({
          data: {
            parentId: user.id,
            childId: child.id,
            enrollmentId: enrollment.id,
            type: CommunicationType.ENROLLMENT,
            channel: 'IN_APP',
            status: 'SENT',
            subject: 'Enrollment submitted',
            message: `Enrollment request for ${child.firstName} ${child.lastName} was submitted.`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: 'PARENT_ENROLLMENT_BATCH_SUBMITTED',
            targetType: 'EnrollmentApplication',
            targetId: enrollment.id,
            metadata: {
              childId: child.id,
              programType: enrollment.programType,
            },
          },
        });

        enrollments.push({
          id: enrollment.id,
          status: enrollment.status,
          programType: enrollment.programType,
          startDate: enrollment.startDate ? enrollment.startDate.toISOString() : null,
          createdAt: enrollment.createdAt.toISOString(),
          child: {
            firstName: child.firstName,
            lastName: child.lastName,
          },
        });
      }

      return enrollments;
    });

    return NextResponse.json({
      enrollments: result,
      summary: {
        childrenProcessed: result.length,
        enrollmentsSubmitted: result.length,
      },
    });
  } catch (cause) {
    if (cause instanceof Error && cause.message === 'INVALID_DATE') {
      return NextResponse.json({ error: { message: 'Invalid date value provided' } }, { status: 400 });
    }
    console.error('PARENT_INTAKE_SUBMIT_FAILED', cause);
    return NextResponse.json({ error: { message: 'Unable to submit enrollment batch' } }, { status: 500 });
  }
}
