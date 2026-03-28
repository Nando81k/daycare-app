import type { CommunicationChannel, CommunicationStatus, CommunicationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata as any,
    },
  });
}

export async function writeCommunication(input: {
  parentId: string;
  createdByAdminId?: string | null;
  childId?: string | null;
  enrollmentId?: string | null;
  invoiceId?: string | null;
  type: CommunicationType;
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
  subject?: string;
  message?: string;
}) {
  await prisma.communicationEvent.create({
    data: {
      parentId: input.parentId,
      createdByAdminId: input.createdByAdminId ?? null,
      childId: input.childId ?? null,
      enrollmentId: input.enrollmentId ?? null,
      invoiceId: input.invoiceId ?? null,
      type: input.type,
      channel: input.channel ?? 'IN_APP',
      status: input.status ?? 'SENT',
      subject: input.subject,
      message: input.message,
    },
  });
}
