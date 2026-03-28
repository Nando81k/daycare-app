'use client';

import { useRef, useMemo, useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Input, Select, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';
type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'WAITLISTED' | 'REQUEST_INFO';

interface EnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  programType: ProgramType;
  startDate: string | null;
  createdAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
}

interface EnrollmentResponseRow {
  id: string;
  status: EnrollmentStatus;
  programType: ProgramType;
  startDate: string | null;
  createdAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
}

interface IntakeResponse {
  enrollments: EnrollmentResponseRow[];
  summary: {
    childrenProcessed: number;
    enrollmentsSubmitted: number;
  };
}

interface ChildDraft {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  programType: ProgramType;
  startDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  medicalNotes: string;
}

function makeDraft(): ChildDraft {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    programType: 'TODDLER',
    startDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    medicalNotes: '',
  };
}

function formatProgram(value: ProgramType) {
  return value.replace('_', '-');
}

function statusLabel(status: EnrollmentStatus) {
  if (status === 'DENIED') return 'Rejected';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO') return 'Pending';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusVariant(status: EnrollmentStatus): 'info' | 'success' | 'danger' | 'warning' {
  if (status === 'APPROVED') return 'success';
  if (status === 'DENIED') return 'danger';
  return 'warning';
}

export function SimpleEnrollmentDashboard({
  initialEnrollments,
}: {
  initialEnrollments: EnrollmentRow[];
}) {
  const initialDraftRef = useRef<ChildDraft | null>(null);
  if (!initialDraftRef.current) {
    initialDraftRef.current = makeDraft();
  }

  const [drafts, setDrafts] = useState<ChildDraft[]>([initialDraftRef.current]);
  const [activeDraftId, setActiveDraftId] = useState(initialDraftRef.current.id);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>(initialEnrollments);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  const canSubmit = useMemo(
    () =>
      drafts.length > 0 &&
      drafts.every(
        (draft) =>
          draft.firstName.trim().length > 0 &&
          draft.lastName.trim().length > 0 &&
          draft.dateOfBirth &&
          draft.startDate &&
          draft.emergencyContactName.trim().length > 0 &&
          draft.emergencyContactPhone.trim().length > 0,
      ),
    [drafts],
  );

  const pendingCount = enrollments.filter(
    (row) => row.status === 'PENDING' || row.status === 'WAITLISTED' || row.status === 'REQUEST_INFO',
  ).length;
  const approvedCount = enrollments.filter((row) => row.status === 'APPROVED').length;
  const rejectedCount = enrollments.filter((row) => row.status === 'DENIED').length;

  function updateDraft(id: string, patch: Partial<ChildDraft>) {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)));
  }

  function addDraft() {
    const nextDraft = makeDraft();
    setDrafts((current) => [...current, nextDraft]);
    setActiveDraftId(nextDraft.id);
  }

  function removeDraft(id: string) {
    if (drafts.length === 1) return;

    const index = drafts.findIndex((draft) => draft.id === id);
    const nextDrafts = drafts.filter((draft) => draft.id !== id);
    setDrafts(nextDrafts);

    if (activeDraftId === id) {
      const fallback = nextDrafts[Math.max(0, index - 1)]?.id ?? nextDrafts[0]?.id;
      if (fallback) {
        setActiveDraftId(fallback);
      }
    }
  }

  function resetDrafts() {
    const nextDraft = makeDraft();
    setDrafts([nextDraft]);
    setActiveDraftId(nextDraft.id);
  }

  function submitBatch() {
    setError('');
    setNotice('');

    if (!canSubmit) {
      setError('Complete all required fields before submitting.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/v3/parent/family/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          children: drafts.map((draft) => ({
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            dateOfBirth: draft.dateOfBirth,
            programType: draft.programType,
            startDate: draft.startDate,
            emergencyContactName: draft.emergencyContactName.trim(),
            emergencyContactPhone: draft.emergencyContactPhone.trim(),
            allergies: draft.allergies.trim() || null,
            medicalNotes: draft.medicalNotes.trim() || null,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as IntakeResponse | { error?: { message?: string } } | null;
      if (!response.ok) {
        setError(payload && 'error' in payload ? payload.error?.message || 'Unable to submit enrollment batch.' : 'Unable to submit enrollment batch.');
        return;
      }

      const result = payload as IntakeResponse;
      const nextRows: EnrollmentRow[] = result.enrollments.map((item) => ({
        id: item.id,
        status: item.status,
        programType: item.programType,
        startDate: item.startDate,
        createdAt: item.createdAt,
        child: item.child,
      }));
      setEnrollments((current) =>
        [...nextRows, ...current].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setNotice(`Submitted ${result.summary.enrollmentsSubmitted} application(s).`);
      resetDrafts();
    });
  }

  return (
    <div className="space-y-4">
      <Card title="New Enrollment Batch" subtitle="Add one or more children and submit together">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-ink-600">
              Each child has a dedicated tab so you can move through the batch quickly.
            </p>
            <Button variant="outline" onClick={addDraft} leftIcon={<Plus className="h-4 w-4" />}>
              Add another child
            </Button>
          </div>

          <Tabs value={activeDraftId} onValueChange={setActiveDraftId} className="space-y-3">
            <TabsList className="w-full justify-start overflow-x-auto rounded-field border border-line bg-bg-soft p-1">
              {drafts.map((draft, index) => {
                const hasName = draft.firstName.trim().length > 0 || draft.lastName.trim().length > 0;
                const label = hasName
                  ? `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim()
                  : `Child ${index + 1}`;
                return (
                  <TabsTrigger key={draft.id} value={draft.id} className="shrink-0">
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {drafts.map((draft, index) => (
              <TabsContent key={draft.id} value={draft.id}>
                <div className="rounded-field border border-line bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Child {index + 1}</p>
                      <p className="text-xs text-ink-500">Complete all required details for this child.</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDraft(draft.id)}
                      disabled={drafts.length === 1}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      label="First name"
                      required
                      value={draft.firstName}
                      onChange={(event) => updateDraft(draft.id, { firstName: event.target.value })}
                    />
                    <Input
                      label="Last name"
                      required
                      value={draft.lastName}
                      onChange={(event) => updateDraft(draft.id, { lastName: event.target.value })}
                    />
                    <Input
                      label="Date of birth"
                      type="date"
                      required
                      value={draft.dateOfBirth}
                      onChange={(event) => updateDraft(draft.id, { dateOfBirth: event.target.value })}
                    />
                    <Select
                      label="Program"
                      value={draft.programType}
                      onChange={(event) => updateDraft(draft.id, { programType: event.target.value as ProgramType })}
                    >
                      <option value="INFANT">Infant</option>
                      <option value="TODDLER">Toddler</option>
                      <option value="PRESCHOOL">Preschool</option>
                      <option value="PRE_K">Pre-K</option>
                    </Select>
                    <Input
                      label="Preferred start date"
                      type="date"
                      required
                      value={draft.startDate}
                      onChange={(event) => updateDraft(draft.id, { startDate: event.target.value })}
                    />
                    <Input
                      label="Emergency contact name"
                      required
                      value={draft.emergencyContactName}
                      onChange={(event) => updateDraft(draft.id, { emergencyContactName: event.target.value })}
                    />
                    <Input
                      label="Emergency contact phone"
                      required
                      value={draft.emergencyContactPhone}
                      onChange={(event) => updateDraft(draft.id, { emergencyContactPhone: event.target.value })}
                    />
                    <Input
                      label="Allergy notes (optional)"
                      value={draft.allergies}
                      onChange={(event) => updateDraft(draft.id, { allergies: event.target.value })}
                    />
                    <Input
                      label="Medical notes (optional)"
                      containerClassName="md:col-span-2"
                      value={draft.medicalNotes}
                      onChange={(event) => updateDraft(draft.id, { medicalNotes: event.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            onClick={submitBatch}
            isLoading={isPending}
            loadingText="Submitting"
            disabled={!canSubmit}
          >
            Submit applications
          </Button>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm font-medium text-emerald-700">{notice}</p> : null}
      </Card>

      <Card title="Application Status" subtitle="Track latest enrollment decisions">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="warning">Pending: {pendingCount}</Badge>
          <Badge variant="success">Approved: {approvedCount}</Badge>
          <Badge variant="danger">Rejected: {rejectedCount}</Badge>
        </div>

        <div className="table-scroll">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-3 py-2.5">Child</th>
                <th className="px-3 py-2.5">Program</th>
                <th className="px-3 py-2.5">Start date</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length ? (
                enrollments.map((row) => (
                  <tr key={row.id} className="border-t border-line bg-white">
                    <td className="px-3 py-2.5 font-medium text-ink-900">
                      {row.child.firstName} {row.child.lastName}
                    </td>
                    <td className="px-3 py-2.5 text-ink-700">{formatProgram(row.programType)}</td>
                    <td className="px-3 py-2.5 text-ink-700">
                      {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'Not set'}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-ink-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-line bg-white">
                  <td className="px-3 py-4 text-sm text-ink-600" colSpan={5}>
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
