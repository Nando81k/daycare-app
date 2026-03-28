import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

const familyUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireApiAdmin(PERMISSIONS.FAMILIES_READ);
  if (error) return error;
  const { id } = await params;

  await syncFamilyCrmProfile(prisma, id);

  const family = await prisma.user.findFirst({
    where: { id, role: 'PARENT' },
    include: {
      children: {
        orderBy: { createdAt: 'desc' },
      },
      enrollments: {
        include: {
          child: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      invoices: {
        include: {
          child: { select: { firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'desc' },
        take: 20,
      },
      payments: {
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      communicationEvents: {
        include: {
          createdByAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      crmProfileParent: {
        include: {
          ownerAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              adminRole: true,
            },
          },
          tasks: {
            include: {
              ownerAdmin: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              createdByAdmin: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { createdAt: 'desc' }],
          },
          notes: {
            include: {
              createdByAdmin: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          },
          tags: {
            include: {
              tag: true,
              assignedByAdmin: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!family) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const openTasks = (family.crmProfileParent?.tasks ?? []).filter((task) => task.status !== 'DONE');
  const pinnedNotes = (family.crmProfileParent?.notes ?? []).filter((note) => note.isPinned);
  const openInvoices = family.invoices.filter((invoice) => invoice.status === 'OPEN');
  const pastDueInvoices = family.invoices.filter((invoice) => invoice.status === 'PAST_DUE');
  const outstandingBalanceCents = [...openInvoices, ...pastDueInvoices].reduce(
    (sum, invoice) => sum + invoice.amountDueCents,
    0,
  );
  const approvedAwaitingSecureSpot = family.enrollments.filter(
    (enrollment) => enrollment.status === 'APPROVED' && !enrollment.spotSecuredAt,
  ).length;
  const admissionsNeedsReview = family.enrollments.filter(
    (enrollment) => enrollment.status === 'PENDING' || enrollment.status === 'REQUEST_INFO',
  ).length;
  const lastCommunicationAt = family.communicationEvents[0]?.createdAt ?? null;
  const lastTaskAt = family.crmProfileParent?.tasks[0]?.updatedAt ?? null;
  const lastEnrollmentAt = family.enrollments[0]?.updatedAt ?? null;
  const lastPaymentAt = family.payments[0]?.createdAt ?? null;

  const workspaceSnapshot = {
    counts: {
      openTasks: openTasks.length,
      pinnedNotes: pinnedNotes.length,
      openInvoices: openInvoices.length,
      pastDueInvoices: pastDueInvoices.length,
      outstandingBalanceCents,
      admissionsNeedsReview,
      approvedAwaitingSecureSpot,
      unreadInAppMessages: family.communicationEvents.filter(
        (event) => event.channel === 'IN_APP' && event.status !== 'READ',
      ).length,
    },
    timeline: {
      lastCommunicationAt: lastCommunicationAt ? lastCommunicationAt.toISOString() : null,
      lastTaskAt: lastTaskAt ? lastTaskAt.toISOString() : null,
      lastEnrollmentAt: lastEnrollmentAt ? lastEnrollmentAt.toISOString() : null,
      lastPaymentAt: lastPaymentAt ? lastPaymentAt.toISOString() : null,
    },
  };

  return NextResponse.json({ family, workspaceSnapshot });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.FAMILIES_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const raw = await parseJson<unknown>(request);
  const parsed = familyUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid family payload' } }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { id, role: 'PARENT' } });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Family not found' } }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
  });
  await syncFamilyCrmProfile(prisma, id);

  await writeAudit({
    actorId: user.id,
    action: 'FAMILY_UPDATED',
    targetType: 'User',
    targetId: id,
    metadata: parsed.data,
  });

  return NextResponse.json({ family: updated });
}
