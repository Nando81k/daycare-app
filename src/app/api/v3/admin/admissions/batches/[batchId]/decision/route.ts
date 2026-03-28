import { NextResponse } from 'next/server';
import { EnrollmentStatus } from '@prisma/client';
import { AdmissionsDecisionError, applyEnrollmentDecision } from '@/lib/admissions/decisions';
import { writeAudit } from '@/lib/events';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';
import { getUiRevampFlags } from '@/lib/ui-revamp';
import { admissionsBatchDecisionSchema } from '@/lib/validation';

const UNRESOLVED_STATUSES: EnrollmentStatus[] = ['PENDING', 'REQUEST_INFO', 'WAITLISTED'];

function buildMissingFields(input: {
  requiredIntakeComplete: boolean;
  intakeMissingFields: string[];
  startDate: Date | null;
  overrideStartDate: Date | null;
  hasGuardianIdentity: boolean;
}) {
  const missing = new Set<string>(input.intakeMissingFields ?? []);
  if (!input.requiredIntakeComplete && missing.size === 0) {
    missing.add('intake');
  }
  if (!input.startDate && !input.overrideStartDate) {
    missing.add('startDate');
  }
  if (!input.hasGuardianIdentity) {
    missing.add('guardianSsnLast4');
  }
  return Array.from(missing);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const uiRevamp = getUiRevampFlags();
  const { error, user } = await requireApiAdmin(PERMISSIONS.ADMISSIONS_WRITE);
  if (error || !user) return error;

  const { batchId } = await params;
  if (!batchId) {
    return NextResponse.json({ error: { message: 'Batch id is required' } }, { status: 400 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = admissionsBatchDecisionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid request payload' } }, { status: 400 });
  }

  const overrideStartDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  if (overrideStartDate && Number.isNaN(overrideStartDate.getTime())) {
    return NextResponse.json({ error: { message: 'Invalid start date override' } }, { status: 400 });
  }

  const enrollments = await prisma.enrollmentApplication.findMany({
    where: { intakeBatchId: batchId },
    include: {
      child: { select: { firstName: true, lastName: true } },
      parent: { select: { guardianSsnLast4Masked: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!enrollments.length) {
    return NextResponse.json({ error: { message: 'Enrollment batch not found' } }, { status: 404 });
  }

  const targetRows = enrollments.filter((enrollment) =>
    UNRESOLVED_STATUSES.includes(enrollment.status),
  );

  if (!targetRows.length) {
    return NextResponse.json({
      updatedCount: 0,
      approvedCount: 0,
      requestInfoCount: 0,
      deniedCount: 0,
      exceptionIds: [],
      messages: ['No unresolved enrollments found in this batch.'],
      updatedEnrollments: [],
    });
  }

  let approvedCount = 0;
  let requestInfoCount = 0;
  let deniedCount = 0;
  const exceptionIds: string[] = [];
  const messages: string[] = [];
  const updatedEnrollments: Array<{
    id: string;
    status: EnrollmentStatus;
    programType: string;
    startDate: string | null;
    notes: string | null;
    reviewNotes: string | null;
    decisionReason: string | null;
    spotHoldExpiresAt: string | null;
    spotSecuredAt: string | null;
    selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
  }> = [];

  for (const enrollment of targetRows) {
    try {
      let statusToApply: EnrollmentStatus;
      let reason = parsed.data.reason ?? null;
      let reviewNotes =
        parsed.data.reviewNotes ||
        (parsed.data.action === 'APPROVE_BATCH'
          ? 'Approved in batch review.'
          : parsed.data.action === 'REQUEST_INFO_BATCH'
            ? 'Requested additional details in batch review.'
            : 'Denied in batch review.');
      let startDateToApply: string | Date | null | undefined = overrideStartDate ?? enrollment.startDate;

      if (parsed.data.action === 'APPROVE_BATCH') {
        const missing = buildMissingFields({
          requiredIntakeComplete: enrollment.requiredIntakeComplete,
          intakeMissingFields: enrollment.intakeMissingFields,
          startDate: enrollment.startDate,
          overrideStartDate,
          hasGuardianIdentity: Boolean(enrollment.parent.guardianSsnLast4Masked),
        });

        if (missing.length) {
          statusToApply = 'REQUEST_INFO';
          reason = `Missing required fields: ${missing.join(', ')}`;
          reviewNotes = parsed.data.reviewNotes || 'Requested required intake data before approval.';
          startDateToApply = enrollment.startDate;
        } else {
          statusToApply = 'APPROVED';
        }
      } else if (parsed.data.action === 'REQUEST_INFO_BATCH') {
        statusToApply = 'REQUEST_INFO';
      } else {
        statusToApply = 'DENIED';
      }

      const updated = await applyEnrollmentDecision({
        prismaClient: prisma,
        enrollmentId: enrollment.id,
        actorId: user.id,
        status: statusToApply,
        reviewNotes,
        decisionReason: reason,
        startDate: startDateToApply,
        clientMetrics: parsed.data.clientMetrics,
        origin: new URL(request.url).origin,
        auditAction: 'ENROLLMENT_BATCH_DECISION_UPDATED',
      });

      if (updated.status === 'APPROVED') approvedCount += 1;
      if (updated.status === 'REQUEST_INFO') requestInfoCount += 1;
      if (updated.status === 'DENIED') deniedCount += 1;

      updatedEnrollments.push({
        id: updated.id,
        status: updated.status,
        programType: updated.programType,
        startDate: updated.startDate ? updated.startDate.toISOString() : null,
        notes: updated.notes,
        reviewNotes: updated.reviewNotes,
        decisionReason: updated.decisionReason,
        spotHoldExpiresAt: updated.spotHoldExpiresAt ? updated.spotHoldExpiresAt.toISOString() : null,
        spotSecuredAt: updated.spotSecuredAt ? updated.spotSecuredAt.toISOString() : null,
        selectedCadence: updated.selectedCadence,
      });
    } catch (error) {
      exceptionIds.push(enrollment.id);
      if (error instanceof AdmissionsDecisionError) {
        messages.push(
          `${enrollment.child.firstName} ${enrollment.child.lastName}: ${error.message}`,
        );
      } else {
        messages.push(
          `${enrollment.child.firstName} ${enrollment.child.lastName}: Unable to apply decision.`,
        );
      }
    }
  }

  await writeAudit({
    actorId: user.id,
    action: 'ENROLLMENT_BATCH_DECISION_RUN',
    targetType: 'EnrollmentBatch',
    targetId: batchId,
    metadata: {
      action: parsed.data.action,
      reason: parsed.data.reason ?? null,
      reviewNotes: parsed.data.reviewNotes ?? null,
      overrideStartDate: overrideStartDate?.toISOString() ?? null,
      updatedCount: updatedEnrollments.length,
      approvedCount,
      requestInfoCount,
      deniedCount,
      exceptionIds,
      clientMetrics: parsed.data.clientMetrics ?? null,
      uiRevampPhase: uiRevamp.phase,
    },
  });

  return NextResponse.json({
    updatedCount: updatedEnrollments.length,
    approvedCount,
    requestInfoCount,
    deniedCount,
    exceptionIds,
    messages:
      messages.length > 0
        ? messages
        : [
            parsed.data.action === 'APPROVE_BATCH'
              ? `Approved ${approvedCount} child(ren) and flagged ${requestInfoCount} for additional info.`
              : `Updated ${updatedEnrollments.length} child enrollment decision(s).`,
          ],
    updatedEnrollments,
  });
}
