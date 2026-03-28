import { NextResponse } from 'next/server';

const payload = {
  error: {
    message: 'Tours are deprecated and archived.',
    code: 'TOURS_DEPRECATED',
  },
};

export async function GET() {
  return NextResponse.json(payload, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json(payload, { status: 410 });
}
