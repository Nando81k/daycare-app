'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { ArrowRight, CalendarDays, ChevronRight, Mail, Search } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  buttonStyles,
} from '@/components/ui';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import type { FamiliesCrmRow, BalanceStateFilter, TaskSlaFilter } from '@/lib/crm/families';
import { cn } from '@/lib/utils';
import { getUiRevampFlags } from '@/lib/ui-revamp';

type CrmStage =
  | 'LEAD'
  | 'INTAKE_INCOMPLETE'
  | 'ADMISSIONS_REVIEW'
  | 'APPROVED_AWAITING_SPOT'
  | 'ACTIVE_FAMILY'
  | 'AT_RISK_BILLING';

type FamilyOwner = {
  id: string;
  firstName: string;
  lastName: string;
  adminRole: string | null;
};

type FamilyTag = {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  sortOrder: number;
};

type SavedView = {
  id: string;
  name: string;
  isDefault: boolean;
  filtersJson: Record<string, unknown>;
};

type FamilyDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    allergies: string | null;
    medicalNotes: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  }>;
  enrollments: Array<{
    id: string;
    status: string;
    programType: string;
    createdAt: string;
    startDate: string | null;
    reviewNotes: string | null;
    decisionReason: string | null;
    child: { firstName: string; lastName: string };
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    dueDate: string;
    amountDueCents: number;
    totalCents: number;
    child: { firstName: string; lastName: string } | null;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amountCents: number;
    paymentMethod: string | null;
    createdAt: string;
    invoice: { invoiceNumber: string } | null;
  }>;
  communicationEvents: Array<{
    id: string;
    channel: string;
    status: string;
    type: string;
    subject: string | null;
    message: string | null;
    createdAt: string;
    createdByAdmin: { id: string; firstName: string; lastName: string } | null;
  }>;
  crmProfileParent: {
    id: string;
    stage: CrmStage;
    suggestedStage: CrmStage | null;
    isStageManuallyOverridden: boolean;
    ownerAdminId: string | null;
    nextFollowUpAt: string | null;
    lastContactedAt: string | null;
    ownerAdmin: { id: string; firstName: string; lastName: string } | null;
    tasks: Array<{
      id: string;
      title: string;
      status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      description: string | null;
      dueAt: string | null;
      ownerAdmin: { id: string; firstName: string; lastName: string } | null;
      createdByAdmin: { id: string; firstName: string; lastName: string } | null;
    }>;
    notes: Array<{
      id: string;
      body: string;
      isPinned: boolean;
      createdAt: string;
      createdByAdmin: { id: string; firstName: string; lastName: string } | null;
    }>;
    tags: Array<{
      id: string;
      tagId: string;
      tag: { id: string; name: string; color: string };
    }>;
  } | null;
  workspaceSnapshot?: {
    counts: {
      openTasks: number;
      pinnedNotes: number;
      openInvoices: number;
      pastDueInvoices: number;
      outstandingBalanceCents: number;
      admissionsNeedsReview: number;
      approvedAwaitingSecureSpot: number;
      unreadInAppMessages: number;
    };
    timeline: {
      lastCommunicationAt: string | null;
      lastTaskAt: string | null;
      lastEnrollmentAt: string | null;
      lastPaymentAt: string | null;
    };
  };
};

interface Props {
  initialRows: FamiliesCrmRow[];
  initialPage: number;
  initialPageSize: number;
  initialTotal: number;
  initialPageCount: number;
  initialOwners: FamilyOwner[];
  initialTags: FamilyTag[];
  initialViews: SavedView[];
  initialOpenFamilyId?: string | null;
  initialOpenTab?: string | null;
  canSendNotifications?: boolean;
}

const CRM_STAGES: CrmStage[] = [
  'LEAD',
  'INTAKE_INCOMPLETE',
  'ADMISSIONS_REVIEW',
  'APPROVED_AWAITING_SPOT',
  'ACTIVE_FAMILY',
  'AT_RISK_BILLING',
];

const TASK_SLA_FILTERS: TaskSlaFilter[] = ['ALL', 'OVERDUE', 'TODAY', 'UPCOMING', 'NONE'];
const BALANCE_FILTERS: BalanceStateFilter[] = ['ALL', 'CLEAR', 'OPEN', 'PAST_DUE'];

function stageLabel(stage: string) {
  return stage.replace(/_/g, ' ');
}

function enrollmentVariant(status: string) {
  if (status === 'APPROVED') return 'success';
  if (status === 'PENDING' || status === 'REQUEST_INFO') return 'warning';
  if (status === 'DENIED' || status === 'WAITLISTED') return 'danger';
  return 'default';
}

function stageVariant(stage: CrmStage): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (stage === 'ACTIVE_FAMILY') return 'success';
  if (stage === 'AT_RISK_BILLING') return 'danger';
  if (stage === 'APPROVED_AWAITING_SPOT' || stage === 'ADMISSIONS_REVIEW') return 'warning';
  if (stage === 'LEAD') return 'default';
  return 'info';
}

function taskPriorityVariant(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
  if (priority === 'URGENT') return 'danger';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'info';
  return 'default';
}

function slaVariant(slaState: FamiliesCrmRow['slaState']) {
  if (slaState === 'OVERDUE') return 'danger' as const;
  if (slaState === 'TODAY') return 'warning' as const;
  if (slaState === 'UPCOMING') return 'info' as const;
  return 'default' as const;
}

