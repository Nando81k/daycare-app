"use client"

import { useActionState, useCallback, useState } from "react"
import Link from "next/link"
import {
  Baby,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  FileCheck2,
  FileText,
  HeartPulse,
  UserRound,
} from "lucide-react"

import {
  saveEnrollmentApplicationDraft,
  submitEnrollmentApplication,
} from "@/app/actions/parent"
import { initialMutationState } from "@/lib/action-state"
import { createEmptyEnrollmentApplicationDraft } from "@/lib/parent-enrollment"
import type { EnrollmentPricingOptions } from "@/lib/pricing"
import type { ParentEnrollmentApplicationDraft } from "@/types/app"

import { ChildDetailsStep } from "./enrollment/child-details-step"
import { DocumentsStep } from "./enrollment/documents-step"
import { GuardianStep } from "./enrollment/guardian-step"
import { HealthSafetyStep } from "./enrollment/health-safety-step"
import { ProgramScheduleStep } from "./enrollment/program-schedule-step"
import { ReviewStep } from "./enrollment/review-step"
import { TuitionSummaryCard } from "./enrollment/tuition-summary-card"
import { WelcomeStep } from "./enrollment/welcome-step"
import { WizardShell, type WizardStepDef } from "./enrollment/wizard-shell"

const steps: WizardStepDef[] = [
  {
    id: 0,
    label: "Getting started",
    icon: ClipboardList,
    description: "Everything you need to know before you begin.",
  },
  {
    id: 1,
    label: "Child details",
    icon: Baby,
    description: "Tell us about your child so we can prepare the best experience.",
  },
  {
    id: 2,
    label: "Guardian info",
    icon: UserRound,
    description: "Primary guardian contact and emergency contact information.",
  },
  {
    id: 3,
    label: "Program & schedule",
    icon: CalendarDays,
    description: "Choose the right program and schedule for your family.",
  },
  {
    id: 4,
    label: "Health & safety",
    icon: HeartPulse,
    description: "Medical and consent information to keep your child safe.",
  },
  {
    id: 5,
    label: "Documents",
    icon: FileText,
    description: "Required paperwork — upload now or attach later.",
  },
  {
    id: 6,
    label: "Review",
    icon: FileCheck2,
    description: "Confirm everything looks right and submit.",
  },
]

export type ParentEnrollmentWizardProps = {
  pricingOptions: EnrollmentPricingOptions
  initialDraft?: Partial<ParentEnrollmentApplicationDraft>
}

