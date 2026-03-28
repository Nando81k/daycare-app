import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncFamilyCrmProfile } from '@/lib/crm/stage';
import { deriveRecurringAmount } from '@/lib/billing';
import { writeAudit, writeCommunication } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { contractSchema, contractUpdateSchema } from '@/lib/validation';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';

export async function GET() {
  const { error } = await requireApiAdmin(PERMISSIONS.BILLING_READ);
  if (error) return error;

  const contracts = await prisma.childTuitionContract.findMany({
    include: {
      parent: { select: { firstName: true, lastName: true, email: true } },
      child: { select: { firstName: true, lastName: true } },
      tuitionPlan: { select: { name: true, monthlyAmountCents: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ contracts });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = contractSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid contract payload' } }, { status: 400 });
  }

  const plan = await prisma.tuitionPlan.findUnique({ where: { id: parsed.data.tuitionPlanId } });
  if (!plan) {
    return NextResponse.json({ error: { message: 'Tuition plan not found' } }, { status: 404 });
  }

  const recurringAmountCents = deriveRecurringAmount(plan.monthlyAmountCents, parsed.data.billingCadence);
  const startDate = new Date(parsed.data.startDate);

  const contract = await prisma.childTuitionContract.create({
    data: {
      parentId: parsed.data.parentId,
      childId: parsed.data.childId,
      tuitionPlanId: parsed.data.tuitionPlanId,
      billingCadence: parsed.data.billingCadence,
      recurringAmountCents,
      startDate,
      invoiceDay: startDate.getDate(),
      autoPayEnabled: parsed.data.autoPayEnabled,
    },
  });

  await Promise.all([
    writeAudit({
      actorId: user.id,
      action: 'TUITION_CONTRACT_CREATED',
      targetType: 'ChildTuitionContract',
      targetId: contract.id,
      metadata: parsed.data,
    }),
    writeCommunication({
      parentId: contract.parentId,
      childId: contract.childId,
      type: 'BILLING',
      channel: 'IN_APP',
      subject: 'Tuition contract created',
      message: `A new tuition contract was created with ${parsed.data.billingCadence.toLowerCase()} billing cadence.`,
    }),
  ]);
  await syncFamilyCrmProfile(prisma, contract.parentId);

  return NextResponse.json({ contract }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = contractUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid contract update payload' } }, { status: 400 });
  }
  const payload = parsed.data;

  const existing = await prisma.childTuitionContract.findUnique({
    where: { id: payload.id },
    include: { tuitionPlan: true },
  });
  if (!existing) {
    return NextResponse.json({ error: { message: 'Contract not found' } }, { status: 404 });
  }

  const requestedPlanId = payload.tuitionPlanId ?? existing.tuitionPlanId;
  const plan =
    requestedPlanId === existing.tuitionPlanId
      ? existing.tuitionPlan
      : await prisma.tuitionPlan.findUnique({ where: { id: requestedPlanId } });
  if (!plan) {
    return NextResponse.json({ error: { message: 'Tuition plan not found' } }, { status: 404 });
  }

  const nextCadence = payload.billingCadence ?? existing.billingCadence;
  if (nextCadence === 'WEEKLY' && !plan.allowWeekly) {
    return NextResponse.json({ error: { message: 'Weekly cadence is not allowed for this plan' } }, { status: 400 });
  }
  if (nextCadence === 'BIWEEKLY' && !plan.allowBiweekly) {
    return NextResponse.json({ error: { message: 'Biweekly cadence is not allowed for this plan' } }, { status: 400 });
  }
  if (nextCadence === 'MONTHLY' && !plan.allowMonthly) {
    return NextResponse.json({ error: { message: 'Monthly cadence is not allowed for this plan' } }, { status: 400 });
  }

  const shouldRecalculate =
    payload.billingCadence !== undefined ||
    payload.tuitionPlanId !== undefined ||
    payload.recurringAmountCents !== undefined;
  const nextRecurringAmount =
    payload.recurringAmountCents !== undefined
      ? payload.recurringAmountCents
      : deriveRecurringAmount(plan.monthlyAmountCents, nextCadence);

  const contract = await prisma.childTuitionContract.update({
    where: { id: payload.id },
    data: {
      status: payload.status,
      autoPayEnabled: payload.autoPayEnabled,
      tuitionPlanId: payload.tuitionPlanId,
      nextChargeDate:
        payload.nextChargeDate === undefined
          ? undefined
          : payload.nextChargeDate
            ? new Date(payload.nextChargeDate)
            : null,
      billingCadence: payload.billingCadence,
      recurringAmountCents: shouldRecalculate ? nextRecurringAmount : undefined,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'TUITION_CONTRACT_UPDATED',
    targetType: 'ChildTuitionContract',
    targetId: contract.id,
    metadata: payload,
  });
  await syncFamilyCrmProfile(prisma, contract.parentId);

  return NextResponse.json({ contract });
}