function handoffLabel(handoffState: FamiliesCrmRow['handoffState']) {
  return handoffState.replace(/_/g, ' ');
}

function handoffVariant(handoffState: FamiliesCrmRow['handoffState']) {
  if (handoffState === 'BILLING_FOLLOW_UP') return 'danger' as const;
  if (handoffState === 'AWAITING_SECURE_SPOT' || handoffState === 'ADMISSIONS_REVIEW') return 'warning' as const;
  if (handoffState === 'TASK_FOLLOW_UP') return 'info' as const;
  return 'default' as const;
}

export function FamiliesTable({
  initialRows,
  initialPage,
  initialPageSize,
  initialTotal,
  initialPageCount,
  initialOwners,
  initialTags,
  initialViews,
  initialOpenFamilyId = null,
  initialOpenTab = null,
  canSendNotifications = false,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [owners, setOwners] = useState(initialOwners);
  const [tags, setTags] = useState(initialTags);
  const [views, setViews] = useState(initialViews);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [pageCount, setPageCount] = useState(initialPageCount);

  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<CrmStage | 'ALL'>('ALL');
  const [ownerId, setOwnerId] = useState<string | 'ALL'>('ALL');
  const [tag, setTag] = useState<string | 'ALL'>('ALL');
  const [taskState, setTaskState] = useState<TaskSlaFilter>('ALL');
  const [balanceState, setBalanceState] = useState<BalanceStateFilter>('ALL');
  const [viewId, setViewId] = useState<string | 'ALL'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOwnerId, setBulkOwnerId] = useState<string | 'UNASSIGN'>('UNASSIGN');
  const [bulkStage, setBulkStage] = useState<CrmStage>('ADMISSIONS_REVIEW');
  const [bulkTaskTitle, setBulkTaskTitle] = useState('');

  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(null);
  const [activeFamily, setActiveFamily] = useState<FamilyDetail | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [focusedFamilyId, setFocusedFamilyId] = useState<string | null>(initialRows[0]?.id ?? null);

  const [crmStage, setCrmStage] = useState<CrmStage>('LEAD');
  const [crmOwnerId, setCrmOwnerId] = useState<string | 'UNASSIGN'>('UNASSIGN');
  const [crmFollowUp, setCrmFollowUp] = useState('');
  const [crmManualOverride, setCrmManualOverride] = useState(false);
  const [crmTagIds, setCrmTagIds] = useState<string[]>([]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueAt, setTaskDueAt] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [taskOwnerId, setTaskOwnerId] = useState<string | 'UNASSIGN'>('UNASSIGN');

  const [noteBody, setNoteBody] = useState('');
  const [notePinned, setNotePinned] = useState(false);

  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSending, startSending] = useTransition();
  const [isSavingCrm, startSavingCrm] = useTransition();
  const revampPhase = useMemo(() => getUiRevampFlags().phase, []);
  const hasMountedRef = useRef(false);
  const pageRef = useRef(initialPage);
  const didInitialOpenRef = useRef(false);

  function buildClientMetrics(
    flow: 'CRM_BULK_ACTION' | 'CRM_TASK_CREATE' | 'CRM_TASK_UPDATE' | 'CRM_COMMUNICATION',
    startedAtMs: number,
  ) {
    const completedAtMs = Date.now();
    return {
      flow,
      startedAt: new Date(startedAtMs).toISOString(),
      completedAt: new Date(completedAtMs).toISOString(),
      elapsedMs: Math.max(0, completedAtMs - startedAtMs),
      phase: revampPhase,
    };
  }

  const selectedCount = selectedIds.length;
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count += 1;
    if (stage !== 'ALL') count += 1;
    if (ownerId !== 'ALL') count += 1;
    if (tag !== 'ALL') count += 1;
    if (taskState !== 'ALL') count += 1;
    if (balanceState !== 'ALL') count += 1;
    if (viewId !== 'ALL') count += 1;
    return count;
  }, [balanceState, ownerId, query, stage, tag, taskState, viewId]);

  const visibleStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleEnd = total === 0 ? 0 : Math.min(total, visibleStart + rows.length - 1);

  const selectedAll = useMemo(
    () => rows.length > 0 && rows.every((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  );

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.includes(row.id)),
    [rows, selectedIds],
  );

  const focusedRow = useMemo(
    () => rows.find((row) => row.id === focusedFamilyId) ?? rows[0] ?? null,
    [focusedFamilyId, rows],
  );

  const bulkPreflight = useMemo(
    () => ({
      admissionsReview: selectedRows.filter((row) => row.handoffState === 'ADMISSIONS_REVIEW').length,
      billingFollowUp: selectedRows.filter(
        (row) => row.handoffState === 'BILLING_FOLLOW_UP' || row.handoffState === 'AWAITING_SECURE_SPOT',
      ).length,
      overdueTaskSla: selectedRows.filter((row) => row.slaState === 'OVERDUE').length,
    }),
    [selectedRows],
  );

  useEffect(() => {
    if (!activeFamily) return;
    setCrmStage(activeFamily.crmProfileParent?.stage ?? 'LEAD');
    setCrmOwnerId(activeFamily.crmProfileParent?.ownerAdminId ?? 'UNASSIGN');
    setCrmFollowUp(
      activeFamily.crmProfileParent?.nextFollowUpAt
        ? activeFamily.crmProfileParent.nextFollowUpAt.slice(0, 10)
        : '',
    );
    setCrmManualOverride(Boolean(activeFamily.crmProfileParent?.isStageManuallyOverridden));
    setCrmTagIds((activeFamily.crmProfileParent?.tags ?? []).map((item) => item.tag.id));
    setNotifySubject(`${activeFamily.firstName} ${activeFamily.lastName} family update`);
    setNotifyMessage('');
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueAt('');
    setTaskPriority('MEDIUM');
    setTaskOwnerId(activeFamily.crmProfileParent?.ownerAdminId ?? 'UNASSIGN');
    setNoteBody('');
    setNotePinned(false);
    setNotifyInApp(true);
    setNotifyEmail(true);
  }, [activeFamily]);

  const fetchRows = useCallback(
    (input?: { resetPage?: boolean; pageOverride?: number }) => {
      const nextPage = input?.resetPage ? 1 : input?.pageOverride ?? pageRef.current;
      startTransition(async () => {
        setError('');

        const params = new URLSearchParams({
          page: String(nextPage),
          pageSize: String(pageSize),
          query,
          stage,
          ownerId,
          tag,
          taskState,
          balanceState,
        });
        if (viewId !== 'ALL') params.set('viewId', viewId);

        const response = await fetch(`/api/v3/admin/families?${params.toString()}`, {
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setError(payload?.error?.message || 'Unable to load CRM families data.');
          return;
        }

        setRows(payload.rows || []);
        setOwners(payload.owners || []);
        setTags(payload.tags || []);
        setViews(payload.views || []);
        setTotal(payload.total || 0);
        setPage(payload.page || 1);
        setPageCount(payload.pageCount || 1);
        setSelectedIds([]);
      });
    },
    [balanceState, ownerId, pageSize, query, stage, tag, taskState, viewId],
  );

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRows({ resetPage: true });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [query, stage, ownerId, tag, taskState, balanceState, viewId, pageSize, fetchRows]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    void fetchRows({ pageOverride: page });
  }, [page, fetchRows]);

  useEffect(() => {
    if (didInitialOpenRef.current) return;
    if (!initialOpenFamilyId) return;
    didInitialOpenRef.current = true;
    setFocusedFamilyId(initialOpenFamilyId);
    void loadFamilyDetail(initialOpenFamilyId, { preferredTab: initialOpenTab });
  }, [initialOpenFamilyId, initialOpenTab]);

  useEffect(() => {
    if (!rows.length) {
      setFocusedFamilyId(null);
      return;
    }
    if (focusedFamilyId && rows.some((row) => row.id === focusedFamilyId)) {
      return;
    }
    setFocusedFamilyId(rows[0].id);
  }, [focusedFamilyId, rows]);

  async function loadFamilyDetail(familyId: string, options?: { preferredTab?: string | null }) {
    setLoadingFamily(true);
    setError('');
    setActiveFamilyId(familyId);
    const response = await fetch(`/api/v3/admin/families/${familyId}`, { cache: 'no-store' });
    const payload = await response.json().catch(() => null);
    setLoadingFamily(false);

    if (!response.ok) {
      setError(payload?.error?.message || 'Unable to load family detail.');
      setActiveFamily(null);
      return;
    }

    const nextFamily = payload.family as FamilyDetail;
    if (payload?.workspaceSnapshot) {
      nextFamily.workspaceSnapshot = payload.workspaceSnapshot;
    }
    setActiveFamily(nextFamily);
    setActiveTab(options?.preferredTab || 'overview');
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedAll) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(rows.map((row) => row.id));
  }

  function runBulkAction(input: Record<string, unknown>) {
    if (!selectedIds.length) return;
    const startedAt = Date.now();
    startSending(async () => {
      setError('');
      setSuccess('');

      const response = await fetch('/api/v3/admin/families/crm/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyIds: selectedIds,
          ...input,
          clientMetrics: buildClientMetrics('CRM_BULK_ACTION', startedAt),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Bulk action failed.');
        return;
      }

      setSuccess(`Bulk action applied to ${payload.updatedCount || selectedIds.length} families.`);
      void fetchRows();
    });
  }

  function saveCurrentView() {
    const name = window.prompt('Save current filters as view name');
    if (!name || !name.trim()) return;

    startSending(async () => {
      setError('');
      const response = await fetch('/api/v3/admin/families/crm/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          isDefault: false,
          filtersJson: { query, stage, ownerId, tag, taskState, balanceState },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to save view.');
        return;
      }
      setViews((prev) => [payload.view, ...prev]);
      setSuccess('Saved view created.');
    });
  }

  function applySavedView(nextViewId: string) {
    setViewId(nextViewId as string | 'ALL');
    if (nextViewId === 'ALL') return;
    const view = views.find((item) => item.id === nextViewId);
    if (!view) return;
    const filters = view.filtersJson || {};
    setQuery(typeof filters.query === 'string' ? filters.query : '');
    setStage((typeof filters.stage === 'string' ? filters.stage : 'ALL') as CrmStage | 'ALL');
    setOwnerId((typeof filters.ownerId === 'string' ? filters.ownerId : 'ALL') as string | 'ALL');
    setTag((typeof filters.tag === 'string' ? filters.tag : 'ALL') as string | 'ALL');
    setTaskState((typeof filters.taskState === 'string' ? filters.taskState : 'ALL') as TaskSlaFilter);
    setBalanceState((typeof filters.balanceState === 'string' ? filters.balanceState : 'ALL') as BalanceStateFilter);
  }

  function clearFilters() {
    setQuery('');
    setStage('ALL');
    setOwnerId('ALL');
    setTag('ALL');
    setTaskState('ALL');
    setBalanceState('ALL');
    setViewId('ALL');
    setPage(1);
  }

  function saveCrmProfile() {
    if (!activeFamilyId) return;
    startSavingCrm(async () => {
      setError('');
      setSuccess('');
      const response = await fetch(`/api/v3/admin/families/${activeFamilyId}/crm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: crmStage,
          ownerAdminId: crmOwnerId === 'UNASSIGN' ? null : crmOwnerId,
          nextFollowUpAt: crmFollowUp ? new Date(crmFollowUp).toISOString() : null,
          isStageManuallyOverridden: crmManualOverride,
          tagIds: crmTagIds,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to save CRM profile.');
        return;
      }
      setSuccess('CRM profile saved.');
      await loadFamilyDetail(activeFamilyId);
      void fetchRows();
    });
  }

  function toggleFamilyActiveStatus() {
    if (!activeFamily) return;
    startSending(async () => {
      const response = await fetch(`/api/v3/admin/families/${activeFamily.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !activeFamily.isActive }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update account status.');
        return;
      }
      setSuccess(`Family marked ${payload.family?.isActive ? 'active' : 'inactive'}.`);
      await loadFamilyDetail(activeFamily.id);
      void fetchRows();
    });
  }

  function createTask() {
    if (!activeFamilyId || !taskTitle.trim()) return;
    const startedAt = Date.now();
    startSending(async () => {
      setError('');
      const response = await fetch(`/api/v3/admin/families/${activeFamilyId}/crm/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDescription.trim() || null,
          dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : null,
          priority: taskPriority,
          ownerAdminId: taskOwnerId === 'UNASSIGN' ? null : taskOwnerId,
          clientMetrics: buildClientMetrics('CRM_TASK_CREATE', startedAt),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to create task.');
        return;
      }
      setSuccess('Task created.');
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueAt('');
      await loadFamilyDetail(activeFamilyId);
      void fetchRows();
    });
  }

  function updateTaskStatus(taskId: string, status: 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE') {
    if (!activeFamilyId) return;
    const startedAt = Date.now();
    startSending(async () => {
      const response = await fetch(`/api/v3/admin/families/${activeFamilyId}/crm/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          clientMetrics: buildClientMetrics('CRM_TASK_UPDATE', startedAt),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update task.');
        return;
      }
      await loadFamilyDetail(activeFamilyId);
      void fetchRows();
    });
  }

  function createNote() {
    if (!activeFamilyId || !noteBody.trim()) return;
    startSending(async () => {
      const response = await fetch(`/api/v3/admin/families/${activeFamilyId}/crm/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: noteBody.trim(),
          isPinned: notePinned,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to create note.');
        return;
      }
      setSuccess('Note added.');
      setNoteBody('');
      setNotePinned(false);
      await loadFamilyDetail(activeFamilyId);
    });
  }

  function togglePinNote(noteId: string, currentValue: boolean) {
    if (!activeFamilyId) return;
    startSending(async () => {
      const response = await fetch(`/api/v3/admin/families/${activeFamilyId}/crm/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentValue }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to update note.');
        return;
      }
      await loadFamilyDetail(activeFamilyId);
    });
  }

  function sendCommunication() {
    if (!activeFamilyId || !notifySubject.trim() || !notifyMessage.trim()) return;
    if (!notifyInApp && !notifyEmail) {
      setError('Select at least one communication channel.');
      return;
    }

    const startedAt = Date.now();
    startSending(async () => {
      setError('');
      const response = await fetch('/api/v3/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: activeFamilyId,
          type: 'GENERAL',
          subject: notifySubject.trim(),
          message: notifyMessage.trim(),
          delivery: { inApp: notifyInApp, email: notifyEmail },
          clientMetrics: buildClientMetrics('CRM_COMMUNICATION', startedAt),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message || 'Unable to send communication.');
        return;
      }
      setSuccess('Communication sent.');
      setNotifyMessage('');
      await loadFamilyDetail(activeFamilyId);
      void fetchRows();
    });
  }

  const hasRows = rows.length > 0;

  return (
    <section className="table-shell overflow-hidden rounded-[22px] border-white/70 shadow-float">
      <div
        className="border-b border-line/80 bg-white p-4 md:p-5"
        data-tour-id="admin-families-search"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">Central Workspace</p>
            <h3 className="mt-1 text-[1.2rem] font-semibold text-ink-900">Family CRM Decision Desk</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">
              Work one clear queue: pick a family, review priority context, and open the right workspace action without hunting across pages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveCurrentView} isLoading={isSending} loadingText="Saving">
              Save View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchRows({ resetPage: true })}
              isLoading={isPending}
              loadingText="Refreshing"
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={activeFilterCount === 0 && viewId === 'ALL'}
            >
              Clear Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
            >
              {showAdvancedFilters ? 'Less Filters' : 'More Filters'}
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-line/80 bg-white/94 p-3 shadow-sm">
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search family, email, phone, or child"
              startAdornment={<Search className="h-4 w-4" />}
            />
            <Select value={stage} onChange={(event) => setStage(event.target.value as CrmStage | 'ALL')}>
              <option value="ALL">All stages</option>
              {CRM_STAGES.map((item) => (
                <option key={item} value={item}>
                  {stageLabel(item)}
                </option>
              ))}
            </Select>
            <Select value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
              <option value="ALL">All owners</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName}
                </option>
              ))}
            </Select>
            <Select value={viewId} onChange={(event) => applySavedView(event.target.value)}>
              <option value="ALL">All views</option>
              {views.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                  {view.isDefault ? ' (Default)' : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
            <Badge variant="info">{activeFilterCount} active</Badge>
            <span>{rows.length} visible</span>
          </div>
        </div>

          {showAdvancedFilters ? (
            <div className="mt-3 grid gap-2 border-t border-line/60 pt-3 md:grid-cols-3">
              <Select value={taskState} onChange={(event) => setTaskState(event.target.value as TaskSlaFilter)}>
                {TASK_SLA_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    Task {item}
                  </option>
                ))}
              </Select>
              <Select value={balanceState} onChange={(event) => setBalanceState(event.target.value as BalanceStateFilter)}>
                {BALANCE_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    Balance {item}
                  </option>
                ))}
              </Select>
              <Select value={tag} onChange={(event) => setTag(event.target.value)}>
                <option value="ALL">All tags</option>
                {tags.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
      </div>

      {selectedCount > 0 ? (
        <div className="border-b border-line/70 bg-sky-50/65 px-3 py-2">
          <p className="mb-1 text-xs text-sky-900">
            Preflight: {bulkPreflight.admissionsReview} admissions review, {bulkPreflight.billingFollowUp} billing follow-up,{' '}
            {bulkPreflight.overdueTaskSla} overdue SLA.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{selectedCount} selected</Badge>
            <Select value={bulkOwnerId} onChange={(event) => setBulkOwnerId(event.target.value)} className="w-48">
              <option value="UNASSIGN">Unassign owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                runBulkAction({
                  action: 'ASSIGN_OWNER',
                  ownerAdminId: bulkOwnerId === 'UNASSIGN' ? null : bulkOwnerId,
                })
              }
            >
              Assign Owner
            </Button>
            <Select value={bulkStage} onChange={(event) => setBulkStage(event.target.value as CrmStage)} className="w-56">
              {CRM_STAGES.map((item) => (
                <option key={item} value={item}>
                  {stageLabel(item)}
                </option>
              ))}
            </Select>
            <Button variant="outline" size="sm" onClick={() => runBulkAction({ action: 'SET_STAGE', stage: bulkStage })}>
              Move Stage
            </Button>
            <Button variant="outline" size="sm" onClick={() => runBulkAction({ action: 'SET_ACTIVE', isActive: true })}>
              Mark Active
            </Button>
            <Button variant="outline" size="sm" onClick={() => runBulkAction({ action: 'SET_ACTIVE', isActive: false })}>
              Mark Inactive
            </Button>
            <Input
              value={bulkTaskTitle}
              onChange={(event) => setBulkTaskTitle(event.target.value)}
              placeholder="Shared task title"
              containerClassName="min-w-[10rem] flex-1"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!bulkTaskTitle.trim()) {
                  setError('Task title is required for bulk task creation.');
                  return;
                }
                runBulkAction({
                  action: 'CREATE_TASK',
                  task: { title: bulkTaskTitle.trim(), status: 'OPEN', priority: 'MEDIUM' },
                });
              }}
            >
              Create Task
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="px-3 py-2 text-sm font-medium text-rose-600">{error}</p> : null}
      {success ? <p className="px-3 py-2 text-sm font-medium text-emerald-700">{success}</p> : null}

      <div className="grid gap-0 xl:grid-cols-[24rem_minmax(0,1fr)]" data-tour-id="admin-families-table">
        <aside className="border-b border-line/70 bg-white/90 xl:border-b-0 xl:border-r xl:border-line/70">
          <div className="flex items-center justify-between border-b border-line/70 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Family Queue</p>
              <p className="text-[11px] text-ink-600">Prioritized by your current filters and CRM state.</p>
            </div>
            <label className="inline-flex items-center gap-1 text-xs text-ink-600">
              <input type="checkbox" checked={selectedAll} onChange={toggleSelectAll} aria-label="Select all families" />
              All
            </label>
          </div>

          <div className="max-h-[48rem] overflow-y-auto p-2.5">
            {hasRows ? (
              <div className="space-y-2">
                {rows.map((row) => {
                  const focused = focusedRow?.id === row.id;
                  return (
                    <article
                      key={row.id}
                      className={cn(
                        'rounded-[14px] border bg-white px-3 py-2.5 shadow-sm transition',
                        focused ? 'border-sky-300 ring-1 ring-sky-200' : 'border-line',
                        row.riskFlags.length > 0 && 'border-rose-200',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(row.id)}
                            onChange={() => toggleSelected(row.id)}
                            aria-label={`Select ${row.firstName} ${row.lastName}`}
                          />
                          Select
                        </label>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Badge variant={handoffVariant(row.handoffState)}>{handoffLabel(row.handoffState)}</Badge>
                          <Badge variant={slaVariant(row.slaState)}>SLA {row.slaState}</Badge>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-1.5 w-full text-left"
                        onClick={() => {
                          setFocusedFamilyId(row.id);
                          void loadFamilyDetail(row.id, { preferredTab: 'overview' });
                        }}
                      >
                        <p className="font-semibold text-ink-900">
                          {row.firstName} {row.lastName}
                        </p>
                        <p className="inline-flex items-center gap-1 text-xs text-ink-500">
                          <Mail className="h-3.5 w-3.5" /> {row.email}
                        </p>
                        <p className="mt-1 text-xs text-ink-700">{row.nextAction}</p>
                      </button>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant={stageVariant(row.crmStage)}>{stageLabel(row.crmStage)}</Badge>
                        <Badge variant={row.isActive ? 'success' : 'warning'}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info">{row.openTaskCount} open tasks</Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => void loadFamilyDetail(row.id, { preferredTab: 'tasks' })}>
                          Open Tasks
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/families/${row.id}`} className={buttonStyles({ variant: 'outline', size: 'sm' })}>
                          Profile
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="state-empty">
                <p className="font-semibold text-ink-900">No families match this view.</p>
                <p className="mt-1 text-sm text-ink-600">Try clearing filters or selecting a different saved view.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="bg-white/70 p-3 md:p-4">
          {focusedRow ? (
            <div className="space-y-3">
              <article className="rounded-[14px] border border-line bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Focused Family</p>
                    <p className="mt-1 text-lg font-semibold text-ink-900">
                      {focusedRow.firstName} {focusedRow.lastName}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500">
                      <Mail className="h-3.5 w-3.5" /> {focusedRow.email}
                    </p>
                    <p className="mt-2 text-sm text-ink-700">{focusedRow.nextAction}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={stageVariant(focusedRow.crmStage)}>{stageLabel(focusedRow.crmStage)}</Badge>
                    <Badge variant={handoffVariant(focusedRow.handoffState)}>{handoffLabel(focusedRow.handoffState)}</Badge>
                    <Badge variant={slaVariant(focusedRow.slaState)}>SLA {focusedRow.slaState}</Badge>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-field border border-line bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Children</p>
                    <p className="mt-1 text-lg font-semibold text-ink-900">{focusedRow.childrenCount}</p>
                  </div>
                  <div className="rounded-field border border-line bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Open Tasks</p>
                    <p className="mt-1 text-lg font-semibold text-ink-900">{focusedRow.openTaskCount}</p>
                  </div>
                  <div className="rounded-field border border-line bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Past Due</p>
                    <p className="mt-1 text-lg font-semibold text-ink-900">{focusedRow.pastDueInvoiceCount}</p>
                  </div>
                  <div className="rounded-field border border-line bg-white px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Outstanding</p>
                    <p className="mt-1 text-lg font-semibold text-ink-900">{formatCurrency(focusedRow.outstandingBalanceCents)}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-[14px] border border-line bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Quick Actions</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => void loadFamilyDetail(focusedRow.id, { preferredTab: 'overview' })}
                  >
                    Open Overview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void loadFamilyDetail(focusedRow.id, { preferredTab: 'admissions' })}
                  >
                    Admissions
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void loadFamilyDetail(focusedRow.id, { preferredTab: 'billing' })}
                  >
                    Billing
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void loadFamilyDetail(focusedRow.id, { preferredTab: 'tasks' })}
                  >
                    Tasks
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void loadFamilyDetail(focusedRow.id, { preferredTab: 'communications' })}
                  >
                    Message Family
                  </Button>
                </div>
                <p className="mt-2 text-xs text-ink-600">
                  Owner: {focusedRow.owner ? `${focusedRow.owner.firstName} ${focusedRow.owner.lastName}` : 'Unassigned'}
                  {' • '}
                  Last contact: {focusedRow.lastContactedAt ? formatDate(focusedRow.lastContactedAt) : 'No contact yet'}
                </p>
              </article>

              {focusedRow.riskFlags.length ? (
                <article className="rounded-[14px] border border-rose-200 bg-rose-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-700">Risk Flags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {focusedRow.riskFlags.map((flag) => (
                      <Badge key={flag} variant="danger">
                        {flag.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </article>
              ) : null}
            </div>
          ) : (
            <div className="state-empty">
              <p className="font-semibold text-ink-900">No family selected</p>
              <p className="mt-1 text-sm text-ink-600">Pick a family from the queue to see priorities and actions.</p>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 px-3 py-2 text-sm text-ink-600">
        <p>
          Showing {visibleStart}-{visibleEnd} of {total} families
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={String(pageSize)}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            containerClassName="w-28"
          >
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </Select>
          <span className="text-xs text-ink-500">
            Page {page} of {pageCount}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(activeFamilyId)} onOpenChange={(open) => (!open ? setActiveFamilyId(null) : null)}>
        <DialogContent className="w-[min(98vw,78rem)] max-h-[90vh] overflow-y-auto xl:left-auto xl:right-0 xl:top-0 xl:h-screen xl:max-h-none xl:w-[min(42rem,92vw)] xl:translate-x-0 xl:translate-y-0 xl:rounded-none xl:border-l xl:border-white/70">
          {loadingFamily ? (
            <p className="text-sm text-ink-600">Loading family workspace...</p>
          ) : activeFamily ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {activeFamily.firstName} {activeFamily.lastName} CRM Workspace
                </DialogTitle>
                <DialogDescription>
                  Admissions, billing, communication, and follow-up operations for this family.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex-wrap justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="children">Children</TabsTrigger>
                  <TabsTrigger value="admissions">Admissions</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="communications">Communications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-3 space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Select label="CRM stage" value={crmStage} onChange={(event) => setCrmStage(event.target.value as CrmStage)}>
                      {CRM_STAGES.map((item) => (
                        <option key={item} value={item}>
                          {stageLabel(item)}
                        </option>
                      ))}
                    </Select>
                    <Select label="Owner" value={crmOwnerId} onChange={(event) => setCrmOwnerId(event.target.value)}>
                      <option value="UNASSIGN">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Next follow-up date"
                      type="date"
                      value={crmFollowUp}
                      onChange={(event) => setCrmFollowUp(event.target.value)}
                      endAdornment={<CalendarDays className="h-4 w-4" />}
                    />
                  </div>

                  {activeFamily.workspaceSnapshot ? (
                    <div className="grid gap-2 md:grid-cols-4">
                      <div className="rounded-field border border-line bg-white px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Open Tasks</p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">{activeFamily.workspaceSnapshot.counts.openTasks}</p>
                      </div>
                      <div className="rounded-field border border-line bg-white px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Admissions Review</p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">{activeFamily.workspaceSnapshot.counts.admissionsNeedsReview}</p>
                      </div>
                      <div className="rounded-field border border-line bg-white px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Past Due</p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">{activeFamily.workspaceSnapshot.counts.pastDueInvoices}</p>
                      </div>
                      <div className="rounded-field border border-line bg-white px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Outstanding</p>
                        <p className="mt-1 text-lg font-semibold text-ink-900">
                          {formatCurrency(activeFamily.workspaceSnapshot.counts.outstandingBalanceCents)}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-ink-700">
                    <input
                      type="checkbox"
                      checked={crmManualOverride}
                      onChange={(event) => setCrmManualOverride(event.target.checked)}
                    />
                    Keep stage manually overridden
                  </label>
                  <div className="rounded-field border border-line bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tagItem) => {
                        const selected = crmTagIds.includes(tagItem.id);
                        return (
                          <button
                            key={tagItem.id}
                            type="button"
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              selected
                                ? 'border-sky-300 bg-sky-100 text-sky-900'
                                : 'border-line bg-white text-ink-700'
                            }`}
                            onClick={() =>
                              setCrmTagIds((prev) =>
                                prev.includes(tagItem.id)
                                  ? prev.filter((item) => item !== tagItem.id)
                                  : [...prev, tagItem.id],
                              )
                            }
                          >
                            {tagItem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={saveCrmProfile} isLoading={isSavingCrm} loadingText="Saving CRM">
                      Save CRM Profile
                    </Button>
                    <Button variant="outline" onClick={toggleFamilyActiveStatus} isLoading={isSending} loadingText="Updating">
                      Mark as {activeFamily.isActive ? 'Inactive' : 'Active'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="children" className="mt-3">
                  <div className="space-y-2 list-scroll">
                    {activeFamily.children.map((child) => (
                      <article key={child.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                        <p className="font-semibold text-ink-900">
                          {child.firstName} {child.lastName}
                        </p>
                        <p className="text-xs text-ink-500">DOB {formatDate(child.dateOfBirth)}</p>
                        <p className="text-xs text-ink-600">Allergies: {child.allergies || 'None listed'}</p>
                        <p className="text-xs text-ink-600">Medical: {child.medicalNotes || 'None listed'}</p>
                      </article>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="admissions" className="mt-3">
                  <div className="space-y-2 list-scroll">
                    {activeFamily.enrollments.length ? (
                      activeFamily.enrollments.map((enrollment) => (
                        <article key={enrollment.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-ink-900">
                              {enrollment.child.firstName} {enrollment.child.lastName}
                            </p>
                            <Badge variant={enrollmentVariant(enrollment.status)}>
                              {stageLabel(enrollment.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-ink-500">
                            {stageLabel(enrollment.programType)} • Submitted {formatDateTime(enrollment.createdAt)}
                          </p>
                          {enrollment.reviewNotes ? (
                            <p className="mt-1 text-xs text-ink-700">Review: {enrollment.reviewNotes}</p>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <p className="state-empty">No admissions records for this family.</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="billing" className="mt-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <article className="rounded-field border border-line bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Invoices</p>
                      <div className="mt-2 space-y-2 list-scroll">
                        {activeFamily.invoices.slice(0, 12).map((invoice) => (
                          <div key={invoice.id} className="rounded-field border border-line px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-ink-900">{invoice.invoiceNumber}</p>
                              <Badge variant={enrollmentVariant(invoice.status)}>{stageLabel(invoice.status)}</Badge>
                            </div>
                            <p className="text-xs text-ink-600">
                              Due {formatDate(invoice.dueDate)} • {formatCurrency(invoice.amountDueCents)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                    <article className="rounded-field border border-line bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Payments</p>
                      <div className="mt-2 space-y-2 list-scroll">
                        {activeFamily.payments.slice(0, 12).map((payment) => (
                          <div key={payment.id} className="rounded-field border border-line px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-ink-900">{formatCurrency(payment.amountCents)}</p>
                              <Badge variant={enrollmentVariant(payment.status)}>{stageLabel(payment.status)}</Badge>
                            </div>
                            <p className="text-xs text-ink-600">
                              {payment.invoice?.invoiceNumber || 'Invoice'} • {formatDateTime(payment.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="mt-3 space-y-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input label="Task title" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
                    <Input label="Due date" type="date" value={taskDueAt} onChange={(event) => setTaskDueAt(event.target.value)} />
                    <Select label="Priority" value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as any)}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </Select>
                    <Select label="Owner" value={taskOwnerId} onChange={(event) => setTaskOwnerId(event.target.value)}>
                      <option value="UNASSIGN">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.firstName} {owner.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Textarea label="Description" rows={2} value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
                  <Button onClick={createTask} isLoading={isSending} loadingText="Creating task">
                    Create Task
                  </Button>
                  <div className="space-y-2 list-scroll">
                    {(activeFamily.crmProfileParent?.tasks || []).map((task) => (
                      <article key={task.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-ink-900">{task.title}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={taskPriorityVariant(task.priority)}>{task.priority}</Badge>
                            <Badge variant={enrollmentVariant(task.status)}>{stageLabel(task.status)}</Badge>
                          </div>
                        </div>
                        {task.description ? <p className="mt-1 text-sm text-ink-700">{task.description}</p> : null}
                        <p className="mt-1 text-xs text-ink-500">
                          Owner: {task.ownerAdmin ? `${task.ownerAdmin.firstName} ${task.ownerAdmin.lastName}` : 'Unassigned'}
                          {task.dueAt ? ` • Due ${formatDate(task.dueAt)}` : ''}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const).map((status) => (
                            <Button
                              key={status}
                              variant={task.status === status ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => updateTaskStatus(task.id, status)}
                            >
                              {stageLabel(status)}
                            </Button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-3 space-y-3">
                  <Textarea label="Add note" rows={3} value={noteBody} onChange={(event) => setNoteBody(event.target.value)} />
                  <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                    <input type="checkbox" checked={notePinned} onChange={(event) => setNotePinned(event.target.checked)} />
                    Pin this note
                  </label>
                  <Button onClick={createNote} isLoading={isSending} loadingText="Saving note">
                    Save Note
                  </Button>
                  <div className="space-y-2 list-scroll">
                    {(activeFamily.crmProfileParent?.notes || []).map((note) => (
                      <article key={note.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-ink-900">{note.body}</p>
                          <Button variant="outline" size="sm" onClick={() => togglePinNote(note.id, note.isPinned)}>
                            {note.isPinned ? 'Unpin' : 'Pin'}
                          </Button>
                        </div>
                        <p className="mt-1 text-xs text-ink-500">
                          {formatDateTime(note.createdAt)} • {note.createdByAdmin ? `${note.createdByAdmin.firstName} ${note.createdByAdmin.lastName}` : 'System'}
                        </p>
                      </article>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="communications" className="mt-3 space-y-3">
                  {canSendNotifications ? (
                    <article className="rounded-field border border-line bg-white p-3 shadow-sm">
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input label="Subject" value={notifySubject} onChange={(event) => setNotifySubject(event.target.value)} />
                        <div className="flex items-end gap-3 pb-1">
                          <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                            <input type="checkbox" checked={notifyInApp} onChange={(event) => setNotifyInApp(event.target.checked)} />
                            In-app
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                            <input type="checkbox" checked={notifyEmail} onChange={(event) => setNotifyEmail(event.target.checked)} />
                            Email
                          </label>
                        </div>
                      </div>
                      <Textarea
                        label="Message"
                        value={notifyMessage}
                        onChange={(event) => setNotifyMessage(event.target.value)}
                        rows={3}
                        containerClassName="mt-2"
                      />
                      <Button className="mt-2" onClick={sendCommunication} isLoading={isSending} loadingText="Sending">
                        Send Communication
                      </Button>
                    </article>
                  ) : null}

                  <div className="space-y-2 list-scroll">
                    {activeFamily.communicationEvents.map((event) => (
                      <article key={event.id} className="rounded-field border border-line bg-white px-3 py-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-ink-900">{event.subject || 'Portal update'}</p>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="default">{event.channel}</Badge>
                            <Badge variant={event.status === 'FAILED' ? 'danger' : event.status === 'READ' ? 'default' : 'info'}>
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-ink-700">{event.message || 'No message body.'}</p>
                        <p className="mt-1 text-xs text-ink-500">
                          {formatDateTime(event.createdAt)} •{' '}
                          {event.createdByAdmin ? `${event.createdByAdmin.firstName} ${event.createdByAdmin.lastName}` : 'System'}
                        </p>
                      </article>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="sticky bottom-0 border-t border-line bg-white/90 pt-3">
                <Button variant="danger" onClick={() => setActiveFamilyId(null)}>
                  Close CRM
                </Button>
                <Link href={`/admin/families/${activeFamily.id}`} className={buttonStyles({ variant: 'outline', size: 'md' })}>
                  Open Full Profile
                </Link>
              </DialogFooter>
            </>
          ) : (
            <p className="state-empty">Family detail is unavailable.</p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
