"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LoaderCircle,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react"

import {
  deleteEnrollmentApplicationDraft,
  saveEnrollmentApplicationDraft,
  submitEnrollmentApplication,
} from "@/app/actions/parent"
import { ParentDocumentUploadCard } from "@/components/parent/parent-document-upload-card"
import { AlertBanner } from "@/components/shared/alert-banner"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageShell } from "@/components/shared/page-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { brandConfig } from "@/config/brand"
import { createEmptyEnrollmentApplicationDraft } from "@/lib/parent-enrollment"
import type {
  MutationActionState,
  ParentEnrollmentApplicationDraft,
  ParentEnrollmentPickupDraft,
  SimpleParentPortalPreview,
  StatusBadgeVariant,
} from "@/types/app"
import { cn } from "@/lib/utils"

const initialActionState: MutationActionState = {
  success: false,
  message: null,
  error: null,
  fieldErrors: {},
  entityId: null,
}

const enrollmentSteps = [
  { id: 1, label: "Child Details", icon: Baby },
  { id: 2, label: "Guardian Info", icon: UserRound },
  { id: 3, label: "Program & Schedule", icon: CalendarDays },
  { id: 4, label: "Health & Safety", icon: HeartPulse },
  { id: 5, label: "Documents & Review", icon: FileText },
] as const

const ageGroupOptions = [
  "Preschool Program",
  "Pre-K Program",
  "Junior Kindergarten",
]

const requestedStartOptions = [
  "April 27, 2026 intake",
  "Next available opening",
  "Within 30 days",
  "Within 60 days",
]

const scheduleOptions = [
  "Monday to Friday · Full day",
  "Monday to Friday · Half day",
  "Custom family schedule",
]

type LocalApplication = {
  id: string
  persistedId?: string
  statusLabel?: string
  statusTone?: StatusBadgeVariant
  submittedAt?: string
  updatedAt: string
  draft: ParentEnrollmentApplicationDraft
}

function buildLocalApplications(data: SimpleParentPortalPreview): LocalApplication[] {
  if (data.applications.length) {
    return data.applications.map((application) => ({
      id: application.id,
      persistedId: application.id,
      statusLabel: application.statusLabel,
      statusTone: application.statusTone,
      submittedAt: application.submittedAt,
      updatedAt: application.updatedAt,
      draft: {
        ...application.draft,
        leadId: application.id,
      },
    }))
  }

  return [
    {
      id: `local-${Date.now()}`,
      updatedAt: "Not started",
      draft: createEmptyEnrollmentApplicationDraft({
        familyName: data.familyName,
        parentName: data.parentName,
        email: data.accountEmail,
        phone: data.phone,
      }),
    },
  ]
}

function getDashboardDataKey(data: SimpleParentPortalPreview) {
  return JSON.stringify({
    familyName: data.familyName,
    parentName: data.parentName,
    phone: data.phone,
    accountEmail: data.accountEmail,
    applications: data.applications.map((application) => ({
      id: application.id,
      updatedAt: application.updatedAt,
      statusLabel: application.statusLabel,
      submittedAt: application.submittedAt,
    })),
    documents: data.documents.map((document) => ({
      id: document.id,
      status: document.status,
    })),
  })
}

function buildApplicationFormData(draft: ParentEnrollmentApplicationDraft) {
  const formData = new FormData()

  formData.set("leadId", draft.leadId ?? "")
  formData.set("familyName", draft.familyName)
  formData.set("parentName", draft.parentName)
  formData.set("email", draft.email)
  formData.set("phone", draft.phone)
  formData.set("childFirstName", draft.childFirstName)
  formData.set("childLastName", draft.childLastName)
  formData.set("dateOfBirth", draft.dateOfBirth)
  formData.set("childAgeLabel", draft.childAgeLabel)
  formData.set("homeAddress", draft.homeAddress)
  formData.set("preferredStartDate", draft.preferredStartDate)
  formData.set("primaryLanguage", draft.primaryLanguage)
  formData.set("relationshipToChild", draft.relationshipToChild)
  formData.set("emergencyContactName", draft.emergencyContactName)
  formData.set("emergencyContactPhone", draft.emergencyContactPhone)
  formData.set("authorizedPickups", JSON.stringify(draft.authorizedPickups))
  formData.set("requestedStart", draft.requestedStart)
  formData.set("programInterest", draft.programInterest)
  formData.set("scheduleNeed", draft.scheduleNeed)
  formData.set("pediatricianName", draft.pediatricianName)
  formData.set("pediatricianPhone", draft.pediatricianPhone)
  formData.set("healthNotes", draft.healthNotes)
  formData.set(
    "healthChecklist.immunizationRecords",
    String(draft.healthChecklist.immunizationRecords)
  )
  formData.set(
    "healthChecklist.emergencyContacts",
    String(draft.healthChecklist.emergencyContacts)
  )
  formData.set(
    "healthChecklist.authorizedPickups",
    String(draft.healthChecklist.authorizedPickups)
  )
  formData.set(
    "healthChecklist.healthChanges",
    String(draft.healthChecklist.healthChanges)
  )
  formData.set("accepted", String(draft.accepted))
  formData.set("note", draft.note)

  return formData
}

