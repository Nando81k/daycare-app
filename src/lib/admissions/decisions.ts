import { type EnrollmentApplication, EnrollmentStatus, type PrismaClient } from '@prisma/client';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit, writeCommunication } from '@/lib/events';
import { sendEnrollmentDecisionNotifications } from '@/lib/communications/enrollment-decision';
import { getUiRevampFlags } from '@/lib/ui-revamp';

export class AdmissionsDecisionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function normalizeInputStartDate(
  rawStartDate: string | Date | null | undefined,
  fallbackStartDate: Date | null,
) {
  if (rawStartDate === undefined) return fallbackStartDate;
  if (!rawStartDate) return null;
  const parsed = rawStartDate instanceof Date ? rawStartDate : new Date(rawStartDate);
  if (Number.isNaN(parsed.getTime())) {
    throw new AdmissionsDecisionError('Invalid start date', 400);
  }
  return parsed;
}

async function writeDecisionCommunications(input: {
  status: EnrollmentStatus;
  origin: string;
  enrollment: EnrollmentApplication & {
    child: { firstName: string; lastName: string };
    parent: { firstName: string; email: string; phone: string | null };
  };
}) {
  const { status, origin, enrollment } = input;
  const dashboardUrl = `${origin}/dashboard/family`;

  const delivery = await sendEnrollmentDecisionNotifications({
    status,
    parentFirstName: enrollment.parent.firstName,
    parentEmail: enrollment.parent.email,
    parentPhone: enrollment.parent.phone,
    childFirstName: enrollment.child.firstName,
    childLastName: enrollment.child.lastName,
    startDate: enrollment.startDate,
    holdExpiresAt: enrollment.spotHoldExpiresAt,
    dashboardUrl,
  });

  const inAppMessage =
    status === 'APPROVED'
      ? `${enrollment.child.firstName} ${enrollment.child.lastName} is now ${status}. Secure the seat from Family Hub before the hold expires.`
      : `${enrollment.child.firstName} ${enrollment.child.lastName} is now ${status}.`;

  const communicationWrites: Array<Promise<unknown>> = [
    writeCommunication({
      parentId: enrollment.parentId,
      childId: enrollment.childId,
      enrollmentId: enrollment.id,
      type: 'ENROLLMENT',
      channel: 'IN_APP',
      subject: 'Enrollment decision update',
      message: inAppMessage,
    }),
  ];

  if (delivery.email.attempted) {
    communicationWrites.push(
      writeCommunication({
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        enrollmentId: enrollment.id,
        type: 'ENROLLMENT',
        channel: 'EMAIL',
        status: delivery.email.sent ? 'SENT' : 'FAILED',
        subject: delivery.subject,
        message: delivery.email.sent
          ? delivery.emailMessage
          : `Email delivery failed: ${delivery.email.error ?? 'Unknown error'}`,
      }),
    );
  }

  if (delivery.sms.attempted) {
    communicationWrites.push(
      writeCommunication({
        parentId: enrollment.parentId,
        childId: enrollment.childId,
        enrollmentId: enrollment.id,
        type: 'ENROLLMENT',
        channel: 'SYSTEM',
        status: delivery.sms.sent ? 'SENT' : 'FAILED',
        subject: 'Enrollment decision SMS',
        message: delivery.sms.sent
          ? delivery.smsMessage
          : `SMS delivery failed: ${delivery.sms.error ?? 'Unknown error'}`,
      }),
    );
  }

  const communicationResults = await Promise.allSettled(communicationWrites);
  const failedCommunicationWrites = communicationResults.filter((result) => result.status === 'rejected').length;

  return { delivery, failedCommunicationWrites };
}

export async function applyEnrollmentDecision(input: {
  prismaClient: PrismaClient;
  enrollmentId: string;
  actorId: string;
  status: EnrollmentStatus;
  reviewNotes: string;
  decisionReason?: string | null;
  startDate?: string | Date | null;
  origin: string;
  auditAction?: string;
  clientMetrics?: {
    flow?:
      | 'PARENT_INTAKE'
      | 'ADMIN_DECISION'
      | 'ADMIN_BATCH_DECISION'
      | 'CRM_BULK_ACTION'
      | 'CRM_TASK_CREATE'
      | 'CRM_TASK_UPDATE'
      | 'CRM_COMMUNICATION';
    elapsedMs?: number;
    startedAt?: string;
    completedAt?: string;
    phase?: 'foundation' | 'parent' | 'admin';
  };
}) {
  const { prismaClient, enrollmentId, actorId, status, reviewNotes, decisionReason, startDate, origin } = input;

  const uiRevamp = getUiRevampFlags();

  const existing = await prismaClient.enrollmentApplication.findUnique({
    where: { id: enrollmentId },
    include: {
      child: true,
      parent: true,
    },
  });

  if (!existing) {
    throw new AdmissionsDecisionError('Enrollment not found', 404);
  }

  const now = new Date();
  const normalizedStartDate = normalizeInputStartDate(startDate, existing.startDate);
  if (status === 'APPROVED') {
    if (!normalizedStartDate) {
      throw new AdmissionsDecisionError('Start date is required to approve enrollment', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedDay = new Date(normalizedStartDate);
    normalizedDay.setHours(0, 0, 0, 0);
    if (normalizedDay < today) {
      throw new AdmissionsDecisionError('Start date must be today or in the future', 400);
    }
  }

  const policy = await prismaClient.centerBillingPolicy.findUnique({ where: { key: 'PRIMARY' } });
  const holdHours = policy?.holdHours ?? 24;
  const nextDecisionReason = decisionReason ?? (status === 'WAITLISTED' ? 'Admissions waitlist' : null);

  const enrollment = await prismaClient.enrollmentApplication.update({
    where: { id: enrollmentId },
    data: {
      status,
      startDate: normalizedStartDate,
      reviewedById: actorId,
      reviewedAt: now,
      reviewNotes,
      decisionReason: nextDecisionReason,
      approvedAt: status === 'APPROVED' ? now : null,
      spotHoldExpiresAt: status === 'APPROVED' ? new Date(now.getTime() + holdHours * 60 * 60 * 1000) : null,
      spotSecuredAt: status === 'APPROVED' ? existing.spotSecuredAt : null,
      requiredIntakeComplete: status === 'APPROVED' ? true : existing.requiredIntakeComplete,
      intakeMissingFields: status === 'APPROVED' ? [] : existing.intakeMissingFields,
    },
    include: {
      child: true,
      parent: true,
    },
  });

  const communicationResult = await writeDecisionCommunications({
    status,
    origin,
    enrollment,
  });

  await syncFamilyCrmProfile(prismaClient, enrollment.parentId);
  await writeAudit({
    actorId,
    action: input.auditAction ?? 'ENROLLMENT_DECISION_UPDATED',
    targetType: 'EnrollmentApplication',
    targetId: enrollment.id,
    metadata: {
      status,
      reviewNotes,
      decisionReason: nextDecisionReason,
      holdExpiresAt: enrollment.spotHoldExpiresAt,
      notificationDelivery: communicationResult.delivery,
      failedCommunicationWrites: communicationResult.failedCommunicationWrites,
      clientMetrics: input.clientMetrics ?? null,
      uiRevampPhase: uiRevamp.phase,
    },
  });

  return enrollment;
}
