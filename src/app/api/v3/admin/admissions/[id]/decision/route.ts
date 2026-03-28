import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CommunicationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

const decisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  startDate: z.string().nullable().optional(),
});

function buildInvoiceNumber(now: Date) {
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `INV-${yyyymmdd}-${random}`;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin();
  if (error || !user) return error;

  const { id } = await params;
  const raw = await parseJson<unknown>(request);
  const parsed = decisionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid decision payload' } }, { status: 400 });
  }

  const enrollment = await prisma.enrollmentApplication.findUnique({
    where: { id },
    include: {
      child: true,
      parent: true,
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: { message: 'Enrollment not found' } }, { status: 404 });
  }

  const now = new Date();

  if (parsed.data.decision === 'APPROVE') {
    if (!parsed.data.startDate) {
      return NextResponse.json({ error: { message: 'Start date is required for approval' } }, { status: 400 });
    }

    const startDate = new Date(parsed.data.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: { message: 'Invalid start date' } }, { status: 400 });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        const plan =
          (await tx.tuitionPlan.findFirst({
            where: {
              isActive: true,
              OR: [{ programType: enrollment.programType }, { programType: null }],
            },
            orderBy: [{ programType: 'desc' }, { createdAt: 'asc' }],
          })) || null;

        if (!plan) {
          throw new Error('NO_TUITION_PLAN');
        }

        const nextEnrollment = await tx.enrollmentApplication.update({
          where: { id: enrollment.id },
          data: {
            status: 'APPROVED',
            startDate,
            reviewedById: user.id,
            reviewedAt: now,
            approvedAt: now,
            decisionReason: null,
            reviewNotes: 'Approved via simplified admissions workflow.',
            selectedCadence: null,
            spotHoldExpiresAt: null,
            spotSecuredAt: null,
            requiredIntakeComplete: true,
            intakeMissingFields: [],
          },
        });

        const monthlyAmountCents = plan.monthlyAmountCents;
        const existingContract = await tx.childTuitionContract.findFirst({
          where: {
            parentId: enrollment.parentId,
            childId: enrollment.childId,
            status: { in: ['ACTIVE', 'PAUSED'] },
          },
          orderBy: { createdAt: 'desc' },
        });

        const contract = existingContract
          ? await tx.childTuitionContract.update({
              where: { id: existingContract.id },
              data: {
                tuitionPlanId: plan.id,
                billingCadence: 'MONTHLY',
                recurringAmountCents: monthlyAmountCents,
                startDate,
                invoiceDay: startDate.getDate(),
                status: 'ACTIVE',
                autoPayEnabled: false,
                nextChargeDate: null,
              },
            })
          : await tx.childTuitionContract.create({
              data: {
                parentId: enrollment.parentId,
                childId: enrollment.childId,
                tuitionPlanId: plan.id,
                billingCadence: 'MONTHLY',
                recurringAmountCents: monthlyAmountCents,
                startDate,
                invoiceDay: startDate.getDate(),
                status: 'ACTIVE',
                autoPayEnabled: false,
              },
            });

        const invoice = await tx.invoice.create({
          data: {
            contractId: contract.id,
            parentId: enrollment.parentId,
            childId: enrollment.childId,
            invoiceNumber: buildInvoiceNumber(now),
            status: 'OPEN',
            issueDate: now,
            dueDate: startDate,
            totalCents: monthlyAmountCents,
            amountDueCents: monthlyAmountCents,
            lineItems: {
              create: [
                {
                  description: `${plan.name} monthly tuition`,
                  quantity: 1,
                  unitAmountCents: monthlyAmountCents,
                  totalAmountCents: monthlyAmountCents,
                },
              ],
            },
          },
          select: {
            id: true,
            invoiceNumber: true,
            dueDate: true,
            amountDueCents: true,
            status: true,
          },
        });

        await tx.communicationEvent.create({
          data: {
            parentId: enrollment.parentId,
            childId: enrollment.childId,
            enrollmentId: enrollment.id,
            invoiceId: invoice.id,
            type: CommunicationType.ENROLLMENT,
            channel: 'IN_APP',
            status: 'SENT',
            subject: 'Application approved',
            message: `Application approved for ${enrollment.child.firstName}. Tuition invoice ${invoice.invoiceNumber} is now open.`,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: user.id,
            action: 'ENROLLMENT_APPROVED_SIMPLE',
            targetType: 'EnrollmentApplication',
            targetId: enrollment.id,
            metadata: {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              planId: plan.id,
              amountDueCents: invoice.amountDueCents,
            },
          },
        });

        return { enrollment: nextEnrollment, invoice };
      });

      return NextResponse.json(result);
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'NO_TUITION_PLAN') {
        return NextResponse.json(
          { error: { message: 'No active tuition plan is configured for this program' } },
          { status: 409 },
        );
      }
      console.error('ADMIN_ADMISSION_APPROVAL_FAILED', cause);
      return NextResponse.json({ error: { message: 'Unable to approve application' } }, { status: 500 });
    }
  }

  const rejected = await prisma.$transaction(async (tx) => {
    const nextEnrollment = await tx.enrollmentApplication.update({
      where: { id: enrollment.id },
      data: {
        status: 'DENIED',
        reviewedById: user.id,
        reviewedAt: now,
        approvedAt: null,
        decisionReason: 'Rejected by admissions',
        reviewNotes: 'Rejected via simplified admissions workflow.',
        selectedCadence: null,
        spotHoldExpiresAt: null,
        spotSecuredAt: null,
      },
    });

    await tx.communicationEvent.create({
      data: {
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        enrollmentId: enrollment.id,
        type: CommunicationType.ENROLLMENT,
        channel: 'IN_APP',
        status: 'SENT',
        subject: 'Application decision',
        message: `Application for ${enrollment.child.firstName} was marked as rejected.`,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: 'ENROLLMENT_REJECTED_SIMPLE',
        targetType: 'EnrollmentApplication',
        targetId: enrollment.id,
      },
    });

    return nextEnrollment;
  });

  return NextResponse.json({ enrollment: rejected });
}
