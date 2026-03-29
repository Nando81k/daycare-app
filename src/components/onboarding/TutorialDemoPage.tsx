'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import type { OnboardingStep, TutorialScope } from '@/lib/onboarding/definitions';
import { Badge, Button } from '@/components/ui';
import { SpotlightLayer } from '@/components/onboarding/SpotlightLayer';

interface TutorialDemoPageProps {
  scope: TutorialScope;
  steps: OnboardingStep[];
  title: string;
  subtitle: string;
  completionHref: string;
  children: React.ReactNode;
}

const PANEL_MARGIN = 16;
const PANEL_GAP = 14;

interface RectLike {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function overlapArea(a: RectLike, b: RectLike) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function computePanelPlacement(targetRect: DOMRect | null, panelSize: { width: number; height: number }) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const maxWidth = Math.max(280, Math.min(420, viewportWidth - PANEL_MARGIN * 2));
  const panelWidth = Math.min(panelSize.width || maxWidth, maxWidth);
  const panelHeight = Math.min(panelSize.height || 320, viewportHeight - PANEL_MARGIN * 2);

  const candidates: Array<RectLike> = [];

  function pushCandidate(rawLeft: number, rawTop: number) {
    const left = clamp(rawLeft, PANEL_MARGIN, viewportWidth - panelWidth - PANEL_MARGIN);
    const top = clamp(rawTop, PANEL_MARGIN, viewportHeight - panelHeight - PANEL_MARGIN);
    candidates.push({
      left,
      top,
      right: left + panelWidth,
      bottom: top + panelHeight,
    });
  }

  if (targetRect) {
    pushCandidate(targetRect.right + PANEL_GAP, targetRect.top);
    pushCandidate(targetRect.left - panelWidth - PANEL_GAP, targetRect.top);
    pushCandidate(targetRect.left + (targetRect.width - panelWidth) / 2, targetRect.bottom + PANEL_GAP);
    pushCandidate(targetRect.left + (targetRect.width - panelWidth) / 2, targetRect.top - panelHeight - PANEL_GAP);
  }

  pushCandidate(viewportWidth - panelWidth - PANEL_MARGIN, viewportHeight - panelHeight - PANEL_MARGIN);
  pushCandidate(PANEL_MARGIN, viewportHeight - panelHeight - PANEL_MARGIN);

  if (!targetRect) {
    const fallback = candidates[0];
    return { left: fallback.left, top: fallback.top, maxWidth };
  }

  const targetBounds: RectLike = {
    left: targetRect.left,
    top: targetRect.top,
    right: targetRect.right,
    bottom: targetRect.bottom,
  };

  const best = candidates
    .map((candidate) => ({
      candidate,
      overlap: overlapArea(candidate, targetBounds),
      distance:
        Math.abs(candidate.left - targetRect.left) +
        Math.abs(candidate.top - targetRect.top),
    }))
    .sort((a, b) => {
      if (a.overlap !== b.overlap) return a.overlap - b.overlap;
      return a.distance - b.distance;
    })[0];

  return {
    left: best.candidate.left,
    top: best.candidate.top,
    maxWidth,
  };
}

function getTargetRect(targetId: string) {
  const primary = document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);
  if (primary) return primary.getBoundingClientRect();

  const fallback = document.querySelector<HTMLElement>('[data-tour-id="shell-main"]');
  return fallback?.getBoundingClientRect() ?? null;
}