function isStepComplete(stepId: number, draft: ParentEnrollmentApplicationDraft, hasRequiredDocuments: boolean) {
  switch (stepId) {
    case 1:
      return Boolean(
        draft.childFirstName &&
          draft.childLastName &&
          draft.dateOfBirth &&
          draft.childAgeLabel &&
          draft.homeAddress &&
          draft.preferredStartDate
      )
    case 2:
      return Boolean(
        draft.parentName &&
          draft.relationshipToChild &&
          draft.email &&
          draft.phone &&
          draft.emergencyContactName &&
          draft.emergencyContactPhone
      )
    case 3:
      return Boolean(draft.programInterest && draft.scheduleNeed && draft.requestedStart)
    case 4:
      return Boolean(
        draft.pediatricianName &&
          draft.pediatricianPhone &&
          draft.healthChecklist.immunizationRecords &&
          draft.healthChecklist.emergencyContacts &&
          draft.healthChecklist.authorizedPickups &&
          draft.healthChecklist.healthChanges
      )
    case 5:
      return draft.accepted && !hasRequiredDocuments
    default:
      return false
  }
}

function getFirstIncompleteStep(draft: ParentEnrollmentApplicationDraft, hasRequiredDocuments: boolean) {
  const firstIncomplete = enrollmentSteps.find(
    (step) => !isStepComplete(step.id, draft, hasRequiredDocuments)
  )

  return firstIncomplete?.id ?? enrollmentSteps.length
}

function getChecklistRows(
  draft: ParentEnrollmentApplicationDraft,
  documents: SimpleParentPortalPreview["documents"]
) {
  const birthCertificateDocument = documents.find((document) =>
    /birth|proof of age/i.test(document.title)
  )
  const immunizationDocument = documents.find((document) =>
    /immunization|medical/i.test(document.title)
  )

  return [
    {
      label: birthCertificateDocument?.title ?? "Birth certificate or proof of age",
      complete: birthCertificateDocument
        ? birthCertificateDocument.status === "approved" || birthCertificateDocument.status === "submitted"
        : Boolean(draft.dateOfBirth),
    },
    {
      label: immunizationDocument?.title ?? "Immunization records",
      complete:
        draft.healthChecklist.immunizationRecords ||
        (immunizationDocument
          ? immunizationDocument.status === "approved" || immunizationDocument.status === "submitted"
          : false),
    },
    {
      label: "Emergency contact information",
      complete: Boolean(draft.emergencyContactName && draft.emergencyContactPhone),
    },
    {
      label: "Authorized pickup contacts",
      complete: draft.authorizedPickups.length > 0 || draft.healthChecklist.authorizedPickups,
    },
    {
      label: "Medical and allergy notes",
      complete: Boolean(draft.healthNotes.trim()),
    },
  ]
}

function getApplicationCardStatus(application: LocalApplication) {
  if (application.persistedId) {
    return {
      label: application.statusLabel ?? "Draft saved",
      tone: application.statusTone ?? "secondary",
    }
  }

  if (application.draft.childFirstName || application.draft.childLastName) {
    return {
      label: "Draft",
      tone: "secondary" as const,
    }
  }

  return {
    label: "Not started",
    tone: "secondary" as const,
  }
}

export function ParentEnrollmentDashboardPageView({
  data,
}: {
  data: SimpleParentPortalPreview
}) {
  const dashboardKey = getDashboardDataKey(data)

  return <ParentEnrollmentDashboardWorkspace key={dashboardKey} data={data} />
}

