import type { AdminRole, OnboardingScope, OnboardingStatus, UserRole, UserOnboardingProgress } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/lib/events';
import { ONBOARDING_VERSIONS } from './definitions';

export type OnboardingAction = 'START' | 'STEP' | 'SKIP' | 'COMPLETE' | 'RESET';

interface StepPayload {
  currentStepKey?: string | null;
  currentRoute?: string | null;
}

export function isScopeAllowedForUser(input: {
  role: UserRole;
  scope: OnboardingScope;
}) {
  if (input.role === 'ADMIN') return input.scope === 'ADMIN_DASHBOARD';
  return input.scope === 'PARENT_DASHBOARD';
}

export async function getOrInitOnboardingProgress(
  userId: string,
  scope: OnboardingScope
): Promise<UserOnboardingProgress> {
  const version = ONBOARDING_VERSIONS[scope];
  const key = { userId_scope: { userId, scope } };

  const existing = await prisma.userOnboardingProgress.findUnique({
    where: key,
  });

  if (!existing) {
    return prisma.userOnboardingProgress.create({
      data: {
        userId,
        scope,
        version,
        status: 'NOT_STARTED',
      },
    });
  }

  if (existing.version !== version) {
    return prisma.userOnboardingProgress.update({
      where: key,
      data: {
        version,
        status: 'NOT_STARTED',
        currentStepKey: null,
        currentRoute: null,
        startedAt: null,
        completedAt: null,
        skippedAt: null,
      },
    });
  }

  return existing;
}

function statusForAction(action: OnboardingAction): OnboardingStatus {
  if (action === 'SKIP') return 'SKIPPED';
  if (action === 'COMPLETE') return 'COMPLETED';
  if (action === 'RESET') return 'NOT_STARTED';
  return 'IN_PROGRESS';
}

export async function updateOnboardingProgress(input: {
  userId: string;
  scope: OnboardingScope;
  action: OnboardingAction;
  payload?: StepPayload;
  actorId?: string | null;
  actorAdminRole?: AdminRole | null;
}) {
  const now = new Date();
  const existing = await getOrInitOnboardingProgress(input.userId, input.scope);
  const status = statusForAction(input.action);

  const updated = await prisma.userOnboardingProgress.update({
    where: {
      userId_scope: {
        userId: input.userId,
        scope: input.scope,
      },
    },
    data: {
      status,
      currentStepKey: input.action === 'RESET' ? null : input.payload?.currentStepKey ?? existing.currentStepKey,
      currentRoute: input.action === 'RESET' ? null : input.payload?.currentRoute ?? existing.currentRoute,
      startedAt:
        input.action === 'RESET'
          ? null
          : input.action === 'START'
            ? existing.startedAt ?? now
            : existing.startedAt,
      completedAt: input.action === 'COMPLETE' ? now : input.action === 'RESET' ? null : existing.completedAt,
      skippedAt: input.action === 'SKIP' ? now : input.action === 'RESET' ? null : existing.skippedAt,
    },
  });

  if (input.action === 'START' || input.action === 'SKIP' || input.action === 'COMPLETE' || input.action === 'RESET') {
    await writeAudit({
      actorId: input.actorId ?? input.userId,
      action: `ONBOARDING_${input.action}`,
      targetType: 'UserOnboardingProgress',
      targetId: updated.id,
      metadata: {
        scope: input.scope,
        status: updated.status,
        currentStepKey: updated.currentStepKey,
        currentRoute: updated.currentRoute,
        adminRole: input.actorAdminRole ?? null,
      },
    });
  }

  return updated;
}

export function shouldAutoLaunch(status: OnboardingStatus) {
  return status === 'NOT_STARTED';
}
