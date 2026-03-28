import { NextResponse } from 'next/server';
import { requireApiParent } from '@/lib/route-helpers';

export async function POST() {
  const { error } = await requireApiParent();
  if (error) return error;

  return NextResponse.json(
    {
      error: {
        message: 'Secure-spot checkout is retired. Use tuition invoice checkout from the billing page.',
      },
    },
    { status: 410 },
  );
}
