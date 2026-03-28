import { NextResponse } from 'next/server';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function POST() {
  const { error } = await requireApiAdmin();
  if (error) return error;

  return NextResponse.json(
    {
      error: {
        message: 'Manual payment posting is retired in the simplified billing workflow.',
      },
    },
    { status: 410 },
  );
}
