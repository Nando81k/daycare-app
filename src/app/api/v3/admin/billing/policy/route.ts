import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { PERMISSIONS } from '@/lib/rbac';
import { parseJson, requireApiAdmin } from '@/lib/route-helpers';
import { policySchema } from '@/lib/validation';

export async function GET() {
  const { error } = await requireApiAdmin(PERMISSIONS.BILLING_READ);
  if (error) return error;

  const policy = await prisma.centerBillingPolicy.findUnique({ where: { key: 'PRIMARY' } });
  return NextResponse.json({ policy });
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiAdmin(PERMISSIONS.POLICY_WRITE);
  if (error || !user) return error;

  const raw = await parseJson<unknown>(request);
  const parsed = policySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid billing policy payload' } }, { status: 400 });
  }

  const policy = await prisma.centerBillingPolicy.upsert({
    where: { key: 'PRIMARY' },
    update: parsed.data,
    create: {
      key: 'PRIMARY',
      ...parsed.data,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: 'BILLING_POLICY_UPDATED',
    targetType: 'CenterBillingPolicy',
    targetId: policy.id,
    metadata: parsed.data,
  });

  return NextResponse.json({ policy });
}
