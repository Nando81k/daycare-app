'use client';

import { useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Plus, Sparkles, X } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getUiRevampFlags } from '@/lib/ui-revamp';
import { IntakeBatchSummary, type IntakeSubmissionMode } from './IntakeBatchSummary';

export type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';

type EnrollmentDraft = {
  localId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  programType: ProgramType;
  notes: string;
};

export interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  gender: string | null;
  pronouns: string | null;
  dateOfBirth: string;
  gradeLevel: string | null;
  schoolName: string | null;
  favoriteActivities: string | null;
  favoriteFoods: string | null;
  favoriteToys: string | null;
  comfortItems: string | null;
  temperamentNotes: string | null;
  learningStyle: string | null;
  napSchedule: string | null;
  languagePreferences: string | null;
  pottyTrainingStatus: string | null;
  childSsnLast4Masked: string | null;
  allergies: string | null;
  medicalNotes: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  photoStorageKey: string | null;
  photoMimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
  photoSizeBytes: number | null;
}

export interface EnrollmentResult {
  id: string;
  intakeBatchId?: string | null;
  childId: string;
  status: string;
  programType: string;
  startDate: string | null;
  notes: string | null;
  reviewNotes: string | null;
  decisionReason: string | null;
  spotHoldExpiresAt: string | null;
  spotSecuredAt: string | null;
  selectedCadence: string | null;
  createdAt: string;
  updatedAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
}

export interface SubmissionResponse {
  children: ChildProfile[];
  enrollments: EnrollmentResult[];
  summary: {
    childrenProcessed: number;
    profilesUpdatedOrCreated: number;
    enrollmentsSubmitted: number;
    submissionMode: IntakeSubmissionMode;
  };
}

function makeBlankDraft(): EnrollmentDraft {
  return {
    localId: `new-${crypto.randomUUID()}`,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    programType: 'TODDLER',
    notes: '',
  };
}

function toDisplayName(entry: EnrollmentDraft, index: number) {
  const name = `${entry.firstName} ${entry.lastName}`.trim();
  if (name) return name;
  return `Child ${index + 1}`;
}

function isChildReady(entry: EnrollmentDraft) {
  return Boolean(entry.firstName.trim() && entry.lastName.trim() && entry.dateOfBirth && entry.programType);
}

