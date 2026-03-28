'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  Search,
  UserRound,
} from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  type AdmissionsPaymentState,
  formatAdmissionStatusSummary,
  rebuildGroupedAdmissionsRow,
  type AdmissionsEnrollmentStatus,
  type GroupedAdmissionsChild,
  type GroupedAdmissionsRow,
} from '@/lib/v3/admissions';
import { getUiRevampFlags } from '@/lib/ui-revamp';

const FILTER_STATUSES = ['PENDING', 'REQUEST_INFO', 'WAITLISTED'] as const;
type QueueFilterStatus = (typeof FILTER_STATUSES)[number];
const DECISION_STATUSES: AdmissionsEnrollmentStatus[] = ['APPROVED', 'REQUEST_INFO', 'WAITLISTED', 'DENIED', 'PENDING'];
const STATUS_ORDER: AdmissionsEnrollmentStatus[] = ['PENDING', 'REQUEST_INFO', 'APPROVED', 'WAITLISTED', 'DENIED'];

function statusVariant(status: AdmissionsEnrollmentStatus): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'APPROVED') return 'success';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO') return 'warning';
  if (status === 'DENIED') return 'danger';
  if (status === 'PENDING') return 'info';
  return 'default';
}

function toTitle(status: AdmissionsEnrollmentStatus) {
  return status.replace('_', ' ');
}

function paymentStateLabel(state: AdmissionsPaymentState) {
  if (state === 'SECURED') return 'Spot secured';
  if (state === 'HOLD_EXPIRING') return 'Hold expiring soon';
  if (state === 'AWAITING_SECURE_SPOT') return 'Awaiting secure-spot payment';
  return 'No billing handoff';
}

function paymentStateVariant(state: AdmissionsPaymentState): 'default' | 'info' | 'warning' | 'success' {
  if (state === 'SECURED') return 'success';
  if (state === 'HOLD_EXPIRING') return 'warning';
  if (state === 'AWAITING_SECURE_SPOT') return 'info';
  return 'default';
}

function formatHoldCountdown(value: string | null) {
  if (!value) return 'No hold timer set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No hold timer set';
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) return 'Hold expired';
  const totalMinutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m remaining`;
}

function defaultReviewNotes(status: AdmissionsEnrollmentStatus) {
  if (status === 'APPROVED') return 'Approved in admissions decision desk.';
  if (status === 'DENIED') return 'Denied in admissions decision desk.';
  if (status === 'REQUEST_INFO') return 'Requested additional family information.';
  if (status === 'WAITLISTED') return 'Moved to waitlist in admissions decision desk.';
  return 'Decision updated in admissions decision desk.';
}

function rowPriorityScore(row: GroupedAdmissionsRow) {
  const requestInfo = row.statusCounts.REQUEST_INFO;
  const pending = row.statusCounts.PENDING;
  const waitlisted = row.statusCounts.WAITLISTED;
  if (requestInfo > 0) return 0;
  if (row.batchReadiness.readyToApproveCount > 0) return 1;
  if (pending > 0) return 2;
  if (waitlisted > 0) return 3;
  return 4;
}

function rowPriorityLabel(row: GroupedAdmissionsRow): { label: string; variant: 'default' | 'info' | 'warning' | 'success' } {
  if (row.statusCounts.REQUEST_INFO > 0) {
    return { label: 'Needs family info', variant: 'warning' };
  }
  if (row.batchReadiness.readyToApproveCount > 0) {
    return { label: 'Ready to approve', variant: 'success' };
  }
  if (row.statusCounts.PENDING > 0) {
    return { label: 'In review', variant: 'info' };
  }
  if (row.statusCounts.WAITLISTED > 0) {
    return { label: 'Waitlist follow-up', variant: 'warning' };
  }
  return { label: 'No action', variant: 'default' };
}

function buildReminderDraft(input: {
  child: GroupedAdmissionsChild;
  parentFirstName: string;
}) {
  const childName = `${input.child.child.firstName} ${input.child.child.lastName}`;
  const firstName = input.parentFirstName || 'Parent';
  const holdExpiresAt = input.child.handoff.holdExpiresAt
    ? formatDateTime(input.child.handoff.holdExpiresAt)
    : 'the current hold deadline';

  if (input.child.handoff.paymentState === 'HOLD_EXPIRING') {
    return {
      subject: `${childName}: hold expires soon`,
      message: `Hi ${firstName}, ${childName} is approved and the secure-spot hold expires at ${holdExpiresAt}. Complete secure-spot checkout in Family Hub to keep this start date.`,
    };
  }

  if (input.child.handoff.paymentState === 'AWAITING_SECURE_SPOT') {
    return {
      subject: `${childName}: complete secure-spot checkout`,
      message: `Hi ${firstName}, ${childName} is approved and waiting for secure-spot checkout. Please open Family Hub to complete payment and secure the seat.`,
    };
  }

  if (input.child.status === 'REQUEST_INFO') {
    return {
      subject: `${childName}: information needed`,
      message: `Hi ${firstName}, we need additional intake information before we can finalize ${childName}'s enrollment. Please review your Family Hub intake details and submit the required updates.`,
    };
  }

  return {
    subject: `${childName} enrollment update`,
    message: `Hi ${firstName}, this is an update on ${childName}'s enrollment status. Please review Family Hub for current next steps.`,
  };
}