export function TutorialDemoPage(props: TutorialDemoPageProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hasStartedRef = useRef(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [panelSize, setPanelSize] = useState({ width: 360, height: 320 });

  const steps = props.steps;
  const activeStep = steps[stepIndex] || null;
  const isLastStep = stepIndex >= steps.length - 1;
  const progress = ((stepIndex + 1) / Math.max(steps.length, 1)) * 100;

  const panelPlacement = useMemo(() => {
    if (!activeStep) return null;
    return computePanelPlacement(targetRect, panelSize);
  }, [activeStep, panelSize, targetRect]);

  useEffect(() => {
    if (!panelRef.current) return;
    const readSize = () => {
      const rect = panelRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPanelSize({
        width: rect.width,
        height: rect.height,
      });
    };

    readSize();
    const observer = new ResizeObserver(readSize);
    observer.observe(panelRef.current);
    window.addEventListener('resize', readSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', readSize);
    };
  }, []);

  useEffect(() => {
    if (!activeStep) return;
    const update = () => {
      setTargetRect(getTargetRect(activeStep.targetId));
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [activeStep]);

  useEffect(() => {
    if (!activeStep) return;
    const element =
      document.querySelector<HTMLElement>(`[data-tour-id="${activeStep.targetId}"]`) ||
      document.querySelector<HTMLElement>('[data-tour-id="shell-main"]');
    if (!element) return;
    element.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [activeStep, shouldReduceMotion]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, []);

  const patchState = useCallback(
    async (
      action: 'START' | 'STEP' | 'SKIP' | 'COMPLETE' | 'RESET',
      step: OnboardingStep | null,
      showSaving = false
    ) => {
      if (!step && action !== 'RESET') return;
      if (showSaving) setSaving(true);
      setError('');
      try {
        const response = await fetch('/api/v3/onboarding/state', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: props.scope,
            action,
            currentStepKey: step?.key ?? null,
            currentRoute: step?.route ?? null,
          }),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          setError(body?.error?.message || 'Unable to update tutorial state.');
        }
      } catch {
        setError('Unable to update tutorial state.');
      } finally {
        if (showSaving) setSaving(false);
      }
    },
    [props.scope]
  );

  useEffect(() => {
    if (!activeStep) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    void patchState('START', activeStep);
  }, [activeStep, patchState]);

  useEffect(() => {
    if (!activeStep) return;
    if (!hasStartedRef.current) return;
    if (stepIndex === 0) return;
    void patchState('STEP', activeStep);
  }, [activeStep, patchState, stepIndex]);

  async function goBack() {
    setStepIndex((previous) => Math.max(previous - 1, 0));
  }

  async function goNext() {
    if (!activeStep) return;
    if (isLastStep) {
      await patchState('COMPLETE', activeStep, true);
      router.replace(props.completionHref);
      return;
    }
    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
  }

  async function skipTutorial() {
    await patchState('SKIP', activeStep, true);
    router.replace(props.completionHref);
  }

  async function restartTutorial() {
    await patchState('RESET', null, true);
    hasStartedRef.current = false;
    setStepIndex(0);
  }

  if (!steps.length) {
    return (
      <div className="glass-shell rounded-panel p-5">
        <p className="text-sm text-ink-700">No tutorial steps are configured for this account.</p>
        <Button className="mt-3" onClick={() => router.replace(props.completionHref)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[74vh]">
      <div className="mb-4 border-b border-white/60 pb-3">
        <div className="flex items-center gap-2">
          <p className="kicker">Interactive Tutorial</p>
          <Badge variant="info">Live data</Badge>
        </div>
        <h2 className="text-2xl font-semibold text-ink-900">{props.title}</h2>
        <p className="mt-1 text-sm text-ink-700">{props.subtitle}</p>
      </div>

      {props.children}

      <SpotlightLayer targetRect={targetRect} />

      <AnimatePresence mode="wait">
        {activeStep && panelPlacement ? (
          <motion.section
            key={activeStep.key}
            ref={panelRef}
            className="fixed z-[132] rounded-[18px] border border-white/65 bg-white/80 p-4 shadow-float"
            style={{
              left: panelPlacement.left,
              top: panelPlacement.top,
              maxWidth: panelPlacement.maxWidth,
              width: 'min(92vw, 24rem)',
            }}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: shouldReduceMotion ? 0.08 : 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard tutorial"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="kicker">Step-by-step guide</p>
              <Badge variant={props.scope === 'ADMIN_DASHBOARD' ? 'info' : 'default'}>
                {props.scope === 'ADMIN_DASHBOARD' ? 'Admin' : 'Parent'}
              </Badge>
            </div>
            <h3 className="mt-1 text-lg font-semibold text-ink-900">{activeStep.title}</h3>
            <p className="mt-1 text-sm text-ink-700">{activeStep.body}</p>

            <div className="mt-3">
              <div className="onboarding-progress-track">
                <div className="onboarding-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">
                Step {stepIndex + 1} of {steps.length}
              </p>
            </div>

            {error ? (
              <p className="mt-2 rounded-field border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/60 pt-3">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={restartTutorial} disabled={saving}>
                  Restart
                </Button>
                <Button size="sm" variant="outline" onClick={goBack} disabled={saving || stepIndex === 0}>
                  Back
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={skipTutorial} disabled={saving}>
                  Skip
                </Button>
                <Button size="sm" onClick={goNext} isLoading={saving} loadingText="Saving">
                  {isLastStep ? 'Finish Tutorial' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