function ParentEnrollmentDashboardWorkspace({
  data,
}: {
  data: SimpleParentPortalPreview
}) {
  const router = useRouter()
  const hasRequiredDocuments = data.documents.some(
    (document) => document.status === "required"
  )
  const initialApplications = useMemo(() => buildLocalApplications(data), [data])
  const [applications, setApplications] = useState<LocalApplication[]>(initialApplications)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>(
    () => initialApplications[0]?.id ?? ""
  )
  const [currentStep, setCurrentStep] = useState<number>(() =>
    initialApplications[0]
      ? getFirstIncompleteStep(initialApplications[0].draft, hasRequiredDocuments)
      : 1
  )
  const [actionState, setActionState] = useState<MutationActionState>(initialActionState)
  const [isSaving, startSaving] = useTransition()
  const [isSubmitting, startSubmitting] = useTransition()
  const [isDeleting, startDeleting] = useTransition()

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? applications[0],
    [applications, selectedApplicationId]
  )

  const progress = useMemo(() => {
    if (!selectedApplication) {
      return 0
    }

    const completedSteps = enrollmentSteps.filter((step) =>
      isStepComplete(step.id, selectedApplication.draft, hasRequiredDocuments)
    ).length

    return Math.round((completedSteps / enrollmentSteps.length) * 100)
  }, [hasRequiredDocuments, selectedApplication])

  const checklistRows = useMemo(
    () =>
      selectedApplication
        ? getChecklistRows(selectedApplication.draft, data.documents)
        : [],
    [data.documents, selectedApplication]
  )

  function updateSelectedApplication(updater: (draft: ParentEnrollmentApplicationDraft) => ParentEnrollmentApplicationDraft) {
    if (!selectedApplication) {
      return
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              updatedAt: application.persistedId ? "Unsaved changes" : application.updatedAt,
              draft: updater(application.draft),
            }
          : application
      )
    )
  }

  function setDraftField<K extends keyof ParentEnrollmentApplicationDraft>(
    key: K,
    value: ParentEnrollmentApplicationDraft[K]
  ) {
    updateSelectedApplication((draft) => ({
      ...draft,
      [key]: value,
    }))
  }

  function updateHealthChecklist(
    key: keyof ParentEnrollmentApplicationDraft["healthChecklist"],
    value: boolean
  ) {
    updateSelectedApplication((draft) => ({
      ...draft,
      healthChecklist: {
        ...draft.healthChecklist,
        [key]: value,
      },
    }))
  }

  function addPickupContact() {
    updateSelectedApplication((draft) => ({
      ...draft,
      authorizedPickups: [
        ...draft.authorizedPickups,
        {
          id: `pickup-${Date.now()}`,
          name: "",
          relationship: "",
          phone: "",
        },
      ],
    }))
  }

  function updatePickupContact(
    pickupId: string,
    key: keyof ParentEnrollmentPickupDraft,
    value: string
  ) {
    updateSelectedApplication((draft) => ({
      ...draft,
      authorizedPickups: draft.authorizedPickups.map((pickup) =>
        pickup.id === pickupId
          ? {
              ...pickup,
              [key]: value,
            }
          : pickup
      ),
    }))
  }

  function removePickupContact(pickupId: string) {
    updateSelectedApplication((draft) => ({
      ...draft,
      authorizedPickups: draft.authorizedPickups.filter((pickup) => pickup.id !== pickupId),
    }))
  }

  function addApplicationCard() {
    const nextApplication: LocalApplication = {
      id: `local-${Date.now()}`,
      updatedAt: "Not started",
      draft: createEmptyEnrollmentApplicationDraft({
        familyName: data.familyName,
        parentName: data.parentName,
        email: data.accountEmail,
        phone: data.phone,
      }),
    }

    setApplications((current) => [...current, nextApplication])
    setSelectedApplicationId(nextApplication.id)
    setCurrentStep(1)
    setActionState(initialActionState)
  }

  async function handleSave() {
    if (!selectedApplication) {
      return
    }

    const formData = buildApplicationFormData(selectedApplication.draft)

    setActionState(initialActionState)

    const result = await saveEnrollmentApplicationDraft(initialActionState, formData)

    setActionState(result)

    if (!result.success) {
      return
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              id: result.entityId ?? application.id,
              persistedId: result.entityId ?? application.persistedId,
              statusLabel: "Draft saved",
              statusTone: "secondary",
              updatedAt: "Saved just now",
              draft: {
                ...application.draft,
                leadId: result.entityId ?? application.draft.leadId,
              },
            }
          : application
      )
    )

    if (result.entityId) {
      setSelectedApplicationId(result.entityId)
    }

    router.refresh()
  }

  async function handleSubmit() {
    if (!selectedApplication) {
      return
    }

    const formData = buildApplicationFormData(selectedApplication.draft)

    setActionState(initialActionState)

    const result = await submitEnrollmentApplication(initialActionState, formData)

    setActionState(result)

    if (!result.success) {
      return
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === selectedApplication.id
          ? {
              ...application,
              id: result.entityId ?? application.id,
              persistedId: result.entityId ?? application.persistedId,
              statusLabel: "Submitted",
              statusTone: "info",
              updatedAt: "Submitted just now",
              draft: {
                ...application.draft,
                leadId: result.entityId ?? application.draft.leadId,
              },
            }
          : application
      )
    )

    if (result.entityId) {
      setSelectedApplicationId(result.entityId)
    }

    router.refresh()
  }

  async function handleDelete() {
    if (!selectedApplication) {
      return
    }

    if (!selectedApplication.persistedId) {
      const remaining = applications.filter((application) => application.id !== selectedApplication.id)
      const nextApplications =
        remaining.length > 0
          ? remaining
          : buildLocalApplications({
              ...data,
              applications: [],
            })

      setApplications(nextApplications)
      setSelectedApplicationId(nextApplications[0]?.id ?? "")
      setCurrentStep(
        nextApplications[0]
          ? getFirstIncompleteStep(nextApplications[0].draft, hasRequiredDocuments)
          : 1
      )
      setActionState({
        ...initialActionState,
        success: true,
        message: "Application removed.",
      })
      return
    }

    const formData = new FormData()
    formData.set("leadId", selectedApplication.persistedId)

    setActionState(initialActionState)

    const result = await deleteEnrollmentApplicationDraft(initialActionState, formData)

    setActionState(result)

    if (!result.success) {
      return
    }

    const remainingApplications = applications.filter(
      (application) => application.id !== selectedApplication.id
    )
    const fallbackApplications =
      remainingApplications.length > 0
        ? remainingApplications
        : buildLocalApplications({
            ...data,
            applications: [],
          })

    setApplications(fallbackApplications)
    setSelectedApplicationId(fallbackApplications[0]?.id ?? "")
    setCurrentStep(
      fallbackApplications[0]
        ? getFirstIncompleteStep(fallbackApplications[0].draft, hasRequiredDocuments)
        : 1
    )
    router.refresh()
  }

  if (!selectedApplication) {
    return null
  }

  const selectedStatus = getApplicationCardStatus(selectedApplication)
  const canDeleteSelected =
    !selectedApplication.persistedId ||
    (selectedStatus.label !== "Submitted" && selectedStatus.label !== "Approved")

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.35),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(204,251,241,0.30),transparent_20%),linear-gradient(to_bottom,#f8fcff,#ffffff,#f3fbf9)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-sm text-slate-600 shadow-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-sky-600" />
                Parent enrollment dashboard
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Enroll your child with clarity and confidence
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Complete your Ambassadors Care application step by step, keep documents together,
                and move from draft to submission without getting lost in the portal.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-200 bg-white px-5"
                disabled={isSaving || isSubmitting || isDeleting}
                onClick={() => startSaving(() => void handleSave())}
              >
                {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Draft
              </Button>
              <Button
                type="button"
                className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
                disabled={isSaving || isSubmitting || isDeleting}
                onClick={() =>
                  setCurrentStep((step) =>
                    step < enrollmentSteps.length
                      ? step + 1
                      : getFirstIncompleteStep(selectedApplication.draft, hasRequiredDocuments)
                  )
                }
              >
                Continue Application
              </Button>
            </div>
          </header>

          {actionState.error ? (
            <AlertBanner
              tone="destructive"
              title="We could not update the application"
              description={actionState.error}
            />
          ) : null}
          {actionState.success && actionState.message ? (
            <AlertBanner tone="success" title="Updated" description={actionState.message} />
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="space-y-6">
              <Card className="rounded-[1.75rem] border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Application progress</CardTitle>
                  <CardDescription>Track each step as you complete your child&apos;s enrollment.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-600">{progress}% completed</span>
                    <Badge variant="info" className="rounded-full">
                      Step {currentStep} of {enrollmentSteps.length}
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2 bg-slate-100" />

                  <div className="mt-6 space-y-3">
                    {enrollmentSteps.map((step) => {
                      const Icon = step.icon
                      const active = currentStep === step.id
                      const complete = isStepComplete(step.id, selectedApplication.draft, hasRequiredDocuments)

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setCurrentStep(step.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? "border-sky-200 bg-sky-50 shadow-sm"
                              : complete
                                ? "border-teal-100 bg-teal-50/60"
                                : "border-slate-100 bg-white hover:bg-slate-50"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-2xl",
                              complete
                                ? "bg-teal-600 text-white"
                                : active
                                  ? "bg-sky-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                            <p className="text-xs text-slate-500">
                              {complete ? "Completed" : active ? "In progress" : "Not started"}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-sky-100/80 via-white to-teal-100/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Applications on this account</CardTitle>
                  <CardDescription>Add and manage each child&apos;s enrollment in one place.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {applications.map((application) => {
                    const status = getApplicationCardStatus(application)
                    const isSelected = application.id === selectedApplication.id
                    const childName =
                      [application.draft.childFirstName, application.draft.childLastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim() || "New child application"

                    return (
                      <button
                        key={application.id}
                        type="button"
                        onClick={() => {
                          setSelectedApplicationId(application.id)
                          setCurrentStep(getFirstIncompleteStep(application.draft, hasRequiredDocuments))
                          setActionState(initialActionState)
                        }}
                        className={cn(
                          "w-full rounded-2xl border bg-white/85 p-4 text-left shadow-sm transition",
                          isSelected
                            ? "border-sky-200 ring-2 ring-sky-100"
                            : "border-white/70 hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{childName}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {application.draft.programInterest || application.draft.childAgeLabel || "Application not started"}
                            </p>
                          </div>
                          <StatusBadge variant={status.tone}>{status.label}</StatusBadge>
                        </div>
                      </button>
                    )
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-2xl border-dashed border-slate-300 bg-white/70 py-6 text-slate-700"
                    onClick={addApplicationCard}
                  >
                    + Add another child
                  </Button>
                </CardContent>
              </Card>
            </aside>

            <section className="space-y-6">
              <Card className="rounded-[1.75rem] border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">{enrollmentSteps[currentStep - 1]?.label}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-6">
                        Complete this section to keep the Ambassadors Care enrollment moving smoothly.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={selectedStatus.tone}>{selectedStatus.label}</StatusBadge>
                      {selectedApplication.persistedId ? (
                        <span className="text-xs font-medium text-slate-500">
                          Updated {selectedApplication.updatedAt}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  {currentStep === 1 ? (
                    <ChildDetailsStep
                      draft={selectedApplication.draft}
                      fieldErrors={actionState.fieldErrors}
                      onFieldChange={setDraftField}
                    />
                  ) : null}

                  {currentStep === 2 ? (
                    <GuardianStep
                      draft={selectedApplication.draft}
                      fieldErrors={actionState.fieldErrors}
                      onFieldChange={setDraftField}
                      onPickupAdd={addPickupContact}
                      onPickupChange={updatePickupContact}
                      onPickupRemove={removePickupContact}
                    />
                  ) : null}

                  {currentStep === 3 ? (
                    <ProgramStep
                      draft={selectedApplication.draft}
                      fieldErrors={actionState.fieldErrors}
                      onFieldChange={setDraftField}
                    />
                  ) : null}

                  {currentStep === 4 ? (
                    <HealthStep
                      draft={selectedApplication.draft}
                      onFieldChange={setDraftField}
                      onChecklistChange={updateHealthChecklist}
                    />
                  ) : null}

                  {currentStep === 5 ? (
                    <DocumentsStep
                      draft={selectedApplication.draft}
                      documents={data.documents}
                      fieldErrors={actionState.fieldErrors}
                      onAcceptedChange={(accepted) => setDraftField("accepted", accepted)}
                    />
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-200 bg-white px-6"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-200 bg-white px-6 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        disabled={!canDeleteSelected || isDeleting || isSaving || isSubmitting}
                        onClick={() => startDeleting(() => void handleDelete())}
                      >
                        {isDeleting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full border-slate-200 bg-white px-6"
                        disabled={isSaving || isSubmitting || isDeleting}
                        onClick={() => startSaving(() => void handleSave())}
                      >
                        {isSaving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save for Later
                      </Button>
                      {currentStep === enrollmentSteps.length ? (
                        <Button
                          type="button"
                          className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800"
                          disabled={isSaving || isSubmitting || isDeleting}
                          onClick={() => startSubmitting(() => void handleSubmit())}
                        >
                          {isSubmitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Submit Enrollment
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800"
                          onClick={() => setCurrentStep((step) => Math.min(enrollmentSteps.length, step + 1))}
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-6">
              <Card className="rounded-[1.75rem] border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Enrollment summary</CardTitle>
                  <CardDescription>A quick view of the details families usually want to double-check.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SummaryRow
                    label="Child"
                    value={
                      [selectedApplication.draft.childFirstName, selectedApplication.draft.childLastName]
                        .filter(Boolean)
                        .join(" ") || "Not entered"
                    }
                  />
                  <SummaryRow
                    label="Program"
                    value={selectedApplication.draft.programInterest || "Not selected"}
                  />
                  <SummaryRow
                    label="Schedule"
                    value={selectedApplication.draft.scheduleNeed || "Not selected"}
                  />
                  <SummaryRow
                    label="Preferred start"
                    value={
                      selectedApplication.draft.preferredStartDate ||
                      selectedApplication.draft.requestedStart ||
                      "Not selected"
                    }
                  />
                  <SummaryRow
                    label="Status"
                    value={selectedStatus.label}
                    valueTone={
                      selectedStatus.tone === "success"
                        ? "text-emerald-700"
                        : selectedStatus.tone === "warning"
                          ? "text-amber-700"
                          : selectedStatus.tone === "info"
                            ? "text-sky-700"
                            : "text-slate-700"
                    }
                  />
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Required checklist</CardTitle>
                  <CardDescription>Use one parent-facing list to make the next action obvious.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checklistRows.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                    >
                      <div className={cn("mt-0.5 h-2.5 w-2.5 rounded-full", item.complete ? "bg-teal-500" : "bg-slate-300")} />
                      <p className="text-sm leading-6 text-slate-700">{item.label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[1.75rem] border-white/70 bg-gradient-to-br from-sky-100/80 via-white to-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Need help?</CardTitle>
                  <CardDescription>Keep admissions support visible so families can keep moving.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">Enrollment support</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Need help with documents, child applications, or program choice? The Ambassadors Care team can help.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white/85 px-4 py-3 text-sm leading-6 text-slate-700">
                    {brandConfig.phone}
                  </div>
                  <Button asChild variant="outline" className="w-full rounded-full border-slate-200 bg-white">
                    <Link href="/contact">Contact Admissions</Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </div>
    </PageShell>
  )
}

function ChildDetailsStep({
  draft,
  fieldErrors,
  onFieldChange,
}: {
  draft: ParentEnrollmentApplicationDraft
  fieldErrors: Record<string, string>
  onFieldChange: <K extends keyof ParentEnrollmentApplicationDraft>(
    key: K,
    value: ParentEnrollmentApplicationDraft[K]
  ) => void
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Child first name"
          value={draft.childFirstName}
          error={fieldErrors.childFirstName}
          placeholder="Ava"
          onChange={(value) => onFieldChange("childFirstName", value)}
        />
        <Field
          label="Child last name"
          value={draft.childLastName}
          error={fieldErrors.childLastName}
          placeholder="Johnson"
          onChange={(value) => onFieldChange("childLastName", value)}
        />
        <Field
          label="Date of birth"
          value={draft.dateOfBirth}
          type="date"
          onChange={(value) => onFieldChange("dateOfBirth", value)}
        />
        <div className="space-y-2">
          <Label>Child age group</Label>
          <Select value={draft.childAgeLabel} onValueChange={(value) => onFieldChange("childAgeLabel", value)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroupOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.childAgeLabel ? <FieldError>{fieldErrors.childAgeLabel}</FieldError> : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Home address</Label>
          <Input
            className="h-12 rounded-2xl border-slate-200 bg-white"
            placeholder="5 Engineering Street off Textile Mill Road, Benin City"
            value={draft.homeAddress}
            onChange={(event) => onFieldChange("homeAddress", event.target.value)}
          />
        </div>
        <Field
          label="Preferred start date"
          value={draft.preferredStartDate}
          type="date"
          onChange={(value) => onFieldChange("preferredStartDate", value)}
        />
        <Field
          label="Primary language"
          value={draft.primaryLanguage}
          placeholder="English"
          onChange={(value) => onFieldChange("primaryLanguage", value)}
        />
      </div>

      <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
        <div className="flex items-start gap-3">
          <Home className="mt-1 h-5 w-5 text-sky-700" />
          <div>
            <p className="font-semibold text-slate-900">Parent-friendly tip</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Keep the first step approachable. Once the child details are in place, the rest of the dashboard feels much easier to complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GuardianStep({
  draft,
  fieldErrors,
  onFieldChange,
  onPickupAdd,
  onPickupChange,
  onPickupRemove,
}: {
  draft: ParentEnrollmentApplicationDraft
  fieldErrors: Record<string, string>
  onFieldChange: <K extends keyof ParentEnrollmentApplicationDraft>(
    key: K,
    value: ParentEnrollmentApplicationDraft[K]
  ) => void
  onPickupAdd: () => void
  onPickupChange: (pickupId: string, key: keyof ParentEnrollmentPickupDraft, value: string) => void
  onPickupRemove: (pickupId: string) => void
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Primary guardian full name"
          value={draft.parentName}
          error={fieldErrors.parentName}
          placeholder="Jordan Johnson"
          onChange={(value) => onFieldChange("parentName", value)}
        />
        <Field
          label="Relationship to child"
          value={draft.relationshipToChild}
          placeholder="Mother, father, guardian"
          onChange={(value) => onFieldChange("relationshipToChild", value)}
        />
        <Field
          label="Email address"
          value={draft.email}
          error={fieldErrors.email}
          type="email"
          placeholder="family@email.com"
          onChange={(value) => onFieldChange("email", value)}
        />
        <Field
          label="Phone number"
          value={draft.phone}
          error={fieldErrors.phone}
          type="tel"
          placeholder="0807 167 1289"
          onChange={(value) => onFieldChange("phone", value)}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Emergency contact name"
          value={draft.emergencyContactName}
          error={fieldErrors.emergencyContactName}
          placeholder="Taylor Johnson"
          onChange={(value) => onFieldChange("emergencyContactName", value)}
        />
        <Field
          label="Emergency contact phone"
          value={draft.emergencyContactPhone}
          error={fieldErrors.emergencyContactPhone}
          type="tel"
          placeholder="0802 908 8818"
          onChange={(value) => onFieldChange("emergencyContactPhone", value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label>Authorized pickup contacts</Label>
          <Button type="button" variant="outline" className="rounded-full border-slate-200 bg-white" onClick={onPickupAdd}>
            + Add contact
          </Button>
        </div>

        {draft.authorizedPickups.length ? (
          <div className="grid gap-4">
            {draft.authorizedPickups.map((pickup) => (
              <div key={pickup.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Pickup contact</p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto rounded-full px-3 py-1 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => onPickupRemove(pickup.id)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field
                    label="Name"
                    value={pickup.name}
                    placeholder="Jordan Johnson"
                    onChange={(value) => onPickupChange(pickup.id, "name", value)}
                  />
                  <Field
                    label="Relationship"
                    value={pickup.relationship}
                    placeholder="Parent"
                    onChange={(value) => onPickupChange(pickup.id, "relationship", value)}
                  />
                  <Field
                    label="Phone"
                    value={pickup.phone}
                    type="tel"
                    placeholder="0807 167 1289"
                    onChange={(value) => onPickupChange(pickup.id, "phone", value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
            Add at least one pickup contact so dismissal details stay clear.
          </div>
        )}
      </div>
    </div>
  )
}

function ProgramStep({
  draft,
  fieldErrors,
  onFieldChange,
}: {
  draft: ParentEnrollmentApplicationDraft
  fieldErrors: Record<string, string>
  onFieldChange: <K extends keyof ParentEnrollmentApplicationDraft>(
    key: K,
    value: ParentEnrollmentApplicationDraft[K]
  ) => void
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            title: "Preschool Program",
            details: "A steady start with guided play, routine, and early learning.",
          },
          {
            title: "Pre-K Program",
            details: "Confidence-building classroom structure and school-readiness support.",
          },
          {
            title: "Junior Kindergarten",
            details: "A stronger bridge into the next learning stage with quality care.",
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => onFieldChange("programInterest", item.title)}
            className={cn(
              "rounded-[1.5rem] border p-5 text-left shadow-sm transition",
              draft.programInterest === item.title
                ? "border-sky-200 bg-sky-50"
                : "border-slate-100 bg-white hover:bg-slate-50"
            )}
          >
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.details}</p>
          </button>
        ))}
      </div>
      {fieldErrors.programInterest ? <FieldError>{fieldErrors.programInterest}</FieldError> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Schedule preference</Label>
          <Select value={draft.scheduleNeed} onValueChange={(value) => onFieldChange("scheduleNeed", value)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
              <SelectValue placeholder="Choose a schedule" />
            </SelectTrigger>
            <SelectContent>
              {scheduleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.scheduleNeed ? <FieldError>{fieldErrors.scheduleNeed}</FieldError> : null}
        </div>

        <div className="space-y-2">
          <Label>Requested start</Label>
          <Select value={draft.requestedStart} onValueChange={(value) => onFieldChange("requestedStart", value)}>
            <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white">
              <SelectValue placeholder="Choose a timeframe" />
            </SelectTrigger>
            <SelectContent>
              {requestedStartOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.requestedStart ? <FieldError>{fieldErrors.requestedStart}</FieldError> : null}
        </div>
      </div>
    </div>
  )
}

function HealthStep({
  draft,
  onFieldChange,
  onChecklistChange,
}: {
  draft: ParentEnrollmentApplicationDraft
  onFieldChange: <K extends keyof ParentEnrollmentApplicationDraft>(
    key: K,
    value: ParentEnrollmentApplicationDraft[K]
  ) => void
  onChecklistChange: (
    key: keyof ParentEnrollmentApplicationDraft["healthChecklist"],
    value: boolean
  ) => void
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Pediatrician name"
          value={draft.pediatricianName}
          placeholder="Dr. Williams"
          onChange={(value) => onFieldChange("pediatricianName", value)}
        />
        <Field
          label="Pediatrician phone"
          value={draft.pediatricianPhone}
          type="tel"
          placeholder="0802 908 8818"
          onChange={(value) => onFieldChange("pediatricianPhone", value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Allergies, medical notes, or dietary restrictions</Label>
        <Textarea
          className="min-h-[120px] rounded-[1.5rem] border-slate-200 bg-white"
          placeholder="Share allergies, medications, or important care instructions."
          value={draft.healthNotes}
          onChange={(event) => onFieldChange("healthNotes", event.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Health and safety checklist</Label>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              key: "immunizationRecords",
              label: "I confirm immunization records will be uploaded.",
            },
            {
              key: "emergencyContacts",
              label: "I confirm emergency contacts are current.",
            },
            {
              key: "authorizedPickups",
              label: "I confirm authorized pickup contacts are accurate.",
            },
            {
              key: "healthChanges",
              label: "I will notify the center of health changes promptly.",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
              <Checkbox
                className="mt-1"
                checked={draft.healthChecklist[item.key as keyof typeof draft.healthChecklist]}
                onCheckedChange={(checked) => onChecklistChange(item.key as keyof typeof draft.healthChecklist, checked === true)}
              />
              <p className="text-sm leading-6 text-slate-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DocumentsStep({
  draft,
  documents,
  fieldErrors,
  onAcceptedChange,
}: {
  draft: ParentEnrollmentApplicationDraft
  documents: SimpleParentPortalPreview["documents"]
  fieldErrors: Record<string, string>
  onAcceptedChange: (value: boolean) => void
}) {
  return (
    <div className="space-y-8">
      {documents.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <ParentDocumentUploadCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <Card className="rounded-[1.5rem] border-slate-100 bg-slate-50/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Upload className="mt-1 h-5 w-5 text-sky-700" />
              <div>
                <p className="font-semibold text-slate-900">Documents will appear here when requested</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  The admissions team has not requested uploads on this account yet. You can still review and submit the application today.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[1.5rem] border-sky-100 bg-sky-50/70 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-1 h-5 w-5 text-sky-700" />
            <div>
              <p className="font-semibold text-slate-900">Review before submitting</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Take a final pass through the child details, guardian information, program choice, and requested documents before sending the application to admissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-[1.5rem] border border-slate-100 bg-white px-5 py-4">
        <Checkbox
          checked={draft.accepted}
          onCheckedChange={(checked) => onAcceptedChange(checked === true)}
          className="mt-1"
        />
        <div>
          <p className="font-medium text-slate-900">I confirm the information provided is accurate.</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            By submitting, I understand Ambassadors Care may contact me about next steps, required documents, and program availability.
          </p>
          {fieldErrors.accepted ? <FieldError>{fieldErrors.accepted}</FieldError> : null}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  error?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border-slate-200 bg-white"
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-destructive">{children}</p>
}

function SummaryRow({
  label,
  value,
  valueTone = "text-slate-900",
}: {
  label: string
  value: string
  valueTone?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn("text-right text-sm font-semibold", valueTone)}>{value}</span>
    </div>
  )
}
