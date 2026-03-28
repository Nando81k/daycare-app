import { NextResponse } from 'next/server';
import type { OnboardingScope } from '@prisma/client';
import { onboardingStatePatchSchema, onboardingStateQuerySchema } from '@/lib/validation';
import { isSameOriginMutationRequest, parseJson, requireApiUser } from '@/lib/route-helpers';
import {
  getOrInitOnboardingProgress,
  isScopeAllowedForUser,
  shouldAutoLaunch,
  updateOnboardingProgress,
} from '@/lib/onboarding/service';

function formatProgress(scope: OnboardingScope, progress: Awaited<ReturnType<typeof getOrInitOnboardingProgress>>) {
  return {
    scope,
    version: progress.version,
    status: progress.status,
    currentStepKey: progress.currentStepKey,
    currentRoute: progress.currentRoute,
    autoLaunch: shouldAutoLaunch(progress.status),
    updatedAt: progress.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const { error, user } = await requireApiUser();
  if (error || !user) return error;

  const url = new URL(request.url);
  const parsed = onboardingStateQuerySchema.safeParse({
    scope: url.searchParams.get('scope'),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid onboarding scope' } }, { status: 400 });
  }

  const scope = parsed.data.scope;
  if (!isScopeAllowedForUser({ role: user.role, scope })) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }

  try {
    const progress = await getOrInitOnboardingProgress(user.id, scope);
    return NextResponse.json(formatProgress(scope, progress));
  } catch {
    return NextResponse.json({ error: { message: 'Unable to load onboarding state' } }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, user } = await requireApiUser();
  if (error || !user) return error;

  if (!isSameOriginMutationRequest(request)) {
    return NextResponse.json({ error: { message: 'Forbidden origin' } }, { status: 403 });
  }

  const raw = await parseJson<unknown>(request);
  const parsed = onboardingStatePatchSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: { message: 'Invalid onboarding update payload' } }, { status: 400 });
  }

  const { scope, action, currentStepKey, currentRoute } = parsed.data;
  if (!isScopeAllowedForUser({ role: user.role, scope })) {
    return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
  }

  try {
    const progress = await updateOnboardingProgress({
      userId: user.id,
      scope,
      action,
      payload: {
        currentStepKey,
        currentRoute,
      },
      actorId: user.id,
      actorAdminRole: user.adminRole ?? null,
    });
    return NextResponse.json(formatProgress(scope, progress));
  } catch {
    return NextResponse.json({ error: { message: 'Unable to update onboarding state' } }, { status: 500 });
  }
}
