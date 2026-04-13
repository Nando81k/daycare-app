"use client"

import { useState, useCallback, useMemo, useActionState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowRight,
  Baby,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import type { ParentEnrollmentApplicationDraft } from "@/types/app"
import { createEmptyEnrollmentApplicationDraft } from "@/lib/parent-enrollment"
import { initialMutationState } from "@/lib/action-state"
import {
  saveEnrollmentApplicationDraft,
  submitEnrollmentApplication,
} from "@/app/actions/parent"

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface StepDef {
  id: number
  label: string
  icon: React.ElementType
}

const steps: StepDef[] = [
  { id: 0, label: "Getting Started", icon: ClipboardList },
  { id: 1, label: "Child Details", icon: Baby },
  { id: 2, label: "Guardian Info", icon: UserRound },
  { id: 3, label: "Program & Schedule", icon: CalendarDays },
  { id: 4, label: "Health & Safety", icon: HeartPulse },
  { id: 5, label: "Documents & Review", icon: FileText },
]

const formSteps = steps.slice(1)

const requiredItems = [
  "Birth certificate or proof of age",
  "Immunization records (up-to-date)",
  "Two forms of guardian ID",
  "Emergency contact information",
  "Physician / pediatrician info",
  "Signed enrollment agreement",
]

const checklist = [
  "Birth certificate or proof of age",
  "Up-to-date immunization records",
  "Two forms of guardian ID",
  "Emergency contact information",
  "Physician / pediatrician info",
  "Signed enrollment agreement",
]

const highlights = [
  {
    icon: Clock3,
    title: "10-minute application",
    text: "A simple guided flow with progress saved automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Secure submission",
    text: "Your family information stays protected throughout the process.",
  },
  {
    icon: BadgeCheck,
    title: "Easy to complete",
    text: "Clear steps, friendly language, and a full review before submit.",
  },
]

const stepDescriptions: Record<number, string> = {
  0: "Everything you need to know before you begin.",
  1: "Tell us about your child so we can prepare the best experience.",
  2: "We need a primary guardian’s contact information and an emergency contact.",
  3: "Choose the right program and schedule for your family.",
  4: "Help us keep your child safe with medical and consent information.",
  5: "Review everything and upload required documents to complete enrollment.",
}

type StepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  )
}

const fieldClasses =
  "rounded-xl border-slate-200 bg-white/90 shadow-sm focus-visible:ring-sky-400"

/* ------------------------------------------------------------------ */
/*  Step 1 – Child Details                                             */
/* ------------------------------------------------------------------ */

function ChildDetailsStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First Name" htmlFor="child-first">
          <Input
            id="child-first"
            placeholder="e.g. Emma"
            className={fieldClasses}
            value={draft.childFirstName}
            onChange={(e) => onChange({ childFirstName: e.target.value })}
          />
        </Field>
        <Field label="Last Name" htmlFor="child-last">
          <Input
            id="child-last"
            placeholder="e.g. Rivera"
            className={fieldClasses}
            value={draft.childLastName}
            onChange={(e) => onChange({ childLastName: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date of Birth" htmlFor="child-dob">
          <Input
            id="child-dob"
            type="date"
            className={fieldClasses}
            value={draft.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
          />
        </Field>
        <Field label="Gender" htmlFor="child-gender">
          <Select
            value={draft.childAgeLabel}
            onValueChange={(v) => onChange({ childAgeLabel: v })}
          >
            <SelectTrigger id="child-gender" className={fieldClasses}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Allergies / Dietary Needs" htmlFor="allergies">
        <Textarea
          id="allergies"
          placeholder="List any allergies, dietary restrictions, or food sensitivities…"
          className={fieldClasses}
          value={draft.healthNotes}
          onChange={(e) => onChange({ healthNotes: e.target.value })}
        />
      </Field>

      <Field label="Primary Language" htmlFor="language">
        <Input
          id="language"
          placeholder="e.g. English, Spanish"
          className={fieldClasses}
          value={draft.primaryLanguage}
          onChange={(e) => onChange({ primaryLanguage: e.target.value })}
        />
      </Field>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2 – Guardian Info                                             */
/* ------------------------------------------------------------------ */

function GuardianInfoStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Guardian Full Name" htmlFor="guardian-name">
          <Input
            id="guardian-name"
            placeholder="e.g. Sofia Rivera"
            className={fieldClasses}
            value={draft.parentName}
            onChange={(e) => onChange({ parentName: e.target.value })}
          />
        </Field>
        <Field label="Relationship to Child" htmlFor="guardian-relationship">
          <Select
            value={draft.relationshipToChild}
            onValueChange={(v) => onChange({ relationshipToChild: v })}
          >
            <SelectTrigger
              id="guardian-relationship"
              className={fieldClasses}
            >
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="legal-guardian">Legal Guardian</SelectItem>
              <SelectItem value="grandparent">Grandparent</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email Address" htmlFor="guardian-email">
          <Input
            id="guardian-email"
            type="email"
            placeholder="sofia@example.com"
            className={fieldClasses}
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
        <Field label="Phone Number" htmlFor="guardian-phone">
          <Input
            id="guardian-phone"
            type="tel"
            placeholder="(555) 123-4567"
            className={fieldClasses}
            value={draft.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Home Address" htmlFor="guardian-address">
        <Textarea
          id="guardian-address"
          placeholder="Street address, city, state, ZIP"
          className={fieldClasses}
          value={draft.homeAddress}
          onChange={(e) => onChange({ homeAddress: e.target.value })}
        />
      </Field>

      <Separator className="my-2" />

      <p className="text-sm font-semibold text-slate-700">
        Emergency Contact
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact Name" htmlFor="emergency-name">
          <Input
            id="emergency-name"
            placeholder="e.g. Maria Rivera"
            className={fieldClasses}
            value={draft.emergencyContactName}
            onChange={(e) =>
              onChange({ emergencyContactName: e.target.value })
            }
          />
        </Field>
        <Field label="Contact Phone" htmlFor="emergency-phone">
          <Input
            id="emergency-phone"
            type="tel"
            placeholder="(555) 987-6543"
            className={fieldClasses}
            value={draft.emergencyContactPhone}
            onChange={(e) =>
              onChange({ emergencyContactPhone: e.target.value })
            }
          />
        </Field>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3 – Program & Schedule                                        */
/* ------------------------------------------------------------------ */

function ProgramScheduleStep({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <Field label="Program" htmlFor="program">
        <Select
          value={draft.programInterest}
          onValueChange={(v) => onChange({ programInterest: v })}
        >
          <SelectTrigger id="program" className={fieldClasses}>
            <SelectValue placeholder="Choose a program…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="infant">Infant Care (6 wk – 12 mo)</SelectItem>
            <SelectItem value="toddler">
              Toddler Program (1 – 2 yr)
            </SelectItem>
            <SelectItem value="preschool">Preschool (3 – 4 yr)</SelectItem>
            <SelectItem value="pre-k">Pre-K (4 – 5 yr)</SelectItem>
            <SelectItem value="school-age">
              School-Age (5 – 12 yr)
            </SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Schedule" htmlFor="schedule">
        <Select
          value={draft.scheduleNeed}
          onValueChange={(v) => onChange({ scheduleNeed: v })}
        >
          <SelectTrigger id="schedule" className={fieldClasses}>
            <SelectValue placeholder="Choose a schedule…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">
              Full-time (Mon – Fri)
            </SelectItem>
            <SelectItem value="part-time-mwf">
              Part-time (Mon / Wed / Fri)
            </SelectItem>
            <SelectItem value="part-time-tth">
              Part-time (Tue / Thu)
            </SelectItem>
            <SelectItem value="before-after">Before &amp; After School</SelectItem>
            <SelectItem value="drop-in">Drop-in</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Desired Start Date" htmlFor="start-date">
        <Input
          id="start-date"
          type="date"
          className={fieldClasses}
          value={draft.preferredStartDate}
          onChange={(e) =>
            onChange({
              preferredStartDate: e.target.value,
              requestedStart: e.target.value,
            })
          }
        />
      </Field>

      <Field label="Schedule Notes" htmlFor="schedule-notes">
        <Textarea
          id="schedule-notes"
          placeholder="Any special schedule requests or notes…"
          className={fieldClasses}
          value={draft.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </Field>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 4 – Health & Safety                                           */
/* ------------------------------------------------------------------ */

function HealthSafetyStep({ draft, onChange }: StepProps) {
  function updateChecklist(
    key: keyof typeof draft.healthChecklist,
    checked: boolean
  ) {
    onChange({
      healthChecklist: { ...draft.healthChecklist, [key]: checked },
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pediatrician Name" htmlFor="pediatrician">
          <Input
            id="pediatrician"
            placeholder="e.g. Dr. Chen"
            className={fieldClasses}
            value={draft.pediatricianName}
            onChange={(e) => onChange({ pediatricianName: e.target.value })}
          />
        </Field>
        <Field label="Pediatrician Phone" htmlFor="ped-phone">
          <Input
            id="ped-phone"
            type="tel"
            placeholder="(555) 111-2222"
            className={fieldClasses}
            value={draft.pediatricianPhone}
            onChange={(e) =>
              onChange({ pediatricianPhone: e.target.value })
            }
          />
        </Field>
      </div>

      <Field label="Medical Conditions" htmlFor="medical">
        <Textarea
          id="medical"
          placeholder="Asthma, diabetes, seizure disorders, etc."
          className={fieldClasses}
          value={draft.healthNotes}
          onChange={(e) => onChange({ healthNotes: e.target.value })}
        />
      </Field>

      <Separator className="my-2" />

      <p className="text-sm font-semibold text-slate-700">
        Consent &amp; Authorization
      </p>
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.healthChecklist.immunizationRecords}
            onCheckedChange={(c) =>
              updateChecklist("immunizationRecords", c === true)
            }
          />
          I authorize the administration of basic first aid
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.healthChecklist.emergencyContacts}
            onCheckedChange={(c) =>
              updateChecklist("emergencyContacts", c === true)
            }
          />
          I authorize the use of sunscreen and insect repellent
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.healthChecklist.healthChanges}
            onCheckedChange={(c) =>
              updateChecklist("healthChanges", c === true)
            }
          />
          Immunization records are up to date
        </label>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 5 – Documents & Review                                        */
/* ------------------------------------------------------------------ */

function DocumentsReviewStep({ draft, onChange }: StepProps) {
  const childName =
    [draft.childFirstName, draft.childLastName].filter(Boolean).join(" ") ||
    "—"

  const scheduleLabels: Record<string, string> = {
    "full-time": "Full-time (Mon – Fri)",
    "part-time-mwf": "Part-time (Mon / Wed / Fri)",
    "part-time-tth": "Part-time (Tue / Thu)",
    "before-after": "Before & After School",
    "drop-in": "Drop-in",
  }

  const programLabels: Record<string, string> = {
    infant: "Infant Care",
    toddler: "Toddler Program",
    preschool: "Preschool",
    "pre-k": "Pre-K",
    "school-age": "School-Age",
  }

  return (
    <div className="space-y-6">
      {/* Application Summary */}
      <Card className="border-emerald-100 bg-emerald-50/50">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold text-emerald-800">
            Application Summary
          </p>
          <SummaryRow label="Child" value={childName} />
          <SummaryRow
            label="Date of Birth"
            value={draft.dateOfBirth || "—"}
          />
          <SummaryRow
            label="Program"
            value={programLabels[draft.programInterest] || "—"}
          />
          <SummaryRow
            label="Schedule"
            value={scheduleLabels[draft.scheduleNeed] || "—"}
          />
          <SummaryRow
            label="Start Date"
            value={draft.preferredStartDate || "—"}
          />
          <Separator />
          <SummaryRow
            label="Guardian"
            value={draft.parentName || "—"}
          />
          <SummaryRow label="Phone" value={draft.phone || "—"} />
          <SummaryRow
            label="Pediatrician"
            value={draft.pediatricianName || "—"}
          />
        </CardContent>
      </Card>

      {/* Required Documents */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Required Documents
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {requiredItems.map((item) => (
            <label
              key={item}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white/60 p-3 text-sm text-slate-600"
            >
              <Checkbox />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Upload Area */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Upload Documents
        </p>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center">
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="text-xs text-slate-400">
            PDF, JPG, PNG up to 10 MB each
          </p>
          <Button variant="outline" size="sm" className="mt-1">
            Browse Files
          </Button>
        </div>
      </div>

      {/* Certifications */}
      <Separator />
      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.accepted}
            onCheckedChange={(c) => onChange({ accepted: c === true })}
          />
          I certify that the information provided is true and accurate to the
          best of my knowledge.
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-600">
          <Checkbox
            checked={draft.healthChecklist.authorizedPickups}
            onCheckedChange={(c) =>
              onChange({
                healthChecklist: {
                  ...draft.healthChecklist,
                  authorizedPickups: c === true,
                },
              })
            }
          />
          I have read and agree to the daycare&apos;s policies, including
          pickup authorization, health protocols, and tuition terms.
        </label>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Wizard                                                        */
/* ------------------------------------------------------------------ */

export default function ParentEnrollmentWizard() {
  /* ---- Draft state ---- */
  const [draft, setDraft] = useState<ParentEnrollmentApplicationDraft>(() =>
    createEmptyEnrollmentApplicationDraft({
      familyName: "",
      parentName: "",
      email: "",
      phone: "",
    })
  )

  const updateDraft = useCallback(
    (patch: Partial<ParentEnrollmentApplicationDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }))
    },
    []
  )

  /* ---- Server actions ---- */
  const [saveState, saveDraftAction, isSaving] = useActionState(
    saveEnrollmentApplicationDraft,
    initialMutationState
  )
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitEnrollmentApplication,
    initialMutationState
  )

  const isPending = isSaving || isSubmitting

  /* ---- Step navigation ---- */
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= steps.length) return
      setDirection(next > current ? 1 : -1)
      setCurrent(next)
    },
    [current]
  )

  /* ---- Build FormData from draft ---- */
  function buildFormData(): FormData {
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
    fd.append("requestedStart", draft.requestedStart)
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
    fd.append(
      "authorizedPickups",
      JSON.stringify(draft.authorizedPickups)
    )
    return fd
  }

  function handleSaveDraft() {
    saveDraftAction(buildFormData())
  }

  function handleSubmit() {
    submitAction(buildFormData())
  }

  /* ---- Step content ---- */
  const stepContent: Record<number, React.ReactNode> = {
    1: <ChildDetailsStep draft={draft} onChange={updateDraft} />,
    2: <GuardianInfoStep draft={draft} onChange={updateDraft} />,
    3: <ProgramScheduleStep draft={draft} onChange={updateDraft} />,
    4: <HealthSafetyStep draft={draft} onChange={updateDraft} />,
    5: <DocumentsReviewStep draft={draft} onChange={updateDraft} />,
  }

  const isLastStep = current === steps.length - 1

  /* ---- Feedback messages ---- */
  const feedbackMessage =
    saveState.error || submitState.error || saveState.message || submitState.message

  return (
    <div className="flex w-full flex-col gap-3">
      <Link
        href="/parent/billing"
        className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Billing
      </Link>

      {current === 0 ? (
        /* ====== Welcome Card (Redesigned) ====== */
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative w-full"
          >
            <div className="absolute -left-10 top-8 h-28 w-28 rounded-full bg-teal-200/45 blur-3xl" />
            <div className="absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />

            <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400" />

              <CardContent className="grid gap-0 p-0 lg:grid-cols-[1.12fr_0.88fr]">
                <div className="p-8 sm:p-10 lg:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.35 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    New family enrollment
                  </motion.div>

                  <div className="mb-8 max-w-2xl">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-teal-100 shadow-inner ring-1 ring-teal-100">
                      <Sparkles className="h-8 w-8 text-sky-500" />
                    </div>

                    <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                      Enroll your child with confidence
                    </h1>
                    <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                      A guided, parent-friendly application that keeps things simple, saves your progress,
                      and lets you review everything before you submit.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {highlights.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.06, duration: 0.35 }}
                          className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                        >
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                        </motion.div>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button
                      className="h-14 rounded-full bg-slate-900 px-7 text-base font-medium shadow-lg shadow-slate-900/15 transition-transform hover:scale-[1.01] hover:bg-slate-800"
                      onClick={() => goTo(1)}
                    >
                      Begin enrollment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">About 10 minutes to complete</div>
                        <div>Your progress is saved automatically</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 bg-slate-50/80 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                        Before you start
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">What you&apos;ll need</h2>
                    </div>
                    <div className="rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-medium text-teal-700 shadow-sm">
                      6 items
                    </div>
                  </div>

                  <div className="space-y-3">
                    {checklist.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                        className="flex items-start gap-3 rounded-2xl border border-white bg-white px-4 py-4 shadow-sm"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                          <BadgeCheck className="h-4 w-4" />
                        </div>
                        <span className="text-[15px] leading-7 text-slate-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">Parent details</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        Contact info, emergency contacts, and guardian verification.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900">Health records</div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        Immunizations, physician details, and any required medical notes.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-xl shadow-slate-900/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">Helpful tip</div>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Have your documents ready before you begin to make the process feel quick and seamless.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <>
          {/* ====== Form Card ====== */}
      <Card className="flex flex-1 flex-col overflow-hidden border-white/60 bg-white/50 shadow-lg shadow-black/[.03] backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  {(() => {
                    const StepIcon = steps[current].icon
                    return <StepIcon className="h-5 w-5" />
                  })()}
                </span>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-800">
                    {steps[current].label}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    {stepDescriptions[current]}
                  </CardDescription>
                </div>
              </div>
              <nav className="flex items-center gap-1" aria-label="Enrollment steps">
                {formSteps.map((step) => {
                  const done = step.id < current
                  const active = step.id === current
                  const Icon = step.icon
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => goTo(step.id)}
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                        active
                          ? "bg-sky-100 text-sky-600"
                          : done
                            ? "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      aria-label={`${step.label}${done ? " (completed)" : active ? " (current)" : ""}`}
                    >
                      {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    </button>
                  )
                })}
                <span className="ml-1 text-xs tabular-nums text-slate-400">
                  {current}/{formSteps.length}
                </span>
              </nav>
            </div>
          </CardHeader>

          {/* Step content with transitions */}
          <CardContent className="flex-1 px-5 pb-5 pt-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {stepContent[current]}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Feedback message */}
          {feedbackMessage && (
            <div
              className={`mx-5 mb-4 rounded-lg px-4 py-2.5 text-sm ${
                saveState.error || submitState.error
                  ? "bg-red-50 text-red-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {feedbackMessage}
            </div>
          )}

          {/* Navigation footer */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white/80 px-5 py-4 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
              onClick={() => goTo(current - 1)}
              disabled={current === 0 || isPending}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isPending}
              >
                {isSaving ? "Saving…" : "Save Draft"}
              </Button>

              {isLastStep ? (
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isSubmitting ? "Submitting…" : "Submit Application"}
                  <Sparkles className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5 bg-sky-600 text-white shadow-md hover:bg-sky-700"
                  onClick={() => goTo(current + 1)}
                  disabled={isPending}
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
      </Card>
        </>
      )}
    </div>
  )
}