export function FamilyIntakeFlow(props: {
  parentId: string;
  initialChildren: ChildProfile[];
  fullScreen?: boolean;
  onClose?: () => void;
  onSubmitted: (payload: SubmissionResponse) => void;
}) {
  const [children, setChildren] = useState<EnrollmentDraft[]>([makeBlankDraft()]);
  const [sharedStartDate, setSharedStartDate] = useState('');
  const [guardianSsnLast4, setGuardianSsnLast4] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(Date.now());
  const [isPending, startTransition] = useTransition();

  const mode: IntakeSubmissionMode = 'ENROLL_ONLY';
  const isFullScreen = Boolean(props.fullScreen);
  const revampPhase = useMemo(() => getUiRevampFlags().phase, []);
  const completedChildren = useMemo(
    () => children.filter((child) => isChildReady(child)).length,
    [children],
  );

  const canSubmit = useMemo(() => {
    if (!children.length) return false;
    if (!sharedStartDate) return false;
    if (!/^\d{4}$/.test(guardianSsnLast4)) return false;
    if (!consentAccepted) return false;
    return children.every(isChildReady);
  }, [children, consentAccepted, guardianSsnLast4, sharedStartDate]);

  function resetForm() {
    setChildren([makeBlankDraft()]);
    setSharedStartDate('');
    setGuardianSsnLast4('');
    setConsentAccepted(false);
    setSessionStartedAt(Date.now());
  }

  function addChild() {
    setChildren((prev) => [...prev, makeBlankDraft()]);
  }

  function removeChild(localId: string) {
    setChildren((prev) => prev.filter((child) => child.localId !== localId));
  }

  function updateChild(localId: string, patch: Partial<EnrollmentDraft>) {
    setChildren((prev) =>
      prev.map((child) => (child.localId === localId ? { ...child, ...patch } : child)),
    );
  }

  function submit() {
    setError('');
    setNotice('');

    if (!canSubmit) {
      setError('Complete all required enrollment fields before submitting.');
      return;
    }

    startTransition(async () => {
      const now = Date.now();
      const startDateIso = new Date(sharedStartDate).toISOString();

      const response = await fetch('/api/v3/parent/family/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionMode: 'ENROLL_ONLY',
          sharedStartDate: startDateIso,
          clientMetrics: {
            flow: 'PARENT_INTAKE',
            elapsedMs: Math.max(0, now - sessionStartedAt),
            startedAt: new Date(sessionStartedAt).toISOString(),
            completedAt: new Date(now).toISOString(),
            phase: revampPhase,
          },
          guardianIdentity: {
            guardianSsnLast4,
          },
          children: children.map((child) => ({
            firstName: child.firstName.trim(),
            lastName: child.lastName.trim(),
            dateOfBirth: child.dateOfBirth,
            enroll: true,
            programType: child.programType,
            startDate: startDateIso,
            notes: child.notes.trim() ? child.notes.trim() : null,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to submit enrollment batch.');
        return;
      }

      const data = payload as SubmissionResponse;
      props.onSubmitted(data);
      setNotice(`Submitted ${data.summary.enrollmentsSubmitted} enrollment request(s) to Admissions.`);
      resetForm();
    });
  }

  return (
    <div
      className={cn(
        'intake-v3-shell',
        isFullScreen ? 'h-[100dvh] w-screen rounded-none border-0 shadow-none' : 'min-h-[44rem]',
      )}
    >
      <header className="intake-v3-header px-4 py-3 md:px-5">
        <div className="w-full space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-sky-800">
                <Sparkles className="h-3.5 w-3.5" />
                Enrollment only
              </p>
              <h2 className="text-lg font-semibold text-ink-900">Simple child enrollment</h2>
              <p className="mt-1 text-sm text-ink-600">
                Every intake creates new child records and submits directly to Admissions.
              </p>
              <p className="mt-1 text-xs font-medium text-ink-500">
                Required child entries complete: {completedChildren}/{children.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                Clear form
              </Button>
              {props.onClose ? (
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={props.onClose}
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Close
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="intake-v3-main p-3 md:p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="intake-v3-step-panel p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">Children in this enrollment batch</p>
                <p className="text-xs text-ink-500">Add each child you want to enroll in this batch.</p>
              </div>
              <Button size="sm" variant="outline" onClick={addChild} leftIcon={<Plus className="h-4 w-4" />}>
                Add child
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              {children.map((child, index) => (
                <article key={child.localId} className="rounded-[12px] border border-line bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{toDisplayName(child, index)}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeChild(child.localId)}
                      disabled={children.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Input
                      label="First name"
                      required
                      value={child.firstName}
                      onChange={(event) => updateChild(child.localId, { firstName: event.target.value })}
                    />
                    <Input
                      label="Last name"
                      required
                      value={child.lastName}
                      onChange={(event) => updateChild(child.localId, { lastName: event.target.value })}
                    />
                    <Input
                      label="Date of birth"
                      type="date"
                      required
                      value={child.dateOfBirth}
                      onChange={(event) => updateChild(child.localId, { dateOfBirth: event.target.value })}
                    />
                    <Select
                      label="Program"
                      value={child.programType}
                      onChange={(event) =>
                        updateChild(child.localId, { programType: event.target.value as ProgramType })
                      }
                    >
                      <option value="INFANT">Infant</option>
                      <option value="TODDLER">Toddler</option>
                      <option value="PRESCHOOL">Preschool</option>
                      <option value="PRE_K">Pre-K</option>
                    </Select>
                    <Input
                      label="Admissions notes (optional)"
                      containerClassName="md:col-span-2"
                      value={child.notes}
                      onChange={(event) => updateChild(child.localId, { notes: event.target.value })}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-3 rounded-[12px] border border-sky-200 bg-sky-50 p-3">
              <p className="text-sm font-semibold text-sky-900">Enrollment setup</p>
              <div className="mt-2 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <Input
                  label="Shared start date"
                  type="date"
                  required
                  value={sharedStartDate}
                  onChange={(event) => setSharedStartDate(event.target.value)}
                />
                <Input
                  label="Guardian SSN last4"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  value={guardianSsnLast4}
                  onChange={(event) =>
                    setGuardianSsnLast4(event.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  placeholder="1234"
                />
                <label className="flex items-start gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-sky-600"
                    checked={consentAccepted}
                    onChange={(event) => setConsentAccepted(event.target.checked)}
                  />
                  Identity confirmed
                </label>
              </div>
            </div>
          </section>

          <aside className="intake-v3-step-panel p-3">
            <IntakeBatchSummary
              mode={mode}
              selectedChildren={children.length}
              profileCount={children.length}
              enrollmentCount={children.length}
              hasUploads={false}
              fullScreen={isFullScreen}
            />

            <div className="mt-3 space-y-2">
              {children.map((child, index) => (
                <div key={child.localId} className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm">
                  <p className="font-semibold text-ink-900">{toDisplayName(child, index)}</p>
                  <p className="text-xs text-ink-600">{child.programType.replace('_', ' ')} program</p>
                </div>
              ))}
              {!children.length ? (
                <div className="state-empty">Add at least one child to enroll.</div>
              ) : null}
            </div>
          </aside>
        </div>

        {error ? (
          <div className="mt-3 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {notice}
          </div>
        ) : null}
      </main>

      <footer className="intake-v3-footer px-4 py-3 md:px-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink-600">
            Submit now: drafts are not saved in this flow.
          </span>

          <Button
            type="button"
            className="px-8"
            onClick={submit}
            isLoading={isPending}
            loadingText="Submitting"
            rightIcon={<CheckCircle2 className="h-4 w-4" />}
            disabled={!canSubmit}
          >
            Submit Enrollment Batch
          </Button>
        </div>
      </footer>
    </div>
  );
}
