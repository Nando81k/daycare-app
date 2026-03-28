'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Baby, CheckCircle2, ShieldAlert, Trash2, WandSparkles } from 'lucide-react';
import {
  Badge,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
} from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { SecureSpotButton } from '@/components/billing';
import { cn } from '@/lib/utils';
import { isUiRevampEnabled } from '@/lib/ui-revamp';
import {
  FamilyIntakeFlow,
  type ChildProfile,
  type EnrollmentResult,
  type SubmissionResponse,
} from './intake/FamilyIntakeFlow';

type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';
type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'DENIED' | 'REQUEST_INFO';
type Cadence = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

interface Enrollment {
  id: string;
  intakeBatchId?: string | null;
  childId: string;
  status: EnrollmentStatus;
  programType: ProgramType;
  startDate: string | null;
  notes: string | null;
  reviewNotes: string | null;
  decisionReason: string | null;
  spotHoldExpiresAt: string | null;
  spotSecuredAt: string | null;
  selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
  createdAt: string;
  updatedAt: string;
  child: {
    firstName: string;
    lastName: string;
  };
}

interface Plan {
  id: string;
  programType: ProgramType | null;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
}

interface Props {
  parentId: string;
  initialChildren: ChildProfile[];
  initialEnrollments: Enrollment[];
  plans: Plan[];
}

type ChildProfileRecord = {
  child: ChildProfile;
  enrollments: Enrollment[];
  latestEnrollment: Enrollment | null;
  history: {
    headline: string;
    detail: string;
  };
  isEnrolled: boolean;
  isPending: boolean;
};

type FamilyRecordRow =
  | {
      kind: 'profile';
      key: string;
      childId: string;
      title: string;
      subtitle: string;
      childrenLabel: string;
      profileLabel: string;
      statusLabel: string;
      statusVariant: 'default' | 'info' | 'warning' | 'danger' | 'success';
      programLabel: string;
    }
  | {
      kind: 'batch';
      key: string;
      groupKey: string;
      title: string;
      subtitle: string;
      childrenLabel: string;
      profileLabel: string;
      programLabel: string;
      items: Enrollment[];
      statusSummary: ReturnType<typeof summarizeStatuses>;
      secureSpotCount: number;
      canSecureAll: boolean;
    };

function enrollmentVariant(status: EnrollmentStatus): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'APPROVED') return 'success';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO') return 'warning';
  if (status === 'DENIED') return 'danger';
  if (status === 'PENDING') return 'info';
  return 'default';
}

function resolvePlan(plans: Plan[], program: ProgramType) {
  return plans.find((plan) => plan.programType === program) || plans.find((plan) => plan.programType === null) || null;
}

function normalizeEnrollment(result: EnrollmentResult): Enrollment {
  return {
    ...result,
    status: result.status as EnrollmentStatus,
    programType: result.programType as ProgramType,
    selectedCadence: result.selectedCadence as Enrollment['selectedCadence'],
  };
}

function hasSecureSpotAction(enrollment: Enrollment) {
  return enrollment.status === 'APPROVED' && !enrollment.spotSecuredAt && Boolean(enrollment.spotHoldExpiresAt);
}

function summarizeStatuses(items: Enrollment[]) {
  const counts = items.reduce<Record<EnrollmentStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      PENDING: 0,
      APPROVED: 0,
      WAITLISTED: 0,
      DENIED: 0,
      REQUEST_INFO: 0,
    }
  );

  return (Object.entries(counts) as Array<[EnrollmentStatus, number]>)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      label: `${count} ${status.replace('_', ' ')}`,
    }));
}

function getChildAgeLabel(dateOfBirthIso: string) {
  const dob = new Date(dateOfBirthIso);
  if (Number.isNaN(dob.getTime())) return 'Age unavailable';
  const now = new Date();
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) {
    months -= 1;
  }

  if (months < 0) return 'Age unavailable';
  if (months < 24) return `${months} mo`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? '' : 's'}`;
}

function summarizeChildHistory(enrollments: Enrollment[]) {
  if (!enrollments.length) {
    return { headline: 'No applications yet', detail: 'Profile only' };
  }

  const sorted = [...enrollments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const latest = sorted[0];
  return {
    headline: `${enrollments.length} application${enrollments.length === 1 ? '' : 's'}`,
    detail: `Latest: ${latest.status.replace('_', ' ')}`,
  };
}

function formatProgramLabel(programType: ProgramType | null | undefined) {
  if (!programType) return 'Not set';
  return programType.replace('_', ' ');
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

function formatHoldCountdown(value: string | null | undefined) {
  if (!value) return 'Hold timer not available';
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return 'Hold timer not available';

  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 'Hold expired';

  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m remaining`;
}

function displayText(value: string | null | undefined, fallback = 'Not provided') {
  return value && value.trim().length ? value : fallback;
}

