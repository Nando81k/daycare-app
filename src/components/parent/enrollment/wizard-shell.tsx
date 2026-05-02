"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type WizardStepDef = {
  id: number
  label: string
  icon: LucideIcon
  description?: string
}

export type WizardShellProps = {
  steps: WizardStepDef[]
  current: number
  direction: 1 | -1
  onGoTo: (step: number) => void
  onNext: () => void
  onBack: () => void
  onSaveDraft: () => void
  onSubmit: () => void
  canSubmit: boolean
  isSaving: boolean
  isSubmitting: boolean
  feedback?: { tone: "info" | "success" | "error"; message: string } | null
  /** Sidebar slot — the live tuition card sits here on the program/schedule step. */
  aside?: ReactNode
  children: ReactNode
}

/**
 * Fixed-height wizard shell that hosts each form step.
 * The shell height is constant across steps so layout never jumps;
 * step content scrolls internally when it overflows.
 */
export function WizardShell({
  steps,
  current,
  direction,
  onGoTo,
  onNext,
  onBack,
  onSaveDraft,
  onSubmit,
  canSubmit,
  isSaving,
  isSubmitting,
  feedback,
  aside,
  children,
}: WizardShellProps) {
  const step = steps[current]
  const isLastStep = current === steps.length - 1
  const isPending = isSaving || isSubmitting
  const StepIcon = step.icon

  const completed = current
  const total = steps.length
  const percent = Math.round(((completed + 1) / total) * 100)

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div
          className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Step ${current + 1} of ${total}`}
        >
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-slate-500">
          Step {current + 1} of {total}
        </span>
      </div>

      <div
        className={cn(
          "grid gap-4",
          aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1"
        )}
      >
        <Card className="flex h-[calc(100vh-12rem)] min-h-[600px] flex-col overflow-hidden border-white/60 bg-white/80 shadow-lg shadow-black/[.04] backdrop-blur-md">
          {/* Header — step icon, title, dot nav */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <StepIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {step.label}
                </h2>
                {step.description && (
                  <p className="text-sm text-slate-500">{step.description}</p>
                )}
              </div>
            </div>
            <nav
              aria-label="Enrollment steps"
              className="hidden items-center gap-1.5 sm:flex"
            >
              {steps.map((s, idx) => {
                const isDone = idx < current
                const isActive = idx === current
                const Icon = s.icon
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onGoTo(idx)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-sky-100 text-sky-700 ring-2 ring-sky-200",
                      !isActive && isDone && "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                      !isActive && !isDone && "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    )}
                    aria-label={`${s.label}${isDone ? " (completed)" : isActive ? " (current)" : ""}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Step content — scrollable region with animated transitions */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={cn(
                "mx-5 mb-3 rounded-lg px-4 py-2.5 text-sm",
                feedback.tone === "error" && "bg-red-50 text-red-700",
                feedback.tone === "success" && "bg-emerald-50 text-emerald-700",
                feedback.tone === "info" && "bg-sky-50 text-sky-700"
              )}
            >
              {feedback.message}
            </div>
          )}

          {/* Sticky action footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white/85 px-5 py-3 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
              onClick={onBack}
              disabled={current === 0 || isPending}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveDraft}
                disabled={isPending}
                type="button"
              >
                {isSaving ? "Saving…" : "Save draft"}
              </Button>

              {isLastStep ? (
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                  onClick={onSubmit}
                  disabled={isPending || !canSubmit}
                  type="button"
                >
                  {isSubmitting ? "Submitting…" : "Submit application"}
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5 bg-sky-600 text-white shadow-md hover:bg-sky-700"
                  onClick={onNext}
                  disabled={isPending}
                  type="button"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        {aside && <aside className="lg:sticky lg:top-6 lg:self-start">{aside}</aside>}
      </div>
    </div>
  )
}