function selectedChildMissingFields(child: GroupedAdmissionsChild) {
  const fields = new Set(child.intakeMissingFields || []);
  if (!child.startDate) fields.add('startDate');
  return Array.from(fields);
}

function getHandoffState(input: {
  status: AdmissionsEnrollmentStatus;
  spotHoldExpiresAt: string | null;
  spotSecuredAt: string | null;
  selectedCadence: GroupedAdmissionsChild['selectedCadence'];
}) {
  const nowMs = Date.now();
  const holdMs = input.spotHoldExpiresAt ? new Date(input.spotHoldExpiresAt).getTime() - nowMs : null;
  const isHoldExpiringSoon = typeof holdMs === 'number' && holdMs > 0 && holdMs <= 24 * 60 * 60 * 1000;

  let paymentState: AdmissionsPaymentState = 'NOT_APPLICABLE';
  if (input.status === 'APPROVED' && input.spotSecuredAt) {
    paymentState = 'SECURED';
  } else if (input.status === 'APPROVED' && isHoldExpiringSoon) {
    paymentState = 'HOLD_EXPIRING';
  } else if (input.status === 'APPROVED') {
    paymentState = 'AWAITING_SECURE_SPOT';
  }

  return {
    paymentState,
    holdExpiresAt: input.spotHoldExpiresAt,
    spotSecuredAt: input.spotSecuredAt,
    selectedCadence: input.selectedCadence,
    isHoldExpiringSoon,
  };
}

interface Props {
  rows: GroupedAdmissionsRow[];
  crmContextByParentId?: Record<
    string,
    {
      ownerName: string | null;
      nextFollowUpAt: string | null;
    }
  >;
  initialFamilyId?: string | null;
  initialEnrollmentId?: string | null;
  canSendNotifications?: boolean;
  canReadSensitive?: boolean;
  connectedMode?: boolean;
}

function applyEnrollmentUpdate(
  previousRows: GroupedAdmissionsRow[],
  groupKey: string,
  enrollmentId: string,
  updatedEnrollment: {
    status: AdmissionsEnrollmentStatus;
    programType: string;
    startDate: string | null;
    notes: string | null;
    reviewNotes: string | null;
    decisionReason: string | null;
    spotHoldExpiresAt: string | null;
    spotSecuredAt: string | null;
    selectedCadence: GroupedAdmissionsChild['selectedCadence'];
  },
) {
  return previousRows.map((groupRow) => {
    if (groupRow.groupKey !== groupKey) return groupRow;

    const nextChildren = groupRow.children.map((child) => {
      if (child.enrollmentId !== enrollmentId) return child;
      return {
        ...child,
        status: updatedEnrollment.status,
        programType: updatedEnrollment.programType as GroupedAdmissionsChild['programType'],
        startDate: updatedEnrollment.startDate,
        notes: updatedEnrollment.notes,
        reviewNotes: updatedEnrollment.reviewNotes,
        decisionReason: updatedEnrollment.decisionReason,
        spotHoldExpiresAt: updatedEnrollment.spotHoldExpiresAt,
        spotSecuredAt: updatedEnrollment.spotSecuredAt,
        selectedCadence: updatedEnrollment.selectedCadence,
        handoff: getHandoffState({
          status: updatedEnrollment.status,
          spotHoldExpiresAt: updatedEnrollment.spotHoldExpiresAt,
          spotSecuredAt: updatedEnrollment.spotSecuredAt,
          selectedCadence: updatedEnrollment.selectedCadence,
        }),
      };
    });

    return rebuildGroupedAdmissionsRow({
      ...groupRow,
      children: nextChildren,
    });
  });
}

