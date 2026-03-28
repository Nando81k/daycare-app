import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getPasswordValidationErrors } from '@/lib/password';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: 'Invalid registration payload' } },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const passwordErrors = getPasswordValidationErrors(parsed.data.password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        {
          error: {
            message: 'Password does not meet security requirements',
            details: passwordErrors,
          },
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: { message: 'Email already in use' } }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        passwordHash,
        role: 'PARENT',
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { message: 'Unable to register' } }, { status: 500 });
  }
}
