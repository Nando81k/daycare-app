"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Hand,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { completeStaffOnboarding } from "@/app/actions/staff-onboarding"
import { StepClassroom } from "@/components/staff/onboarding/step-classroom"
import { StepComplete } from "@/components/staff/onboarding/step-complete"
import { StepDocuments } from "@/components/staff/onboarding/step-documents"
import { StepPolicies } from "@/components/staff/onboarding/step-policies"
import { StepProfile } from "@/components/staff/onboarding/step-profile"
import { StepWelcome } from "@/components/staff/onboarding/step-welcome"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { STAFF_POLICY_KEYS } from "@/lib/validators/staff-onboarding"
import type { StaffOnboardingBundle } from "@/lib/dal/staff-onboarding"

type StepDef = {
  id: number
  key: "welcome" | "profile" | "documents" | "policies" | "classroom" | "complete"
  label: string
  icon: typeof Home
  description: string
}

const STEPS: StepDef[] = [
  { id: 0, key: "welcome", label: "Welcome", icon: Hand, description: "What to expect over the next 10 minutes." },
  { id: 1, key: "profile", label: "Profile", icon: UserRound, description: "Phone, photo, emergency contact." },
  { id: 2, key: "documents", label: "Documents", icon: FileText, description: "Upload your required certifications." },
  { id: 3, key: "policies", label: "Policies", icon: ShieldCheck, description: "Acknowledge our staff policies." },
  { id: 4, key: "classroom", label: "Classroom", icon: ClipboardList, description: "Confirm where you'll be teaching." },
  { id: 5, key: "complete", label: "All set", icon: CheckCircle2, description: "Review and head into the portal." },
]

function startingStepFor(currentStep: string): number {
  const found = STEPS.find((step) => step.key === currentStep)
  return found ? found.id : 0
}

export function StaffOnboardingWizard({
  bundle,
  userRole,
}: {
  bundle: StaffOnboardingBundle
  userRole: "ADMIN" | "TEACHER" | "PARENT"
}) {
  const [current, setCurrent] = useState(() =>
    Math.min(startingStepFor(bundle.progress.currentStep), STEPS.length - 1),
  )
  const [isCompleting, startCompleting] = useTransition()

  const profileComplete = Boolean(
    bundle.staffProfile.phone &&
      bundle.staffProfile.emergencyContactName &&
      bundle.staffProfile.emergencyContactPhone,
  )
  const allDocsSubmitted = useMemo(
    () =>
      bundle.documents.length > 0 &&
      bundle.documents.every(
        (doc) => doc.status === "SUBMITTED" || doc.status === "APPROVED",
      ),
    [bundle.documents],
  )
  const allPoliciesSigned = useMemo(
    () => STAFF_POLICY_KEYS.every((key) => Boolean(bundle.acknowledgments[key])),
    [bundle.acknowledgments],
  )

  const stepDoneFlags: Record<StepDef["key"], boolean> = {
    welcome: current > 0,
    profile: profileComplete,
    documents: allDocsSubmitted,
    policies: allPoliciesSigned,
    classroom: profileComplete && allDocsSubmitted && allPoliciesSigned,
    complete: bundle.progress.status === "COMPLETE",
  }

  const completedCount = STEPS.filter((step) => stepDoneFlags[step.key]).length
  const percent = Math.round((completedCount / (STEPS.length - 1)) * 100)

  function goNext() {
    setCurrent((c) => Math.min(c + 1, STEPS.length - 1))
  }

  function goBack() {
    setCurrent((c) => Math.max(c - 1, 0))
  }

  function handleComplete() {
    startCompleting(async () => {
      await completeStaffOnboarding()
    })
  }

  const step = STEPS[current]

  return (
    <div className="bg-secondary/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:px-6 md:py-12">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div
            className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border/60"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${current + 1} of ${STEPS.length}`}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand-yellow transition-[width] duration-300"
              style={{ width: `${Math.max(percent, (current / (STEPS.length - 1)) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            Step {current + 1} of {STEPS.length}
          </span>
        </div>

        {/* Step nav (dots) */}
        <nav aria-label="Onboarding steps" className="hidden flex-wrap gap-2 md:flex">
          {STEPS.map((s) => {
            const isDone = stepDoneFlags[s.key]
            const isActive = s.id === current
            const Icon = s.icon
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setCurrent(s.id)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "bg-navy text-white"
                    : isDone
                      ? "bg-brand-yellow/20 text-navy hover:bg-brand-yellow/30"
                      : "bg-card text-muted-foreground ring-1 ring-border/60 hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
                {isDone && !isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              </button>
            )
          })}
        </nav>

        {/* Step header */}
        <div className="rounded-3xl bg-card p-6 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
            {step.label}
          </p>
          <h1 className="mt-2 font-heading text-2xl leading-tight text-foreground md:text-3xl">
            {step.description}
          </h1>

          <div className="mt-6">
            {step.key === "welcome" ? (
              <StepWelcome
                staffName={bundle.staffProfile.name}
                roleLabel={bundle.staffProfile.roleLabel}
                requiredDocCount={bundle.documents.length}
              />
            ) : null}
            {step.key === "profile" ? (
              <StepProfile bundle={bundle} onSaved={() => setCurrent(2)} />
            ) : null}
            {step.key === "documents" ? (
              <StepDocuments documents={bundle.documents} />
            ) : null}
            {step.key === "policies" ? (
              <StepPolicies acknowledgments={bundle.acknowledgments} />
            ) : null}
            {step.key === "classroom" ? (
              <StepClassroom
                classroom={bundle.staffProfile.classroom}
                userRole={userRole}
              />
            ) : null}
            {step.key === "complete" ? (
              <StepComplete
                profileComplete={profileComplete}
                allDocsSubmitted={allDocsSubmitted}
                allPoliciesSigned={allPoliciesSigned}
                onComplete={handleComplete}
                isCompleting={isCompleting}
              />
            ) : null}
          </div>

          {/* Footer: Back + Continue (Complete step has its own primary CTA) */}
          {step.key !== "complete" ? (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border/60 pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={current === 0}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={goNext}
                className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
              >
                Continue
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