export function AdmissionsTable({
  rows,
  crmContextByParentId = {},
  initialFamilyId = null,
  initialEnrollmentId = null,
  canSendNotifications = false,
  canReadSensitive = false,
  connectedMode = true,
}: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QueueFilterStatus>('ALL');
  const [tableRows, setTableRows] = useState(rows);
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

  const [decisionStatus, setDecisionStatus] = useState<AdmissionsEnrollmentStatus>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyError, setNotifyError] = useState('');
  const [notifySuccess, setNotifySuccess] = useState('');

  const [batchReason, setBatchReason] = useState('');
  const [batchStartDate, setBatchStartDate] = useState('');
  const [batchDecisionError, setBatchDecisionError] = useState('');
  const [batchDecisionSuccess, setBatchDecisionSuccess] = useState('');

  const [isPending, startTransition] = useTransition();
  const [isSendingNotification, startSendingNotification] = useTransition();
  const decisionStartedAtRef = useRef<number>(Date.now());
  const batchStartedAtRef = useRef<number>(Date.now());
  const didApplyInitialSelectionRef = useRef(false);
  const revampPhase = useMemo(() => getUiRevampFlags().phase, []);

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  const queueRows = useMemo(
    () =>
      tableRows
        .map((row) => {
          const actionableChildren = row.children.filter(
            (child) => child.status !== 'APPROVED' && child.status !== 'DENIED',
          );
          if (!actionableChildren.length) return null;
          return rebuildGroupedAdmissionsRow({
            ...row,
            children: actionableChildren,
          });
        })
        .filter((row): row is GroupedAdmissionsRow => Boolean(row)),
    [tableRows],
  );

  const queueMetrics = useMemo(
    () => ({
      batches: queueRows.length,
      children: queueRows.reduce((total, row) => total + row.children.length, 0),
      ready: queueRows.reduce((total, row) => total + row.batchReadiness.readyToApproveCount, 0),
      exceptions: queueRows.reduce((total, row) => total + row.batchReadiness.exceptionCount, 0),
    }),
    [queueRows],
  );

  const statusQuickCounts = useMemo(() => {
    return FILTER_STATUSES.reduce<Record<QueueFilterStatus, number>>((acc, status) => {
      acc[status] = queueRows.reduce(
        (total, row) => total + row.children.filter((child) => child.status === status).length,
        0,
      );
      return acc;
    }, {
      PENDING: 0,
      REQUEST_INFO: 0,
      WAITLISTED: 0,
    });
  }, [queueRows]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filteredRows = queueRows.filter((row) => {
      const statusOk =
        statusFilter === 'ALL' ? true : row.children.some((child) => child.status === statusFilter);
      if (!statusOk) return false;
      if (!q) return true;

      const childrenText = row.children
        .map((child) => `${child.child.firstName} ${child.child.lastName}`)
        .join(' ');
      const programsText = row.programs.join(' ');
      const hay = [
        row.parent.firstName,
        row.parent.lastName,
        row.parent.email,
        childrenText,
        programsText,
      ]
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
    return [...filteredRows].sort((a, b) => {
      const priorityDiff = rowPriorityScore(a) - rowPriorityScore(b);
      if (priorityDiff !== 0) return priorityDiff;

      const exceptionDiff = b.batchReadiness.exceptionCount - a.batchReadiness.exceptionCount;
      if (exceptionDiff !== 0) return exceptionDiff;

      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [query, queueRows, statusFilter]);

  const hasFilters = Boolean(query.trim()) || statusFilter !== 'ALL';

  const activeGroup = useMemo(
    () => (activeGroupKey ? queueRows.find((row) => row.groupKey === activeGroupKey) ?? null : null),
    [activeGroupKey, queueRows],
  );

  const selectedChild = useMemo(() => {
    if (!activeGroup) return null;
    if (selectedEnrollmentId) {
      const exact = activeGroup.children.find((child) => child.enrollmentId === selectedEnrollmentId);
      if (exact) return exact;
    }
    return activeGroup.children[0] ?? null;
  }, [activeGroup, selectedEnrollmentId]);

  useEffect(() => {
    if (!activeGroup) {
      setSelectedEnrollmentId(null);
      return;
    }
    if (!selectedChild) return;

    setSelectedEnrollmentId(selectedChild.enrollmentId);
    setDecisionStatus(selectedChild.status === 'PENDING' ? 'APPROVED' : selectedChild.status);
    setReviewNotes(selectedChild.reviewNotes || '');
    setDecisionReason(selectedChild.decisionReason || '');
    setStartDate(selectedChild.startDate ? selectedChild.startDate.slice(0, 10) : '');
    if (connectedMode) {
      const reminderDraft = buildReminderDraft({
        child: selectedChild,
        parentFirstName: activeGroup.parent.firstName,
      });
      setNotifySubject(reminderDraft.subject);
      setNotifyMessage(reminderDraft.message);
    } else {
      setNotifySubject(`${selectedChild.child.firstName} ${selectedChild.child.lastName} enrollment update`);
      setNotifyMessage('');
    }
    setError('');
    setSuccess('');
    setNotifyError('');
    setNotifySuccess('');
    decisionStartedAtRef.current = Date.now();

    const firstStartDate = activeGroup.children.find((child) => child.startDate)?.startDate ?? '';
    setBatchStartDate(firstStartDate ? firstStartDate.slice(0, 10) : '');
    setBatchReason('');
    setBatchDecisionError('');
    setBatchDecisionSuccess('');
    batchStartedAtRef.current = Date.now();
  }, [activeGroup, connectedMode, selectedChild]);

  useEffect(() => {
    if (!activeGroupKey) return;
    if (queueRows.some((row) => row.groupKey === activeGroupKey)) return;
    setActiveGroupKey(null);
    setSelectedEnrollmentId(null);
  }, [activeGroupKey, queueRows]);

  useEffect(() => {
    if (!activeGroupKey && filtered.length) {
      setActiveGroupKey(filtered[0].groupKey);
    }
  }, [activeGroupKey, filtered]);

  useEffect(() => {
    if (didApplyInitialSelectionRef.current) return;
    if (!initialFamilyId) return;
    const match = queueRows.find((row) => row.parent.id === initialFamilyId);
    if (!match) return;
    didApplyInitialSelectionRef.current = true;
    setActiveGroupKey(match.groupKey);
    setSelectedEnrollmentId(
      initialEnrollmentId && match.children.some((child) => child.enrollmentId === initialEnrollmentId)
        ? initialEnrollmentId
        : match.children[0]?.enrollmentId ?? null,
    );
  }, [initialEnrollmentId, initialFamilyId, queueRows]);

  function openGroup(row: GroupedAdmissionsRow) {
    setActiveGroupKey(row.groupKey);
    setSelectedEnrollmentId(row.children[0]?.enrollmentId ?? null);
    setIsChildModalOpen(false);
    setError('');
    setSuccess('');
    setNotifyError('');
    setNotifySuccess('');
  }

  useEffect(() => {
    if (!activeGroup || !selectedChild) {
      setIsChildModalOpen(false);
    }
  }, [activeGroup, selectedChild]);

  const moveChildSelection = useCallback((offset: -1 | 1) => {
    if (!activeGroup || !activeGroup.children.length) return;
    const currentIndex = activeGroup.children.findIndex((child) => child.enrollmentId === selectedEnrollmentId);
    const fallbackIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (fallbackIndex + offset + activeGroup.children.length) % activeGroup.children.length;
    setSelectedEnrollmentId(activeGroup.children[nextIndex]?.enrollmentId ?? null);
  }, [activeGroup, selectedEnrollmentId]);

  useEffect(() => {
    if (!activeGroup || activeGroup.children.length <= 1) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      moveChildSelection(event.key === 'ArrowRight' ? 1 : -1);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGroup, moveChildSelection]);

  function selectedPayloadData(child: GroupedAdmissionsChild) {
    return {
      parentId: activeGroup?.parent.id ?? '',
      childId: child.child.id,
      enrollmentId: child.enrollmentId,
      childName: `${child.child.firstName} ${child.child.lastName}`,
    };
  }

  function submitDecision(statusOverride?: AdmissionsEnrollmentStatus) {
    if (!activeGroup || !selectedChild) return;

    setError('');
    setSuccess('');

    const statusToApply = statusOverride ?? decisionStatus;
    const nextReviewNotes = reviewNotes.trim() || defaultReviewNotes(statusToApply);
    const nextDecisionReason = decisionReason.trim() || null;
    const now = Date.now();

    startTransition(async () => {
      const response = await fetch(`/api/v3/admin/admissions/${selectedChild.enrollmentId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusToApply,
          reviewNotes: nextReviewNotes,
          decisionReason: nextDecisionReason,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          clientMetrics: {
            flow: 'ADMIN_DECISION',
            elapsedMs: Math.max(0, now - decisionStartedAtRef.current),
            startedAt: new Date(decisionStartedAtRef.current).toISOString(),
            completedAt: new Date(now).toISOString(),
            phase: revampPhase,
          },
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to save enrollment decision.');
        return;
      }

      const updatedEnrollment = payload?.enrollment;
      if (!updatedEnrollment) {
        setError('Decision saved but response was incomplete. Refreshing view is recommended.');
        return;
      }

      setTableRows((previousRows) =>
        applyEnrollmentUpdate(previousRows, activeGroup.groupKey, selectedChild.enrollmentId, updatedEnrollment),
      );

      setDecisionStatus(statusToApply);
      setReviewNotes(nextReviewNotes);
      setSuccess(
        statusOverride ? `${toTitle(statusToApply)} applied for this child.` : 'Decision saved for this child.',
      );
      decisionStartedAtRef.current = Date.now();
    });
  }

  function submitBatchDecision(action: 'APPROVE_BATCH' | 'REQUEST_INFO_BATCH' | 'DENY_BATCH') {
    if (!activeGroup) return;

    setBatchDecisionError('');
    setBatchDecisionSuccess('');

    const targets = activeGroup.children.filter((child) => child.status !== 'APPROVED' && child.status !== 'DENIED');
    if (!targets.length) {
      setBatchDecisionSuccess('No unresolved children left in this batch.');
      return;
    }

    const now = Date.now();

    startTransition(async () => {
      if (activeGroup.intakeBatchId) {
        const response = await fetch(
          `/api/v3/admin/admissions/batches/${encodeURIComponent(activeGroup.intakeBatchId)}/decision`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              reason: batchReason || null,
              reviewNotes:
                batchReason && batchReason.trim().length >= 2
                  ? batchReason
                  : action === 'APPROVE_BATCH'
                    ? 'Approved in batch review.'
                    : action === 'REQUEST_INFO_BATCH'
                      ? 'Requested additional information in batch review.'
                      : 'Denied in batch review.',
              startDate: batchStartDate ? new Date(batchStartDate).toISOString() : null,
              clientMetrics: {
                flow: 'ADMIN_BATCH_DECISION',
                elapsedMs: Math.max(0, now - batchStartedAtRef.current),
                startedAt: new Date(batchStartedAtRef.current).toISOString(),
                completedAt: new Date(now).toISOString(),
                phase: revampPhase,
              },
            }),
          },
        );

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setBatchDecisionError(payload?.error?.message || 'Unable to apply batch decision.');
          return;
        }

        const updatedEnrollments = Array.isArray(payload?.updatedEnrollments)
          ? payload.updatedEnrollments
          : [];

        if (updatedEnrollments.length) {
          setTableRows((previousRows) => {
            let nextRows = previousRows;
            for (const updated of updatedEnrollments) {
              nextRows = applyEnrollmentUpdate(nextRows, activeGroup.groupKey, updated.id, {
                status: updated.status,
                programType: updated.programType,
                startDate: updated.startDate,
                notes: updated.notes,
                reviewNotes: updated.reviewNotes,
                decisionReason: updated.decisionReason,
                spotHoldExpiresAt: updated.spotHoldExpiresAt,
                spotSecuredAt: updated.spotSecuredAt ?? null,
                selectedCadence: updated.selectedCadence ?? null,
              });
            }
            return nextRows;
          });
        }

        const successMessage =
          payload?.messages?.join(' ') ||
          `Updated ${payload?.updatedCount ?? updatedEnrollments.length} enrollment(s) in this batch.`;
        setBatchDecisionSuccess(successMessage);
        batchStartedAtRef.current = Date.now();
        return;
      }

      const fallbackStatus =
        action === 'APPROVE_BATCH'
          ? 'APPROVED'
          : action === 'REQUEST_INFO_BATCH'
            ? 'REQUEST_INFO'
            : 'DENIED';

      const fallbackResults = await Promise.all(
        targets.map(async (child) => {
          const computedStartDate =
            action === 'APPROVE_BATCH'
              ? batchStartDate
                ? new Date(batchStartDate).toISOString()
                : child.startDate
              : child.startDate;

          const response = await fetch(`/api/v3/admin/admissions/${child.enrollmentId}/decision`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: fallbackStatus,
              reviewNotes:
                batchReason && batchReason.trim().length >= 2
                  ? batchReason
                  : action === 'APPROVE_BATCH'
                    ? 'Approved in batch review.'
                    : action === 'REQUEST_INFO_BATCH'
                      ? 'Requested additional information in batch review.'
                      : 'Denied in batch review.',
              decisionReason: batchReason || null,
              startDate: computedStartDate,
              clientMetrics: {
                flow: 'ADMIN_BATCH_DECISION',
                elapsedMs: Math.max(0, now - batchStartedAtRef.current),
                startedAt: new Date(batchStartedAtRef.current).toISOString(),
                completedAt: new Date(now).toISOString(),
                phase: revampPhase,
              },
            }),
          });

          const payload = await response.json().catch(() => null);
          return { child, response, payload };
        }),
      );

      const failures: string[] = [];
      let updatedCount = 0;

      for (const result of fallbackResults) {
        if (!result.response.ok || !result.payload?.enrollment) {
          failures.push(`${result.child.child.firstName} ${result.child.child.lastName}`);
          continue;
        }

        setTableRows((previousRows) =>
          applyEnrollmentUpdate(previousRows, activeGroup.groupKey, result.child.enrollmentId, result.payload.enrollment),
        );
        updatedCount += 1;
      }

      if (failures.length) {
        setBatchDecisionError(
          `Updated ${updatedCount}/${targets.length}. Could not update: ${failures.join(', ')}.`,
        );
      }

      if (updatedCount > 0) {
        setBatchDecisionSuccess(`Batch action updated ${updatedCount} child${updatedCount === 1 ? '' : 'ren'}.`);
      }

      batchStartedAtRef.current = Date.now();
    });
  }

  function sendNotification() {
    if (!activeGroup || !selectedChild) return;

    setNotifyError('');
    setNotifySuccess('');

    if (!notifySubject.trim() || !notifyMessage.trim()) {
      setNotifyError('Subject and message are required.');
      return;
    }

    const childContext = selectedPayloadData(selectedChild);

    startSendingNotification(async () => {
      const response = await fetch('/api/v3/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: childContext.parentId,
          childId: childContext.childId,
          enrollmentId: childContext.enrollmentId,
          type: 'ENROLLMENT',
          subject: notifySubject.trim(),
          message: notifyMessage.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setNotifyError(payload?.error?.message || 'Unable to send notification.');
        return;
      }

      setNotifySuccess(`Notification sent for ${childContext.childName}.`);
      setNotifyMessage('');
    });
  }

  const activeMissing = selectedChild ? selectedChildMissingFields(selectedChild) : [];
  const activePriority = activeGroup ? rowPriorityLabel(activeGroup) : null;
  const activeUnresolvedCount = activeGroup
    ? activeGroup.children.filter((child) => child.status !== 'APPROVED' && child.status !== 'DENIED').length
    : 0;
  const activeCrmContext = activeGroup ? crmContextByParentId[activeGroup.parent.id] : null;

  return (
    <section className="table-shell overflow-hidden rounded-[22px] border-white/70 shadow-float">
      <div
        className="border-b border-line/80 bg-white p-2.5 md:p-3"
        data-tour-id="admin-admissions-toolbar"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">Admissions Workspace</p>
            <h3 className="mt-1 text-lg font-semibold text-ink-900">Queue and Decision Desk</h3>
          </div>
          <p className="text-xs text-ink-600">Select family, open a child card, complete decisions in the modal.</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="default">Batches {queueMetrics.batches}</Badge>
          <Badge variant="info">Children {queueMetrics.children}</Badge>
          <Badge variant="success">Ready {queueMetrics.ready}</Badge>
          <Badge variant={queueMetrics.exceptions > 0 ? 'warning' : 'default'}>
            Exceptions {queueMetrics.exceptions}
          </Badge>
        </div>

        <div className="mt-2 rounded-[12px] border border-line/80 bg-white/94 p-2 shadow-sm">
          <div className="grid gap-1.5 md:grid-cols-[minmax(0,1fr)_14rem_auto] md:items-center">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search family, child, email, or program"
              startAdornment={<Search className="h-4 w-4" />}
            />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | QueueFilterStatus)}
            >
              <option value="ALL">All actionable statuses</option>
              {FILTER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {toTitle(status)}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery('');
                setStatusFilter('ALL');
              }}
              disabled={!hasFilters}
            >
              Reset
            </Button>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === 'ALL' ? 'primary' : 'ghost'}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({queueMetrics.children})
            </Button>
            {FILTER_STATUSES.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={statusFilter === status ? 'primary' : 'ghost'}
                onClick={() => setStatusFilter(status)}
              >
                {toTitle(status)} ({statusQuickCounts[status]})
              </Button>
            ))}
            <p className="ml-auto text-[11px] text-ink-500">
              {hasFilters ? 'Filtered queue' : 'Full queue'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[23rem_minmax(0,1fr)]">
        <aside className="border-b border-line/70 bg-white/86 xl:border-b-0 xl:border-r xl:border-line/70">
          <div className="border-b border-line/70 px-2.5 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Admissions queue</p>
            <p className="mt-1 text-xs text-ink-600">
              Sorted by urgency. {filtered.length} batch{filtered.length === 1 ? '' : 'es'} in view.
            </p>
          </div>
          <div className="max-h-[42rem] overflow-y-auto p-2.5">
            {filtered.length ? (
              <div className="space-y-1.5">
                {filtered.map((row, index) => {
                  const selected = row.groupKey === activeGroupKey;
                  const priority = rowPriorityLabel(row);
                  const topStatuses = STATUS_ORDER.filter((status) => row.statusCounts[status] > 0).slice(0, 3);
                  return (
                    <button
                      key={row.groupKey}
                      type="button"
                      onClick={() => openGroup(row)}
                      className={`w-full rounded-[12px] border p-2.5 text-left transition ${
                        selected
                          ? 'border-sky-300 bg-sky-50 shadow-sm ring-1 ring-sky-200'
                          : 'border-line bg-white hover:border-sky-200 hover:bg-sky-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink-900">
                          <span className="mr-1.5 text-[11px] font-medium text-ink-500">#{index + 1}</span>
                          {row.parent.firstName} {row.parent.lastName}
                        </p>
                        <Badge variant="info">{row.children.length}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-500">{row.parent.email}</p>
                      {crmContextByParentId[row.parent.id]?.ownerName ? (
                        <p className="mt-0.5 text-[11px] text-ink-600">
                          Owner: {crmContextByParentId[row.parent.id]?.ownerName}
                        </p>
                      ) : null}

                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge variant={priority.variant}>{priority.label}</Badge>
                        <Badge variant="success">{row.batchReadiness.readyToApproveCount} ready</Badge>
                        <Badge variant={row.batchReadiness.exceptionCount > 0 ? 'warning' : 'default'}>
                          {row.batchReadiness.exceptionCount} exceptions
                        </Badge>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {topStatuses.map((status) => (
                          <Badge key={status} variant={statusVariant(status)}>
                            {row.statusCounts[status]} {toTitle(status)}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-1.5 text-[11px] text-ink-500">Submitted {formatDateTime(row.submittedAt)}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="state-empty">
                {queueRows.length === 0
                  ? 'No actionable applications in queue.'
                  : 'No applications match current filters.'}
              </div>
            )}
          </div>
        </aside>

        <section className="min-h-[26rem] bg-white/70 p-2 md:p-2.5" data-tour-id="admin-admissions-table">
          {activeGroup ? (
            <div className="space-y-2">
              <article className="rounded-[12px] border border-line bg-white px-2.5 py-2 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-ink-900">
                      {activeGroup.parent.firstName} {activeGroup.parent.lastName}
                    </p>
                    <p className="text-[11px] text-ink-500">{activeGroup.parent.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {activePriority ? <Badge variant={activePriority.variant}>{activePriority.label}</Badge> : null}
                    <Badge variant="info">{activeUnresolvedCount} unresolved</Badge>
                    <Badge variant="success">{activeGroup.batchReadiness.readyToApproveCount} ready</Badge>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Button asChild size="sm" variant="outline">
                    <a href={`mailto:${activeGroup.parent.email}`}>Email Parent</a>
                  </Button>
                  {activeGroup.parent.phone ? (
                    <Button asChild size="sm" variant="ghost">
                      <a href={`tel:${activeGroup.parent.phone}`}>
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call Parent</span>
                      </a>
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => setIsChildModalOpen(true)}>
                    Open Decision Modal
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={`/admin/families?familyId=${encodeURIComponent(activeGroup.parent.id)}&tab=admissions`}
                    >
                      Open Family CRM
                    </a>
                  </Button>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-600">
                  <span>CRM owner: {activeCrmContext?.ownerName || 'Unassigned'}</span>
                  <span>•</span>
                  <span>
                    Next follow-up:{' '}
                    {activeCrmContext?.nextFollowUpAt ? formatDate(activeCrmContext.nextFollowUpAt) : 'Not scheduled'}
                  </span>
                </div>
              </article>

              <article className="rounded-[12px] border border-line bg-white p-2.5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Children</p>
                  <p className="text-[11px] text-ink-500">Select a child card to review in modal</p>
                </div>
                <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                  {activeGroup.children.map((child) => {
                    const missingCount = selectedChildMissingFields(child).length;
                    return (
                      <button
                        key={child.enrollmentId}
                        type="button"
                        onClick={() => {
                          setSelectedEnrollmentId(child.enrollmentId);
                          setIsChildModalOpen(true);
                        }}
                        className={`rounded-[10px] border px-2.5 py-2 text-left transition ${
                          child.enrollmentId === selectedEnrollmentId
                            ? 'border-sky-300 bg-sky-50'
                            : 'border-line bg-white hover:border-sky-200 hover:bg-sky-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-ink-900">
                            {child.child.firstName} {child.child.lastName}
                          </p>
                          <Badge variant={statusVariant(child.status)}>{toTitle(child.status)}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-ink-600">{child.programType.replace('_', ' ')} program</p>
                        <p className="mt-1 text-[11px] text-ink-500">
                          {missingCount ? `${missingCount} fields missing` : 'Ready to decide'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          ) : (
            <div className="state-empty">
              <p className="font-semibold text-ink-900">No batch selected</p>
              <p className="mt-1 text-sm text-ink-600">
                Select a family from the queue. Child review and decisions open in a focused modal.
              </p>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={Boolean(activeGroup && selectedChild && isChildModalOpen)}
        onOpenChange={setIsChildModalOpen}
      >
        <DialogContent className="w-[min(96vw,74rem)] max-h-[90vh] overflow-y-auto bg-white">
          {activeGroup && selectedChild ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedChild.child.firstName} {selectedChild.child.lastName} Decision Desk
                </DialogTitle>
                <DialogDescription>
                  Review child details, apply admission decisions, run batch actions, and notify parents from one place.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <article className="rounded-[12px] border border-line bg-bg-soft px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Children in batch</p>
                    {connectedMode && activeGroup.children.length > 1 ? (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => moveChildSelection(-1)}>
                          Previous
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => moveChildSelection(1)}>
                          Next
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeGroup.children.map((child) => {
                      const selected = child.enrollmentId === selectedChild.enrollmentId;
                      return (
                        <button
                          key={child.enrollmentId}
                          type="button"
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? 'border-sky-300 bg-sky-100 text-sky-900'
                              : 'border-line bg-white text-ink-700 hover:border-sky-200 hover:bg-sky-50'
                          }`}
                          onClick={() => setSelectedEnrollmentId(child.enrollmentId)}
                        >
                          {child.child.firstName} {child.child.lastName}
                          <span className="ml-1.5 inline-block opacity-80">({toTitle(child.status)})</span>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <div className="grid gap-3 lg:grid-cols-2">
                  <article className="rounded-[12px] border border-line bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Child details</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                      <UserRound className="h-4 w-4" />
                      {selectedChild.child.firstName} {selectedChild.child.lastName}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">DOB {formatDate(selectedChild.child.dateOfBirth)}</p>
                    <p className="mt-2 text-sm text-ink-800">Program: {selectedChild.programType.replace('_', ' ')}</p>
                    <p className="mt-1 text-sm text-ink-700">
                      Requested start: {selectedChild.startDate ? formatDate(selectedChild.startDate) : 'Not set'}
                    </p>
                    <p className="mt-1 text-sm text-ink-700">Allergies: {selectedChild.child.allergies || 'None listed'}</p>
                    <p className="mt-1 text-sm text-ink-700">Medical: {selectedChild.child.medicalNotes || 'None listed'}</p>

                    {connectedMode ? (
                      <div className="mt-3 rounded-[10px] border border-line bg-bg-soft px-2.5 py-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Billing handoff</p>
                          <Badge variant={paymentStateVariant(selectedChild.handoff.paymentState)}>
                            {paymentStateLabel(selectedChild.handoff.paymentState)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-ink-700">
                          Hold:{' '}
                          {selectedChild.handoff.holdExpiresAt
                            ? formatDateTime(selectedChild.handoff.holdExpiresAt)
                            : 'Not set'}{' '}
                          ({formatHoldCountdown(selectedChild.handoff.holdExpiresAt)})
                        </p>
                        <p className="mt-1 text-xs text-ink-700">
                          Secured:{' '}
                          {selectedChild.handoff.spotSecuredAt
                            ? formatDateTime(selectedChild.handoff.spotSecuredAt)
                            : 'Not secured'}
                        </p>
                      </div>
                    ) : null}

                    {activeMissing.length ? (
                      <div className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 p-2.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-800">Missing intake fields</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {activeMissing.map((field) => (
                            <Badge key={field} variant="warning">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[10px] border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-700">
                        Ready for approval.
                      </div>
                    )}
                  </article>

                  <article className="rounded-[12px] border border-line bg-white p-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Decision desk</p>
                    {connectedMode ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" className="px-4" onClick={() => submitDecision('APPROVED')} isLoading={isPending} loadingText="Applying">
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" className="px-4" onClick={() => submitDecision('DENIED')} isLoading={isPending} loadingText="Applying">
                          Deny
                        </Button>
                        <Button size="sm" variant="outline" className="px-4" onClick={() => submitDecision('REQUEST_INFO')} isLoading={isPending} loadingText="Applying">
                          Request Info
                        </Button>
                        <Button size="sm" variant="outline" className="px-4" onClick={() => submitDecision('WAITLISTED')} isLoading={isPending} loadingText="Applying">
                          Waitlist
                        </Button>
                      </div>
                    ) : null}
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <Select
                        label={connectedMode ? 'Manual decision' : 'Decision'}
                        value={decisionStatus}
                        onChange={(event) => setDecisionStatus(event.target.value as AdmissionsEnrollmentStatus)}
                      >
                        {DECISION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {toTitle(status)}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Start date"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        endAdornment={<CalendarDays className="h-4 w-4" />}
                      />
                    </div>

                    <Input
                      label="Decision reason"
                      value={decisionReason}
                      onChange={(event) => setDecisionReason(event.target.value)}
                      placeholder="Optional reason"
                    />
                    <Input
                      label="Review notes"
                      value={reviewNotes}
                      onChange={(event) => setReviewNotes(event.target.value)}
                      placeholder="Required review notes"
                    />

                    <div className="mt-2 flex items-center justify-end">
                      <Button className="px-6" onClick={() => submitDecision()} isLoading={isPending} loadingText="Saving">
                        Save Decision
                      </Button>
                    </div>

                    {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}
                    {success ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {success}
                      </p>
                    ) : null}
                  </article>
                </div>

                {activeGroup.children.length > 1 ? (
                  <article className="rounded-[12px] border border-sky-200 bg-sky-50/70 p-3 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-sky-900">Batch actions</p>
                        <p className="text-xs text-sky-800">Run one action across unresolved children in this batch.</p>
                      </div>
                      <div className="grid gap-2 md:min-w-[15rem]">
                        <Input
                          type="date"
                          label="Shared batch start date"
                          value={batchStartDate}
                          onChange={(event) => setBatchStartDate(event.target.value)}
                        />
                        <Input
                          label="Batch reason (optional)"
                          value={batchReason}
                          onChange={(event) => setBatchReason(event.target.value)}
                          placeholder="Reason or reviewer notes"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="px-5"
                        onClick={() => submitBatchDecision('APPROVE_BATCH')}
                        disabled={connectedMode && activeGroup.batchReadiness.readyToApproveCount === 0}
                        isLoading={isPending}
                        loadingText="Applying"
                      >
                        Approve Batch
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="px-5"
                        onClick={() => submitBatchDecision('REQUEST_INFO_BATCH')}
                        isLoading={isPending}
                        loadingText="Applying"
                      >
                        Request Info Batch
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        className="px-5"
                        onClick={() => submitBatchDecision('DENY_BATCH')}
                        isLoading={isPending}
                        loadingText="Applying"
                      >
                        Deny Batch
                      </Button>
                    </div>
                    {batchDecisionError ? <p className="mt-2 text-sm font-medium text-rose-600">{batchDecisionError}</p> : null}
                    {batchDecisionSuccess ? <p className="mt-2 text-sm font-medium text-emerald-600">{batchDecisionSuccess}</p> : null}
                  </article>
                ) : null}

                {canSendNotifications ? (
                  <article className="rounded-[12px] border border-line bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-ink-900">Parent communication</p>
                    <p className="mt-1 text-xs text-ink-600">
                      Message is attached to {selectedChild.child.firstName} {selectedChild.child.lastName}.
                      {connectedMode ? ' We prefill reminder copy based on current handoff status.' : ''}
                    </p>
                    <div className="mt-2 space-y-2">
                      <Input label="Subject" value={notifySubject} onChange={(event) => setNotifySubject(event.target.value)} />
                      <Textarea
                        label="Message"
                        value={notifyMessage}
                        onChange={(event) => setNotifyMessage(event.target.value)}
                        placeholder="Share next steps or required updates."
                        rows={3}
                      />
                      {notifyError ? <p className="text-sm font-medium text-rose-600">{notifyError}</p> : null}
                      {notifySuccess ? <p className="text-sm font-medium text-emerald-600">{notifySuccess}</p> : null}
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          leftIcon={<Mail className="h-4 w-4" />}
                          onClick={sendNotification}
                          isLoading={isSendingNotification}
                          loadingText="Sending"
                        >
                          Send Notification
                        </Button>
                      </div>
                    </div>
                  </article>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
