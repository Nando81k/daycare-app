import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';
import { planSchema } from '@/lib/validation';

export async function GET() {
  const { error } = await requireApiAdmin(PERMISSIONS.BILLING_READ);
  if (error) return error;

  const plans = await prisma.tuitionPlan.findMany({ orderBy: [{ isActive: 'desc' }, { name: 'asc' }] });
  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = planSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid plan payload' } }, { status: 400 });
  }

  const plan = await prisma.tuitionPlan.create({
    data: parsed.data,
  });

  await writeAudit({
    actorId: user.id,
    action: 'TUITION_PLAN_CREATED',
    targetType: 'TuitionPlan',
    targetId: plan.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ plan }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.BILLING_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<{ id?: string } & Record<string, unknown>>(request);
  if (!raw?.id) {
    return NextResponse.json({ error: { message: 'Plan id is required' } }, { status: 400 });
  }

  const parsed = planSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid plan payload' } }, { status: 400 });
  }

  const { id, ...data } = parsed.data as { id?: string } & Record<string, unknown>;

  const plan = await prisma.tuitionPlan.update({
    where: { id: raw.id },
    data,
  });

  await writeAudit({
    actorId: user.id,
    action: 'TUITION_PLAN_UPDATED',
    targetType: 'TuitionPlan',
    targetId: plan.id,
    metadata: data,
  });

  return NextResponse.json({ plan });
}
