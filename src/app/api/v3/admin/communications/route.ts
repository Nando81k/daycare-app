import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { sendAdminNotificationEmail } from '@/lib/communications/admin-notification';
import { PERMISSIONS } from '@/lib/rbac';
import { adminCommunicationDeliverySchema, adminNotificationCreateSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.COMMUNICATIONS_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = adminNotificationCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid communication payload' } }, { status: 400 });
  }

  const parent = await prisma.user.findFirst({
    where: { id: parsed.data.parentId, role: 'PARENT' },
    select: { id: true, email: true, firstName: true },
  });
  if (!parent) {
    return NextResponse.json({ error: { message: 'Parent account not found' } }, { status: 404 });
  }

  if (parsed.data.childId) {
    const child = await prisma.child.findFirst({
      where: { id: parsed.data.childId, parentId: parsed.data.parentId },
      select: { id: true },
    });
    if (!child) {
      return NextResponse.json({ error: { message: 'Child not found for this parent' } }, { status: 404 });
    }
  }

  if (parsed.data.enrollmentId) {
    const enrollment = await prisma.enrollmentApplication.findFirst({
      where: { id: parsed.data.enrollmentId, parentId: parsed.data.parentId },
      select: { id: true },
    });
    if (!enrollment) {
      return NextResponse.json({ error: { message: 'Enrollment not found for this parent' } }, { status: 404 });
    }
  }

  if (parsed.data.invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: parsed.data.invoiceId, parentId: parsed.data.parentId },
      select: { id: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: { message: 'Invoice not found for this parent' } }, { status: 404 });
    }
  }

  const deliveryParsed = adminCommunicationDeliverySchema.safeParse(parsed.data.delivery ?? { inApp: true, email: true });
  if (!deliveryParsed.success) {
    return NextResponse.json({ error: { message: 'Invalid delivery settings' } }, { status: 400 });
  }

  const communication = await prisma.communicationEvent.create({
    data: {
      parentId: parsed.data.parentId,
      createdByAdminId: user.id,
      childId: parsed.data.childId ?? null,
      enrollmentId: parsed.data.enrollmentId ?? null,
      invoiceId: parsed.data.invoiceId ?? null,
      type: parsed.data.type,
      channel: 'IN_APP',
      status: 'SENT',
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  let emailDelivery: Awaited<ReturnType<typeof sendAdminNotificationEmail>> | null = null;
  if (deliveryParsed.data.email) {
    emailDelivery = await sendAdminNotificationEmail({
      to: parent.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      recipientFirstName: parent.firstName,
    });

    await prisma.communicationEvent.create({
      data: {
        parentId: parsed.data.parentId,
        createdByAdminId: user.id,
        childId: parsed.data.childId ?? null,
        enrollmentId: parsed.data.enrollmentId ?? null,
        invoiceId: parsed.data.invoiceId ?? null,
        type: parsed.data.type,
        channel: 'EMAIL',
        status: emailDelivery.sent ? 'SENT' : 'FAILED',
        subject: parsed.data.subject,
        message: emailDelivery.sent
          ? parsed.data.message
          : `Email delivery failed: ${emailDelivery.error ?? emailDelivery.reason ?? 'Unknown error'}`,
      },
    });
  }

  await prisma.familyCrmProfile.upsert({
    where: { parentId: parsed.data.parentId },
    update: { lastContactedAt: new Date() },
    create: {
      parentId: parsed.data.parentId,
      lastContactedAt: new Date(),
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'ADMIN_NOTIFICATION_SENT',
    targetType: 'CommunicationEvent',
    targetId: communication.id,
    metadata: {
      parentId: parsed.data.parentId,
      childId: parsed.data.childId ?? null,
      enrollmentId: parsed.data.enrollmentId ?? null,
      invoiceId: parsed.data.invoiceId ?? null,
      type: parsed.data.type,
      delivery: {
        inApp: true,
        email: deliveryParsed.data.email,
      },
      emailDelivery,
      clientMetrics: parsed.data.clientMetrics ?? null,
    },
  });

  return NextResponse.json({ communication, emailDelivery }, { status: 201 });
}
