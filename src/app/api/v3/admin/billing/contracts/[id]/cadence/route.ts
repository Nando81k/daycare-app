import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { deriveRecurringAmount } from '@/lib/billing';
import { writeAudit, writeCommunication } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { cadenceUpdateSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;
  const { id } = await params;

  const raw = await parseJson<unknown>(request);
  const parsed = cadenceUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid cadence payload' } }, { status: 400 });
  }

  const existing = await prisma.childTuitionContract.findUnique({
    where: { id },
    include: { tuitionPlan: true },
  });

  if (!existing) {
    return NextResponse.json({ error: { message: 'Contract not found' } }, { status: 404 });
  }

  const cadence = parsed.data.billingCadence;

  if (cadence === 'WEEKLY' && !existing.tuitionPlan.allowWeekly) {
    return NextResponse.json({ error: { message: 'Weekly cadence is not allowed for this plan' } }, { status: 400 });
  }
  if (cadence === 'BIWEEKLY' && !existing.tuitionPlan.allowBiweekly) {
    return NextResponse.json({ error: { message: 'Biweekly cadence is not allowed for this plan' } }, { status: 400 });
  }
  if (cadence === 'MONTHLY' && !existing.tuitionPlan.allowMonthly) {
    return NextResponse.json({ error: { message: 'Monthly cadence is not allowed for this plan' } }, { status: 400 });
  }

  const updated = await prisma.childTuitionContract.update({
    where: { id },
    data: {
      billingCadence: cadence,
      recurringAmountCents: deriveRecurringAmount(existing.tuitionPlan.monthlyAmountCents, cadence),
    },
  });

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'CONTRACT_CADENCE_UPDATED',
      targetType: 'ChildTuitionContract',
      targetId: updated.id,
      metadata: { oldCadence: existing.billingCadence, newCadence: cadence, effective: 'next_cycle' },
    }),
    writeCommunication({
      parentId: updated.parentId,
      childId: updated.childId,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: 'Billing cadence update',
      message: `Billing cadence was updated to ${cadence.toLowerCase()} and will apply on the next cycle.`,
    }),
  ]);
  await syncFamilyCrmProfile(prisma, updated.parentId);

  return NextResponse.json({ contract: updated });
}
