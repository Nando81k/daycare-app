'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OnboardingStatus } from '@prisma/client';
import { usePathname, useRouter } from 'next/navigation';
import type { OnboardingStep, TutorialScope } from '@/lib/onboarding/definitions';

interface OnboardingStateResponse {
  scope: TutorialScope;
  version: number;
  status: OnboardingStatus;
  currentStepKey: string | null;
  currentRoute: string | null;
  autoLaunch: boolean;
  updatedAt: string;
}

type OnboardingAction = 'START' | 'STEP' | 'SKIP' | 'COMPLETE' | 'RESET';

function routeMatches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function useOnboarding(input: {
  scope?: TutorialScope;
  enabled?: boolean;
  steps: OnboardingStep[];
  mode?: 'overlay' | 'page';
  tutorialRoute?: string;
}) {
  const { scope, enabled = true, steps, mode = 'overlay', tutorialRoute } = input;
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(Boolean(scope && enabled));
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');

  const currentStep = steps[stepIndex] || null;
  const isLastStep = stepIndex >= steps.length - 1;

  const patchState = useCallback(
    async (action: OnboardingAction, payload?: { currentStepKey?: string | null; currentRoute?: string | null }) => {
      if (!scope) return null;

      setSaving(true);
      try {
        const response = await fetch('/api/v3/onboarding/state', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope,
            action,
            currentStepKey: payload?.currentStepKey ?? null,
            currentRoute: payload?.currentRoute ?? null,
          }),
        });

        const body = await response.json().catch(() => null);
        if (!response.ok) {
          setError(body?.error?.message || 'Unable to update onboarding state.');
          return null;
        }

        setStatus((body as OnboardingStateResponse).status);
        return body as OnboardingStateResponse;
      } finally {
        setSaving(false);
      }
    },
    [scope]
  );

  const openFromStart = useCallback(async () => {
    if (!scope || !steps.length) return;
    setError('');

    const first = steps[0];
    await patchState('START', { currentStepKey: first.key, currentRoute: first.route });

    if (mode === 'page' && tutorialRoute) {
      setIsOpen(false);
      setStepIndex(0);
      if (!routeMatches(pathname, tutorialRoute)) {
        router.push(tutorialRoute);
      }
      return;
    }

    setStepIndex(0);
    setIsOpen(true);
    if (!routeMatches(pathname, first.route)) {
      router.push(first.route);
    }
  }, [mode, patchState, pathname, router, scope, steps, tutorialRoute]);

  const goToStep = useCallback(
    async (nextIndex: number) => {
      if (!scope || !steps.length) return;
      const bounded = Math.max(0, Math.min(nextIndex, steps.length - 1));
      const next = steps[bounded];
      setStepIndex(bounded);

      void patchState('STEP', {
        currentStepKey: next.key,
        currentRoute: next.route,
      });

      if (!routeMatches(pathname, next.route)) {
        router.push(next.route);
      }
    },
    [patchState, pathname, router, scope, steps]
  );

  const next = useCallback(async () => {
    if (!currentStep) return;
    if (isLastStep) {
      setIsOpen(false);
      await patchState('COMPLETE', {
        currentStepKey: currentStep.key,
        currentRoute: currentStep.route,
      });
      return;
    }

    await goToStep(stepIndex + 1);
  }, [currentStep, goToStep, isLastStep, patchState, stepIndex]);

  const back = useCallback(async () => {
    if (stepIndex <= 0) return;
    await goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  const skip = useCallback(async () => {
    if (!currentStep) return;
    setIsOpen(false);
    await patchState('SKIP', {
      currentStepKey: currentStep.key,
      currentRoute: pathname,
    });
  }, [currentStep, patchState, pathname]);

  const restart = useCallback(async () => {
    if (!scope || !steps.length) return;
    await patchState('RESET', {
      currentStepKey: null,
      currentRoute: null,
    });
    await openFromStart();
  }, [openFromStart, patchState, scope, steps.length]);

  useEffect(() => {
    let cancelled = false;
    if (!scope || !enabled) {
      setLoading(false);
      return;
    }

    async function loadState() {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/v3/onboarding/state?scope=${scope}`, {
        cache: 'no-store',
      });
      const body = await response.json().catch(() => null);

      if (cancelled) return;
      if (!response.ok) {
        setLoading(false);
        setError(body?.error?.message || 'Unable to load onboarding state.');
        return;
      }

      const state = body as OnboardingStateResponse;
      setStatus(state.status);

      if (state.currentStepKey) {
        const idx = steps.findIndex((step) => step.key === state.currentStepKey);
        if (idx >= 0) setStepIndex(idx);
      }

      setLoading(false);

      if (state.autoLaunch && steps.length) {
        if (mode === 'page' && tutorialRoute && routeMatches(pathname, tutorialRoute)) {
          return;
        }
        await openFromStart();
      }
    }

    void loadState();
    return () => {
      cancelled = true;
    };
  }, [enabled, mode, openFromStart, pathname, scope, steps, tutorialRoute]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;
    if (mode !== 'overlay') return;
    if (routeMatches(pathname, currentStep.route)) return;
    router.replace(currentStep.route);
  }, [currentStep, isOpen, mode, pathname, router]);

  return useMemo(
    () => ({
      loading,
      saving,
      status,
      error,
      clearError: () => setError(''),
      isOpen,
      setIsOpen,
      stepIndex,
      totalSteps: steps.length,
      currentStep,
      isLastStep,
      openFromStart,
      next,
      back,
      skip,
      restart,
    }),
    [
      back,
      currentStep,
      error,
      isLastStep,
      isOpen,
      loading,
      next,
      openFromStart,
      restart,
      saving,
      skip,
      status,
      stepIndex,
      steps.length,
    ]
  );
}