function getLatestEnrollment(enrollments: Enrollment[]) {
  if (!enrollments.length) return null;
  return [...enrollments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

function isChildFullyEnrolled(enrollment: Enrollment | null) {
  if (!enrollment) return false;
  return Boolean(
    enrollment.spotSecuredAt ||
      enrollment.selectedCadence ||
      (enrollment.status === 'APPROVED' && !enrollment.spotHoldExpiresAt)
  );
}

export function FamilyHubClient({ parentId, initialChildren, initialEnrollments, plans }: Props) {
  const searchParams = useSearchParams();
  const parentRevamp = isUiRevampEnabled('parent');
  const [children, setChildren] = useState(initialChildren);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [submittedBatch, setSubmittedBatch] = useState<SubmissionResponse | null>(null);
  const [activeBatchGroupKey, setActiveBatchGroupKey] = useState<string | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [profileError, setProfileError] = useState('');
  const [activeProfileActionId, setActiveProfileActionId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeChildDetailsId, setActiveChildDetailsId] = useState<string | null>(null);
  const [batchCadence, setBatchCadence] = useState<Cadence>('MONTHLY');
  const [batchError, setBatchError] = useState('');
  const [groupCadenceSelections, setGroupCadenceSelections] = useState<Record<string, Cadence>>({});
  const [groupCheckoutErrors, setGroupCheckoutErrors] = useState<Record<string, string>>({});
  const [isBatchPending, startBatchTransition] = useTransition();
  const focusedEnrollmentRef = useRef<string | null>(null);

  const approvedPendingSecure = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          hasSecureSpotAction(enrollment)
      ),
    [enrollments]
  );

  const enrollmentsByChildId = useMemo(() => {
    const map = new Map<string, Enrollment[]>();
    for (const enrollment of enrollments) {
      const existing = map.get(enrollment.childId) ?? [];
      existing.push(enrollment);
      map.set(enrollment.childId, existing);
    }
    return map;
  }, [enrollments]);

  const childProfiles = useMemo<ChildProfileRecord[]>(
    () =>
      children.map((child) => {
        const childEnrollments = enrollmentsByChildId.get(child.id) ?? [];
        const latestEnrollment = getLatestEnrollment(childEnrollments);
        const enrolled = isChildFullyEnrolled(latestEnrollment);

        return {
          child,
          enrollments: childEnrollments,
          latestEnrollment,
          history: summarizeChildHistory(childEnrollments),
          isEnrolled: enrolled,
          isPending: childEnrollments.length > 0 && !enrolled,
        };
      }),
    [children, enrollmentsByChildId]
  );

  const activeChildProfile = useMemo(
    () => childProfiles.find((item) => item.child.id === activeChildDetailsId) ?? null,
    [activeChildDetailsId, childProfiles]
  );

  const childLookupById = useMemo(
    () => new Map(children.map((child) => [child.id, child])),
    [children]
  );

  const profileOnlyChildren = useMemo(
    () => childProfiles.filter((item) => item.enrollments.length === 0),
    [childProfiles]
  );
  const pendingEnrollmentChildren = useMemo(
    () => childProfiles.filter((item) => item.isPending),
    [childProfiles]
  );
  const enrolledChildren = useMemo(
    () => childProfiles.filter((item) => item.isEnrolled),
    [childProfiles]
  );

  const groupedEnrollments = useMemo(() => {
    const groups = new Map<string, Enrollment[]>();
    for (const enrollment of enrollments) {
      const legacyTimeBucket = new Date(enrollment.createdAt).toISOString().slice(0, 19);
      const key = enrollment.intakeBatchId
        ? `batch:${enrollment.intakeBatchId}`
        : `legacy:${legacyTimeBucket}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(enrollment);
    }

    return Array.from(groups.entries())
      .map(([groupKey, items]) => {
        const sortedItems = [...items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const submittedAt = sortedItems.reduce((latest, item) => {
          return new Date(item.createdAt).getTime() > new Date(latest).getTime() ? item.createdAt : latest;
        }, sortedItems[0]?.createdAt || new Date(0).toISOString());

        return {
          groupKey,
          submittedAt,
          items: sortedItems,
          statusSummary: summarizeStatuses(sortedItems),
          secureSpotCount: sortedItems.filter((item) => hasSecureSpotAction(item)).length,
          canSecureAll:
            sortedItems.length > 1 &&
            sortedItems.every((item) => hasSecureSpotAction(item)),
        };
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [enrollments]);

  function getAllowedCadencesForGroup(items: Enrollment[]) {
    const scopedPlans = items.map((enrollment) => resolvePlan(plans, enrollment.programType));
    if (scopedPlans.some((plan) => !plan)) return [] as Cadence[];

    const allowMonthly = scopedPlans.every((plan) => plan!.allowMonthly);
    const allowBiweekly = scopedPlans.every((plan) => plan!.allowBiweekly);
    const allowWeekly = scopedPlans.every((plan) => plan!.allowWeekly);

    const output: Cadence[] = [];
    if (allowMonthly) output.push('MONTHLY');
    if (allowBiweekly) output.push('BIWEEKLY');
    if (allowWeekly) output.push('WEEKLY');
    return output;
  }

  function resolveGroupCadence(groupKey: string, allowed: Cadence[]) {
    const selected = groupCadenceSelections[groupKey];
    if (selected && allowed.includes(selected)) return selected;
    return allowed[0] || 'MONTHLY';
  }

  function startGroupSecureCheckout(groupKey: string, enrollmentIds: string[], allowedCadences: Cadence[]) {
    const selectedCadence = resolveGroupCadence(groupKey, allowedCadences);
    if (!enrollmentIds.length) return;
    if (!allowedCadences.includes(selectedCadence)) {
      setGroupCheckoutErrors((prev) => ({
        ...prev,
        [groupKey]: 'A shared billing cadence is required before continuing.',
      }));
      return;
    }

    setGroupCheckoutErrors((prev) => ({ ...prev, [groupKey]: '' }));
    startBatchTransition(async () => {
      const response = await fetch('/api/v3/parent/family/enrollments/secure-spot-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentIds,
          billingCadence: selectedCadence,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setGroupCheckoutErrors((prev) => ({
          ...prev,
          [groupKey]: payload?.error?.message || 'Unable to start combined secure-spot checkout.',
        }));
        return;
      }

      if (!payload?.url) {
        setGroupCheckoutErrors((prev) => ({
          ...prev,
          [groupKey]: 'Checkout URL missing from response.',
        }));
        return;
      }

      window.location.href = payload.url;
    });
  }
  const activeBatchGroup = useMemo(
    () =>
      activeBatchGroupKey
        ? groupedEnrollments.find((group) => group.groupKey === activeBatchGroupKey) || null
        : null,
    [activeBatchGroupKey, groupedEnrollments]
  );

  useEffect(() => {
    const enrollmentId = searchParams.get('enrollmentId');
    if (!enrollmentId) return;
    if (focusedEnrollmentRef.current === enrollmentId) return;

    const matchingGroup = groupedEnrollments.find((group) =>
      group.items.some((item) => item.id === enrollmentId)
    );

    if (!matchingGroup) return;

    focusedEnrollmentRef.current = enrollmentId;
    setActiveBatchGroupKey(matchingGroup.groupKey);
  }, [groupedEnrollments, searchParams]);

  const familyRecordRows = useMemo<FamilyRecordRow[]>(() => {
    const profileRows = profileOnlyChildren
      .map<FamilyRecordRow>(({ child }) => ({
        kind: 'profile',
        key: `profile:${child.id}`,
        childId: child.id,
        title: `${child.firstName} ${child.lastName}`,
        subtitle: 'Profile only',
        childrenLabel: `${getChildAgeLabel(child.dateOfBirth)}${child.photoStorageKey ? ' • Photo on file' : ''}`,
        profileLabel: 'Saved profile with no enrollment activity',
        statusLabel: 'Profile only',
        statusVariant: 'default',
        programLabel: 'Not enrolled',
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    const batchRows = groupedEnrollments.map<FamilyRecordRow>((group) => {
      const childNames = group.items.map((item) => `${item.child.firstName} ${item.child.lastName}`);
      const programSummary = Array.from(
        new Set(group.items.map((item) => item.programType.replace('_', ' ')))
      ).join(', ');

      return {
        kind: 'batch',
        key: group.groupKey,
        groupKey: group.groupKey,
        title: group.items.length > 1 ? `${group.items.length}-child application` : childNames[0] || 'Application',
        subtitle: `Submitted ${formatDateTime(group.submittedAt)}`,
        childrenLabel: childNames.join(', '),
        profileLabel: `${group.items.length} child profile${group.items.length === 1 ? '' : 's'} linked`,
        programLabel: programSummary || 'Not set',
        items: group.items,
        statusSummary: group.statusSummary,
        secureSpotCount: group.secureSpotCount,
        canSecureAll: group.canSecureAll,
      };
    });

    return [...batchRows, ...profileRows];
  }, [groupedEnrollments, profileOnlyChildren]);

  function renderEnrollmentDetail(enrollment: Enrollment) {
    const plan = resolvePlan(plans, enrollment.programType);
    const childProfile = childLookupById.get(enrollment.childId) ?? null;

    return (
      <div key={enrollment.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink-900">
            {enrollment.child.firstName} {enrollment.child.lastName}
          </p>
          <Badge variant={enrollmentVariant(enrollment.status)}>{enrollment.status.replace('_', ' ')}</Badge>
        </div>
        {enrollment.reviewNotes ? (
          <p className="mt-1 text-sm text-ink-700">Review notes: {enrollment.reviewNotes}</p>
        ) : null}
        {enrollment.decisionReason ? (
          <p className="mt-1 text-sm text-ink-700">Decision: {enrollment.decisionReason}</p>
        ) : null}

        {childProfile ? (
          <div className="mt-3 grid gap-2 rounded-field border border-line bg-bg-soft px-3 py-2 text-sm text-ink-700 sm:grid-cols-2">
            <p>
              <span className="font-medium text-ink-900">Age:</span> {getChildAgeLabel(childProfile.dateOfBirth)}
            </p>
            <p>
              <span className="font-medium text-ink-900">Profile:</span>{' '}
              {childProfile.photoStorageKey ? 'Photo on file' : 'No photo'}
            </p>
            <p>
              <span className="font-medium text-ink-900">Allergies:</span> {displayText(childProfile.allergies)}
            </p>
            <p>
              <span className="font-medium text-ink-900">Emergency contact:</span>{' '}
              {displayText(childProfile.emergencyContactName)}
            </p>
          </div>
        ) : null}

        {hasSecureSpotAction(enrollment) && plan ? (
          <div className="mt-3 rounded-field border border-sky-200 bg-sky-50/75 p-3">
            <p className="text-sm font-semibold text-sky-800">
              Secure seat for {enrollment.child.firstName} before {formatDateTime(enrollment.spotHoldExpiresAt!)}
            </p>
            <SecureSpotButton
              enrollmentId={enrollment.id}
              allowMonthly={plan.allowMonthly}
              allowBiweekly={plan.allowBiweekly}
              allowWeekly={plan.allowWeekly}
            />
          </div>
        ) : null}

        {enrollment.status === 'APPROVED' && enrollment.spotSecuredAt ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-field bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <Baby className="h-4 w-4" />
            Seat secured on {formatDateTime(enrollment.spotSecuredAt)}
          </p>
        ) : null}

        {enrollment.status === 'WAITLISTED' ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-field bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
            <ShieldAlert className="h-4 w-4" />
            You are on the waitlist. Admissions will notify you when capacity opens.
          </p>
        ) : null}
      </div>
    );
  }

  const batchAllowedCadences = useMemo(() => {
    if (!approvedPendingSecure.length) return [] as Cadence[];

    const scopedPlans = approvedPendingSecure.map((enrollment) =>
      resolvePlan(plans, enrollment.programType)
    );
    if (scopedPlans.some((plan) => !plan)) return [] as Cadence[];

    const allowMonthly = scopedPlans.every((plan) => plan!.allowMonthly);
    const allowBiweekly = scopedPlans.every((plan) => plan!.allowBiweekly);
    const allowWeekly = scopedPlans.every((plan) => plan!.allowWeekly);

    const output: Cadence[] = [];
    if (allowMonthly) output.push('MONTHLY');
    if (allowBiweekly) output.push('BIWEEKLY');
    if (allowWeekly) output.push('WEEKLY');
    return output;
  }, [approvedPendingSecure, plans]);

  useEffect(() => {
    if (!batchAllowedCadences.length) return;
    if (batchAllowedCadences.includes(batchCadence)) return;
    setBatchCadence(batchAllowedCadences[0]);
  }, [batchAllowedCadences, batchCadence]);

  function handleBatchSubmitted(payload: SubmissionResponse) {
    setChildren((prev) => [
      ...payload.children,
      ...prev.filter((existing) => !payload.children.some((incoming) => incoming.id === existing.id)),
    ]);
    setEnrollments((prev) => [
      ...payload.enrollments.map(normalizeEnrollment),
      ...prev,
    ]);
    setIsIntakeOpen(false);
    setSubmittedBatch(payload);
    setProfileNotice('');
    setProfileError('');
  }

  function requestDeleteProfile(childId: string) {
    setProfileNotice('');
    setProfileError('');

    const childEnrollments = enrollmentsByChildId.get(childId) ?? [];
    if (childEnrollments.length > 0) {
      setProfileError('This profile has enrollment activity and cannot be permanently deleted from Family Hub.');
      return;
    }

    setDeleteTargetId(childId);
  }

  async function handleDeleteProfile() {
    if (!deleteTargetId) return;

    setActiveProfileActionId(deleteTargetId);
    try {
      const response = await fetch(`/api/v3/parent/family/children/${encodeURIComponent(deleteTargetId)}`, {
        method: 'DELETE',
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setProfileError(payload?.error?.message || 'Unable to delete this child profile right now.');
        return;
      }

      setChildren((previous) => previous.filter((child) => child.id !== deleteTargetId));
      setProfileNotice('Child profile permanently deleted.');
      setDeleteTargetId(null);
    } finally {
      setActiveProfileActionId(null);
    }
  }

  function startBatchSecureCheckout() {
    setBatchError('');

    const enrollmentIds = approvedPendingSecure.map((enrollment) => enrollment.id);
    if (enrollmentIds.length < 2) return;
    if (!batchAllowedCadences.includes(batchCadence)) {
      setBatchError('A shared billing cadence is required before continuing.');
      return;
    }

    startBatchTransition(async () => {
      const response = await fetch('/api/v3/parent/family/enrollments/secure-spot-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentIds,
          billingCadence: batchCadence,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setBatchError(payload?.error?.message || 'Unable to start combined secure-spot checkout.');
        return;
      }

      if (!payload?.url) {
        setBatchError('Checkout URL missing from response.');
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <div className={cn('space-y-4', parentRevamp && 'relative')}>
      <Card
        title="Family Intake"
        subtitle="One simplified flow to enroll children now and submit immediately to Admissions."
        className="glass-shell overflow-hidden"
        data-tour-id="parent-family-intake-launch"
      >
        <div className="glass-soft rounded-[10px] border-sky-300 bg-sky-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-800">
                <WandSparkles className="h-4 w-4" />
                Enrollment Flow
              </p>
              <p className="mt-1 text-sm text-ink-700">
                Add new children, complete required enrollment details, and submit one batch to Admissions.
              </p>
              <p className="mt-1 text-xs text-ink-500">
                This is submit-now intake. Drafts and saved-child resume are not part of this flow.
              </p>
            </div>
            <Button type="button" size="lg" className="px-8" onClick={() => setIsIntakeOpen(true)}>
              Start Family Intake
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isIntakeOpen} onOpenChange={setIsIntakeOpen}>
        <DialogContent
          showCloseButton={false}
          className="!inset-0 !left-0 !top-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Family Enrollment Flow</DialogTitle>
            <DialogDescription>
              Simplified flow to enroll children and submit enrollment requests.
            </DialogDescription>
          </DialogHeader>
          <FamilyIntakeFlow
            parentId={parentId}
            initialChildren={children}
            fullScreen
            onClose={() => setIsIntakeOpen(false)}
            onSubmitted={handleBatchSubmitted}
          />
        </DialogContent>
      </Dialog>

      <Card
        title="Children and Enrollment Records"
        subtitle="Track child profiles, enrollment decisions, and next actions with full details available from each row."
        className="glass-shell"
        data-tour-id="parent-family-enrollment-status"
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-field border border-line bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-ink-500">Profile Only</p>
            <p className="mt-1 text-base font-semibold text-ink-900">{profileOnlyChildren.length}</p>
          </div>
          <div className="rounded-field border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-amber-700">Pending Enrollment</p>
            <p className="mt-1 text-base font-semibold text-amber-900">{pendingEnrollmentChildren.length}</p>
          </div>
          <div className="rounded-field border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">Enrolled</p>
            <p className="mt-1 text-base font-semibold text-emerald-900">{enrolledChildren.length}</p>
          </div>
        </div>

        <div className="mb-4 rounded-field border border-line bg-bg-soft px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">Need the full record for a child or intake batch?</p>
          <p className="mt-1 text-sm text-ink-600">
            Use <span className="font-semibold text-ink-900">View details</span> in any row to see complete child data,
            admissions notes, and secure-spot actions.
          </p>
        </div>

        {profileNotice ? (
          <div className="mb-2 rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            {profileNotice}
          </div>
        ) : null}
        {profileError ? (
          <div className="mb-2 rounded-field border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {profileError}
          </div>
        ) : null}

        {approvedPendingSecure.length > 1 ? (
          <div className="mb-3 rounded-field border border-sky-200 bg-sky-50/75 p-3">
            <p className="text-sm font-semibold text-sky-900">Secure all approved spots together</p>
            <p className="mt-1 text-xs text-sky-800">
              Complete one checkout for all approved children waiting on secure-spot payment.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
              <Select
                label="Tuition cadence"
                value={batchCadence}
                onChange={(event) => setBatchCadence(event.target.value as Cadence)}
                disabled={isBatchPending || !batchAllowedCadences.length}
              >
                {batchAllowedCadences.includes('MONTHLY') ? <option value="MONTHLY">Monthly</option> : null}
                {batchAllowedCadences.includes('BIWEEKLY') ? <option value="BIWEEKLY">Biweekly</option> : null}
                {batchAllowedCadences.includes('WEEKLY') ? <option value="WEEKLY">Weekly</option> : null}
              </Select>
              <Button
                size="lg"
                className="px-8"
                onClick={startBatchSecureCheckout}
                disabled={!batchAllowedCadences.length}
                isLoading={isBatchPending}
                loadingText="Opening checkout"
              >
                Secure All Spots
              </Button>
            </div>
            {!batchAllowedCadences.length ? (
              <p className="mt-2 text-sm font-medium text-amber-700">
                No shared cadence is available across these enrollments. Use individual secure-spot checkout per child.
              </p>
            ) : null}
            {batchError ? <p className="mt-2 text-sm font-medium text-rose-600">{batchError}</p> : null}
          </div>
        ) : null}

        {approvedPendingSecure.length ? (
          <div className="mb-3 rounded-field border border-sky-200 bg-sky-50/75 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky-900">Admissions handoff</p>
                <p className="mt-1 text-xs text-sky-800">
                  Approved children below need secure-spot payment to finalize enrollment.
                </p>
              </div>
              <Badge variant="info">{approvedPendingSecure.length} awaiting secure spot</Badge>
            </div>

            <div className="mt-2 space-y-2">
              {approvedPendingSecure.slice(0, 3).map((enrollment) => {
                const plan = resolvePlan(plans, enrollment.programType);
                const holdExpiringSoon = enrollment.spotHoldExpiresAt
                  ? new Date(enrollment.spotHoldExpiresAt).getTime() - Date.now() <= 24 * 60 * 60 * 1000
                  : false;
                return (
                  <article
                    key={enrollment.id}
                    className="rounded-field border border-line bg-white px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink-900">
                        {enrollment.child.firstName} {enrollment.child.lastName}
                      </p>
                      <Badge variant={holdExpiringSoon ? 'warning' : 'info'}>
                        {holdExpiringSoon ? 'Hold expiring soon' : 'Awaiting payment'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-600">
                      {formatHoldCountdown(enrollment.spotHoldExpiresAt)} • Hold expires{' '}
                      {enrollment.spotHoldExpiresAt
                        ? formatDateTime(enrollment.spotHoldExpiresAt)
                        : 'not set'}
                    </p>
                    {plan ? (
                      <div className="mt-2">
                        <SecureSpotButton
                          enrollmentId={enrollment.id}
                          allowMonthly={plan.allowMonthly}
                          allowBiweekly={plan.allowBiweekly}
                          allowWeekly={plan.allowWeekly}
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        No matching plan found for secure-spot checkout.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {familyRecordRows.length ? (
          <div className="table-shell">
            <div className="table-scroll">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="w-[16%] px-3 py-2.5 text-left">Record</th>
                    <th className="w-[22%] px-3 py-2.5 text-left">Children + Profile</th>
                    <th className="w-[22%] px-3 py-2.5 text-left">Enrollment</th>
                    <th className="w-[14%] px-3 py-2.5 text-left">Program</th>
                    <th className="w-[14%] px-3 py-2.5 text-left">Next Step</th>
                    <th className="w-[12%] px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {familyRecordRows.map((row) => {
                    if (row.kind === 'profile') {
                      return (
                        <tr key={row.key} className="border-t border-line bg-white/90 align-top">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-ink-900">{row.title}</p>
                            <p className="mt-1 text-xs text-ink-500">{row.subtitle}</p>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-sm font-medium text-ink-800">{row.childrenLabel}</p>
                            <p className="mt-1 text-xs leading-relaxed text-ink-500">{row.profileLabel}</p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1.5">
                              <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                              <p className="text-xs text-ink-500">No enrollment request submitted yet.</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-ink-700">{row.programLabel}</td>
                          <td className="px-3 py-3 text-xs leading-relaxed text-ink-600">
                            Start Family Intake to submit this child for enrollment review.
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="min-w-[6rem] px-2.5"
                                onClick={() => setActiveChildDetailsId(row.childId)}
                              >
                                View details
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="min-w-[6rem] px-2.5"
                                onClick={() => requestDeleteProfile(row.childId)}
                                isLoading={activeProfileActionId === row.childId}
                                loadingText="Deleting"
                                leftIcon={<Trash2 className="h-4 w-4" />}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    const allowedCadences = row.canSecureAll ? getAllowedCadencesForGroup(row.items) : [];
                    const requestInfoCount =
                      row.statusSummary.find((statusItem) => statusItem.status === 'REQUEST_INFO')?.count ?? 0;
                    const pendingCount =
                      row.statusSummary.find((statusItem) => statusItem.status === 'PENDING')?.count ?? 0;
                    const waitlistCount =
                      row.statusSummary.find((statusItem) => statusItem.status === 'WAITLISTED')?.count ?? 0;
                    const deniedCount =
                      row.statusSummary.find((statusItem) => statusItem.status === 'DENIED')?.count ?? 0;

                    let nextStep = 'Open details to review full status history.';
                    if (row.canSecureAll) {
                      nextStep = 'All approvals are ready. Use details to complete one combined secure-spot checkout.';
                    } else if (row.secureSpotCount > 0) {
                      nextStep = `${row.secureSpotCount} approved enrollment${row.secureSpotCount === 1 ? '' : 's'} waiting for secure-spot checkout.`;
                    } else if (requestInfoCount > 0) {
                      nextStep = `${requestInfoCount} enrollment${requestInfoCount === 1 ? '' : 's'} need additional family information.`;
                    } else if (pendingCount > 0) {
                      nextStep = `Admissions review in progress for ${pendingCount} enrollment${pendingCount === 1 ? '' : 's'}.`;
                    } else if (waitlistCount > 0) {
                      nextStep = `${waitlistCount} enrollment${waitlistCount === 1 ? '' : 's'} currently on the waitlist.`;
                    } else if (deniedCount > 0) {
                      nextStep = `${deniedCount} enrollment${deniedCount === 1 ? '' : 's'} denied. Open details for notes.`;
                    }

                    return (
                      <tr key={row.key} className="border-t border-line bg-white/90 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-ink-900">{row.title}</p>
                          <p className="mt-1 text-xs text-ink-500">{row.subtitle}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-sm font-medium leading-relaxed text-ink-800">{row.childrenLabel}</p>
                          <p className="mt-1 text-xs leading-relaxed text-ink-500">{row.profileLabel}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {row.statusSummary.map((statusItem) => (
                              <Badge key={statusItem.status} variant={enrollmentVariant(statusItem.status)}>
                                {statusItem.label}
                              </Badge>
                            ))}
                            {row.canSecureAll ? <Badge variant="success">Ready for combined checkout</Badge> : null}
                            {!row.canSecureAll && row.secureSpotCount > 0 ? (
                              <Badge variant="info">{row.secureSpotCount} awaiting secure spot</Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-xs text-ink-500">{row.subtitle}</p>
                        </td>
                        <td className="px-3 py-3 text-ink-700">
                          <p className="text-sm font-medium text-ink-800">{row.programLabel}</p>
                        </td>
                        <td className="px-3 py-3 text-xs leading-relaxed text-ink-600">{nextStep}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              size="sm"
                              className="min-w-[6rem] px-3"
                              onClick={() => setActiveBatchGroupKey(row.groupKey)}
                            >
                              View details
                            </Button>
                            {row.canSecureAll ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="min-w-[6rem] px-3"
                                onClick={() =>
                                  startGroupSecureCheckout(
                                    row.groupKey,
                                    row.items.map((item) => item.id),
                                    allowedCadences
                                  )
                                }
                                disabled={!allowedCadences.length}
                                isLoading={isBatchPending}
                                loadingText="Opening"
                              >
                                Secure Spots
                              </Button>
                            ) : null}
                          </div>
                          {groupCheckoutErrors[row.groupKey] ? (
                            <p className="mt-1 text-xs font-medium text-rose-600">
                              {groupCheckoutErrors[row.groupKey]}
                            </p>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="state-empty">No child profiles or enrollment records yet.</div>
        )}
      </Card>

      <Dialog open={Boolean(activeBatchGroup)} onOpenChange={(open) => (!open ? setActiveBatchGroupKey(null) : null)}>
        <DialogContent className="w-[min(96vw,56rem)] max-h-[88vh] overflow-y-auto bg-white">
          {activeBatchGroup ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Intake batch details ({activeBatchGroup.items.length} children)
                </DialogTitle>
                <DialogDescription>
                  Submitted {formatDateTime(activeBatchGroup.submittedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                {activeBatchGroup.items.map((enrollment) => renderEnrollmentDetail(enrollment))}
              </div>

              {activeBatchGroup.canSecureAll ? (
                <div className="rounded-field border border-sky-200 bg-sky-50/75 p-3">
                  <p className="text-sm font-semibold text-sky-900">All children in this batch are approved</p>
                  <p className="mt-1 text-xs text-sky-800">
                    Complete one secure-spot checkout for this batch.
                  </p>
                  {(() => {
                    const allowedCadences = getAllowedCadencesForGroup(activeBatchGroup.items);
                    const selectedCadence = resolveGroupCadence(activeBatchGroup.groupKey, allowedCadences);
                    return (
                      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                        <Select
                          label="Tuition cadence"
                          value={selectedCadence}
                          onChange={(event) =>
                            setGroupCadenceSelections((prev) => ({
                              ...prev,
                              [activeBatchGroup.groupKey]: event.target.value as Cadence,
                            }))
                          }
                          disabled={isBatchPending || !allowedCadences.length}
                        >
                          {allowedCadences.includes('MONTHLY') ? <option value="MONTHLY">Monthly</option> : null}
                          {allowedCadences.includes('BIWEEKLY') ? <option value="BIWEEKLY">Biweekly</option> : null}
                          {allowedCadences.includes('WEEKLY') ? <option value="WEEKLY">Weekly</option> : null}
                        </Select>
                        <Button
                          className="px-6"
                          onClick={() =>
                            startGroupSecureCheckout(
                              activeBatchGroup.groupKey,
                              activeBatchGroup.items.map((item) => item.id),
                              allowedCadences
                            )
                          }
                          disabled={!allowedCadences.length}
                          isLoading={isBatchPending}
                          loadingText="Opening checkout"
                        >
                          Secure Spots
                        </Button>
                      </div>
                    );
                  })()}
                  {groupCheckoutErrors[activeBatchGroup.groupKey] ? (
                    <p className="mt-2 text-sm font-medium text-rose-600">
                      {groupCheckoutErrors[activeBatchGroup.groupKey]}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(submittedBatch)} onOpenChange={(open) => (!open ? setSubmittedBatch(null) : null)}>
        <DialogContent className="w-[min(96vw,40rem)] bg-white">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Enrollment Requests Sent
            </DialogTitle>
            <DialogDescription>
              Your requests have been sent to Admissions. We will post updates in your Notifications Hub and Enrollment Status timeline.
            </DialogDescription>
          </DialogHeader>

          {submittedBatch ? (
            <div className="rounded-field border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              <p className="font-semibold">
                {submittedBatch.summary.enrollmentsSubmitted} enrollment request{submittedBatch.summary.enrollmentsSubmitted === 1 ? '' : 's'} submitted.
              </p>
              {submittedBatch.enrollments.length ? (
                <ul className="mt-2 space-y-1 text-emerald-700">
                  {submittedBatch.enrollments.map((enrollment) => (
                    <li key={enrollment.id}>
                      • {enrollment.child.firstName} {enrollment.child.lastName} ({enrollment.programType.replace('_', ' ')})
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button onClick={() => setSubmittedBatch(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => (!open ? setDeleteTargetId(null) : null)}>
        <DialogContent className="w-[min(96vw,30rem)]">
          <DialogHeader>
            <DialogTitle>Delete child profile permanently?</DialogTitle>
            <DialogDescription>
              This permanently removes the profile from Family Hub. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProfile}
              isLoading={Boolean(deleteTargetId && activeProfileActionId === deleteTargetId)}
              loadingText="Deleting"
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(activeChildProfile)} onOpenChange={(open) => (!open ? setActiveChildDetailsId(null) : null)}>
        <DialogContent className="w-[min(96vw,52rem)] max-h-[88vh] overflow-y-auto bg-white">
          {activeChildProfile ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {activeChildProfile.child.firstName} {activeChildProfile.child.lastName}
                </DialogTitle>
                <DialogDescription>
                  Full child profile and enrollment details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-field border border-line bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Profile Basics</p>
                    <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                      <p><span className="font-medium text-ink-900">Preferred name:</span> {displayText(activeChildProfile.child.preferredName)}</p>
                      <p><span className="font-medium text-ink-900">Date of birth:</span> {formatDateLabel(activeChildProfile.child.dateOfBirth)}</p>
                      <p><span className="font-medium text-ink-900">Age:</span> {getChildAgeLabel(activeChildProfile.child.dateOfBirth)}</p>
                      <p><span className="font-medium text-ink-900">Gender:</span> {displayText(activeChildProfile.child.gender)}</p>
                      <p><span className="font-medium text-ink-900">Pronouns:</span> {displayText(activeChildProfile.child.pronouns)}</p>
                      <p><span className="font-medium text-ink-900">Grade:</span> {displayText(activeChildProfile.child.gradeLevel)}</p>
                      <p><span className="font-medium text-ink-900">School:</span> {displayText(activeChildProfile.child.schoolName)}</p>
                    </div>
                  </div>

                  <div className="rounded-field border border-line bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Care Details</p>
                    <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                      <p><span className="font-medium text-ink-900">Allergies:</span> {displayText(activeChildProfile.child.allergies)}</p>
                      <p><span className="font-medium text-ink-900">Medical notes:</span> {displayText(activeChildProfile.child.medicalNotes)}</p>
                      <p><span className="font-medium text-ink-900">Emergency contact:</span> {displayText(activeChildProfile.child.emergencyContactName)}</p>
                      <p><span className="font-medium text-ink-900">Emergency phone:</span> {displayText(activeChildProfile.child.emergencyContactPhone)}</p>
                      <p><span className="font-medium text-ink-900">Language:</span> {displayText(activeChildProfile.child.languagePreferences)}</p>
                      <p><span className="font-medium text-ink-900">Potty training:</span> {displayText(activeChildProfile.child.pottyTrainingStatus)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-field border border-line bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Preferences</p>
                    <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                      <p><span className="font-medium text-ink-900">Favorite activities:</span> {displayText(activeChildProfile.child.favoriteActivities)}</p>
                      <p><span className="font-medium text-ink-900">Favorite foods:</span> {displayText(activeChildProfile.child.favoriteFoods)}</p>
                      <p><span className="font-medium text-ink-900">Favorite toys:</span> {displayText(activeChildProfile.child.favoriteToys)}</p>
                      <p><span className="font-medium text-ink-900">Comfort items:</span> {displayText(activeChildProfile.child.comfortItems)}</p>
                      <p><span className="font-medium text-ink-900">Learning style:</span> {displayText(activeChildProfile.child.learningStyle)}</p>
                      <p><span className="font-medium text-ink-900">Nap schedule:</span> {displayText(activeChildProfile.child.napSchedule)}</p>
                      <p><span className="font-medium text-ink-900">Temperament:</span> {displayText(activeChildProfile.child.temperamentNotes)}</p>
                    </div>
                  </div>

                  <div className="rounded-field border border-line bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Enrollment Summary</p>
                    {activeChildProfile.latestEnrollment ? (
                      <div className="mt-2 space-y-2 text-sm text-ink-700">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={enrollmentVariant(activeChildProfile.latestEnrollment.status)}>
                            {activeChildProfile.latestEnrollment.status.replace('_', ' ')}
                          </Badge>
                          {activeChildProfile.latestEnrollment.spotSecuredAt ? (
                            <Badge variant="success">Seat secured</Badge>
                          ) : null}
                        </div>
                        <p><span className="font-medium text-ink-900">Program:</span> {formatProgramLabel(activeChildProfile.latestEnrollment.programType)}</p>
                        <p><span className="font-medium text-ink-900">Start date:</span> {formatDateLabel(activeChildProfile.latestEnrollment.startDate)}</p>
                        <p><span className="font-medium text-ink-900">Submitted:</span> {formatDateTime(activeChildProfile.latestEnrollment.createdAt)}</p>
                        <p><span className="font-medium text-ink-900">Review notes:</span> {displayText(activeChildProfile.latestEnrollment.reviewNotes)}</p>
                        <p><span className="font-medium text-ink-900">Decision reason:</span> {displayText(activeChildProfile.latestEnrollment.decisionReason)}</p>
                        <p><span className="font-medium text-ink-900">Admissions notes:</span> {displayText(activeChildProfile.latestEnrollment.notes)}</p>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-ink-600">No enrollment records yet. This is a profile-only child.</div>
                    )}
                  </div>
                </div>

                {activeChildProfile.enrollments.length > 1 ? (
                  <div className="rounded-field border border-line bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Enrollment History</p>
                    <div className="mt-2 space-y-2">
                      {activeChildProfile.enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-field border border-line bg-bg-soft px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-ink-900">{formatProgramLabel(enrollment.programType)}</p>
                            <p className="text-xs text-ink-500">
                              Submitted {formatDateTime(enrollment.createdAt)} • Start {formatDateLabel(enrollment.startDate)}
                            </p>
                          </div>
                          <Badge variant={enrollmentVariant(enrollment.status)}>
                            {enrollment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setActiveChildDetailsId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
