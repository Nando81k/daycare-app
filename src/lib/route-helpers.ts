import { NextResponse } from 'next/server';
import type { AdminRole, UserRole } from '@prisma/client';
import { auth } from '@/lib/auth';
import { hasPermission, type Permission } from '@/lib/rbac';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: { message } }, { status });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function isSameOriginMutationRequest(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = request.headers.get('origin');
  const refererHeader = request.headers.get('referer');

  if (originHeader && originHeader !== requestOrigin) return false;

  if (!originHeader && refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (refererOrigin !== requestOrigin) return false;
    } catch {
      return false;
    }
  }

  return true;
}

export async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function requireApiUser() {
  const session = await auth();

  if (!session?.user) {
    return { error: jsonError('Unauthorized', 401) as NextResponse, user: null };
  }

  return {
    error: null,
    user: {
      id: session.user.id,
      role: session.user.role as UserRole,
      adminRole: session.user.adminRole as AdminRole | null,
    },
  };
}

export async function requireApiAdmin(permission?: Permission) {
  const { error, user } = await requireApiUser();
  if (error || !user) return { error: error ?? jsonError('Unauthorized', 401), user: null };

  if (user.role !== 'ADMIN') {
    return { error: jsonError('Forbidden', 403), user: null };
  }

  if (permission && !hasPermission(user.adminRole, permission)) {
    return { error: jsonError('Forbidden', 403), user: null };
  }

  return { error: null, user };
}

export async function requireApiParent() {
  const { error, user } = await requireApiUser();
  if (error || !user) return { error: error ?? jsonError('Unauthorized', 401), user: null };

  if (user.role !== 'PARENT') {
    return { error: jsonError('Forbidden', 403), user: null };
  }

  return { error: null, user };
}
