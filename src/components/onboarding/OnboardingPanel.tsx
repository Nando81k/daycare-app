'use client';

import type { Ref } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { OnboardingStep } from '@/lib/onboarding/definitions';

interface OnboardingPanelProps {
  step: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  isLastStep: boolean;
  isSaving: boolean;
  error?: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onRestart: () => void;
  headingRef?: Ref<HTMLHeadingElement>;
}

export function OnboardingPanel({
  step,
  stepIndex,
  totalSteps,
  canGoBack,
  isLastStep,
  isSaving,
  error,
  onBack,
  onNext,
  onSkip,
  onRestart,
  headingRef,
}: OnboardingPanelProps) {
  const progress = ((stepIndex + 1) / Math.max(totalSteps, 1)) * 100;

  return (
    <section className="onboarding-panel relative w-[min(96vw,28rem)] p-4 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <button
        type="button"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        onClick={onSkip}
        aria-label="Skip tutorial"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <p className="kicker">Guided Tutorial</p>
        <p className="mt-1 inline-flex rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800">
          Demo mode with sample data
        </p>
        <h2 id="onboarding-title" ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-semibold text-ink-900">
          {step.title}
        </h2>
      </div>

      <p className="mt-2 text-sm text-ink-700">{step.body}</p>

      <div className="mt-4">
        <div className="onboarding-progress-track">
          <div className="onboarding-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">
          Step {stepIndex + 1} of {totalSteps}
        </p>
      </div>

      {error ? (
        <div className="mt-3 rounded-field border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onRestart} leftIcon={<RotateCcw className="h-4 w-4" />} disabled={isSaving}>
            Restart
          </Button>
          {canGoBack ? (
            <Button variant="outline" size="sm" onClick={onBack} disabled={isSaving}>
              Back
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip} disabled={isSaving}>
            Skip
          </Button>
          <Button size="sm" onClick={onNext} isLoading={isSaving} loadingText="Saving">
            {isLastStep ? 'Finish Tutorial' : step.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
