'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { OnboardingStep } from '@/lib/onboarding/definitions';
import { OnboardingPanel } from './OnboardingPanel';
import { SpotlightLayer } from './SpotlightLayer';

interface OnboardingOverlayProps {
  open: boolean;
  step: OnboardingStep | null;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  isSaving: boolean;
  error?: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onRestart: () => void;
}

function getTargetRect(targetId: string) {
  const element = document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);
  if (!element) return null;
  return element.getBoundingClientRect();
}

function routeMatches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

const PANEL_MARGIN = 14;
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

function computePanelPlacement(
  targetRect: DOMRect | null,
  panelSize: { width: number; height: number }
) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const maxWidth = Math.max(264, Math.min(420, viewportWidth - PANEL_MARGIN * 2));
  const panelWidth = Math.min(panelSize.width || maxWidth, maxWidth);
  const panelHeight = Math.min(panelSize.height || 340, viewportHeight - PANEL_MARGIN * 2);

  const candidates: Array<{ left: number; top: number; right: number; bottom: number }> = [];

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

export function OnboardingOverlay({
  open,
  step,
  stepIndex,
  totalSteps,
  isLastStep,
  isSaving,
  error,
  onBack,
  onNext,
  onSkip,
  onRestart,
}: OnboardingOverlayProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [panelSize, setPanelSize] = useState({ width: 360, height: 300 });
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const onExpectedRoute = step ? routeMatches(pathname, step.route) : true;

  const panelPlacement = useMemo(() => {
    if (!open) return null;
    return computePanelPlacement(targetRect, panelSize);
  }, [open, panelSize, targetRect]);

  useEffect(() => {
    if (!open) return;
    if (!step) return;
    if (!onExpectedRoute) {
      setTargetRect(null);
      return;
    }

    let raf = 0;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 60;

    const update = () => {
      if (cancelled) return;
      attempts += 1;

      const primary = getTargetRect(step.targetId);
      if (primary) {
        setTargetRect(primary);
        return;
      }

      if (attempts >= maxAttempts) {
        setTargetRect(getTargetRect('shell-main'));
        return;
      }

      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [onExpectedRoute, open, step]);

  useEffect(() => {
    if (!open || !step) return;
    if (!onExpectedRoute) {
      return;
    }
    const element =
      document.querySelector<HTMLElement>(`[data-tour-id="${step.targetId}"]`) ||
      document.querySelector<HTMLElement>('[data-tour-id="shell-main"]');
    if (!element) return;

    element.scrollIntoView({
      block: 'center',
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  }, [onExpectedRoute, open, shouldReduceMotion, step]);

  useEffect(() => {
    if (!open) return;
    const element = panelRef.current;
    if (!element) return;

    const readSize = () => {
      const rect = element.getBoundingClientRect();
      setPanelSize({
        width: rect.width,
        height: rect.height,
      });
    };

    readSize();
    const observer = new ResizeObserver(readSize);
    observer.observe(element);
    window.addEventListener('resize', readSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', readSize);
    };
  }, [open, step?.key]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      titleRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
  }, [open, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const approved = window.confirm('Skip the tutorial for now? You can restart it any time from the Tutorial button.');
      if (approved) onSkip();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip, open]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';
    body.style.overscrollBehavior = 'none';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [open]);

  if (!open || !step) return null;

  return (
    <div className="fixed inset-0 z-[130]">
      <SpotlightLayer targetRect={targetRect} stepKey={step.key} />
      <div className="pointer-events-none fixed inset-0 z-[131]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            ref={panelRef}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: shouldReduceMotion ? 0.08 : 0.24 }}
            className="pointer-events-auto fixed"
            style={
              panelPlacement
                ? {
                    left: panelPlacement.left,
                    top: panelPlacement.top,
                    maxWidth: panelPlacement.maxWidth,
                  }
                : undefined
            }
          >
            <OnboardingPanel
              step={step}
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              canGoBack={stepIndex > 0}
              isLastStep={isLastStep}
              isSaving={isSaving}
              error={error}
              onBack={onBack}
              onNext={onNext}
              onSkip={onSkip}
              onRestart={onRestart}
              headingRef={titleRef}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