export default function ParentEnrollmentWizard({
  pricingOptions,
  initialDraft,
}: ParentEnrollmentWizardProps) {
  const [draft, setDraft] = useState<ParentEnrollmentApplicationDraft>(() => ({
    ...createEmptyEnrollmentApplicationDraft({
      familyName: initialDraft?.familyName ?? "",
      parentName: initialDraft?.parentName ?? "",
      email: initialDraft?.email ?? "",
      phone: initialDraft?.phone ?? "",
    }),
    ...initialDraft,
  }))

  const updateDraft = useCallback(
    (patch: Partial<ParentEnrollmentApplicationDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }))
    },
    []
  )

  const [saveState, saveDraftAction, isSaving] = useActionState(
    saveEnrollmentApplicationDraft,
    initialMutationState
  )
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitEnrollmentApplication,
    initialMutationState
  )

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= steps.length) return
      setDirection(next > current ? 1 : -1)
      setCurrent(next)
    },
    [current]
  )

  const buildFormData = useCallback(() => {
    const fd = new FormData()
    if (draft.leadId) fd.append("leadId", draft.leadId)
    fd.append("familyName", draft.familyName)
    fd.append("parentName", draft.parentName)
    fd.append("email", draft.email)
    fd.append("phone", draft.phone)
    fd.append("childFirstName", draft.childFirstName)
    fd.append("childLastName", draft.childLastName)
    fd.append("dateOfBirth", draft.dateOfBirth)
    fd.append("childAgeLabel", draft.childAgeLabel)
    fd.append("homeAddress", draft.homeAddress)
    fd.append("preferredStartDate", draft.preferredStartDate)
    fd.append("primaryLanguage", draft.primaryLanguage)
    fd.append("relationshipToChild", draft.relationshipToChild)
    fd.append("emergencyContactName", draft.emergencyContactName)
    fd.append("emergencyContactPhone", draft.emergencyContactPhone)
    fd.append(
      "requestedStart",
      draft.requestedStart || draft.preferredStartDate
    )
    fd.append("programInterest", draft.programInterest)
    fd.append("scheduleNeed", draft.scheduleNeed)
    fd.append("pediatricianName", draft.pediatricianName)
    fd.append("pediatricianPhone", draft.pediatricianPhone)
    fd.append("healthNotes", draft.healthNotes)
    fd.append("note", draft.note)
    fd.append("accepted", String(draft.accepted))
    fd.append(
      "healthChecklist.immunizationRecords",
      String(draft.healthChecklist.immunizationRecords)
    )
    fd.append(
      "healthChecklist.emergencyContacts",
      String(draft.healthChecklist.emergencyContacts)
    )
    fd.append(
      "healthChecklist.authorizedPickups",
      String(draft.healthChecklist.authorizedPickups)
    )
    fd.append(
      "healthChecklist.healthChanges",
      String(draft.healthChecklist.healthChanges)
    )
    fd.append("authorizedPickups", JSON.stringify(draft.authorizedPickups))
    return fd
  }, [draft])

  const handleSaveDraft = useCallback(() => {
    saveDraftAction(buildFormData())
  }, [buildFormData, saveDraftAction])

  const handleSubmit = useCallback(() => {
    submitAction(buildFormData())
  }, [buildFormData, submitAction])

  // Welcome step is rendered standalone so it gets the full hero layout.
  if (current === 0) {
    return (
      <div className="flex w-full flex-col gap-3">
        <BackToBilling />
        <WelcomeStep onBegin={() => goTo(1)} />
      </div>
    )
  }

  const stepContent = (() => {
    switch (current) {
      case 1:
        return <ChildDetailsStep draft={draft} onChange={updateDraft} />
      case 2:
        return <GuardianStep draft={draft} onChange={updateDraft} />
      case 3:
        return (
          <ProgramScheduleStep
            draft={draft}
            onChange={updateDraft}
            options={pricingOptions}
          />
        )
      case 4:
        return <HealthSafetyStep draft={draft} onChange={updateDraft} />
      case 5:
        return <DocumentsStep />
      case 6:
        return (
          <ReviewStep
            draft={draft}
            onChange={updateDraft}
            options={pricingOptions}
            onJumpToStep={goTo}
          />
        )
      default:
        return null
    }
  })()

  const aside =
    current === 3 ? (
      <TuitionSummaryCard
        options={pricingOptions}
        programSlug={draft.programInterest}
        scheduleSlug={draft.scheduleNeed}
        preferredStartDate={draft.preferredStartDate}
      />
    ) : null

  const feedback = (() => {
    if (submitState.error) return { tone: "error" as const, message: submitState.error }
    if (saveState.error) return { tone: "error" as const, message: saveState.error }
    if (submitState.message)
      return { tone: "success" as const, message: submitState.message }
    if (saveState.message)
      return { tone: "success" as const, message: saveState.message }
    return null
  })()

  const canSubmit =
    draft.accepted && draft.healthChecklist.authorizedPickups

  return (
    <div className="flex w-full flex-col gap-3">
      <BackToBilling />
      <WizardShell
        steps={steps}
        current={current}
        direction={direction}
        onGoTo={goTo}
        onNext={() => goTo(current + 1)}
        onBack={() => goTo(current - 1)}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        canSubmit={canSubmit}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        feedback={feedback}
        aside={aside}
      >
        {stepContent}
      </WizardShell>
    </div>
  )
}

function BackToBilling() {
  return (
    <Link
      href="/parent/billing"
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to billing
    </Link>
  )
}
