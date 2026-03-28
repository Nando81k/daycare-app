import { NextResponse } from 'next/server';

const payload = {
  error: {
    message: 'Tours are deprecated. Please use Start Enrollment instead.',
    code: 'TOURS_DEPRECATED',
  },
};

export async function GET() {
  return NextResponse.json(payload, { status: 410 });
}

export async function POST() {
  return NextResponse.json(payload, { status: 410 });
}
