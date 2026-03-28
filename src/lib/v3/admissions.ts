export type AdmissionsEnrollmentStatus = 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'DENIED' | 'REQUEST_INFO';
export type AdmissionsProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';
export type AdmissionsPaymentState = 'NOT_APPLICABLE' | 'AWAITING_SECURE_SPOT' | 'HOLD_EXPIRING' | 'SECURED';

const HOLD_EXPIRY_SOON_HOURS = 24;

export type RawAdmissionsEnrollmentRow = {
  id: string;
  intakeBatchId: string | null;
  status: AdmissionsEnrollmentStatus;
  programType: AdmissionsProgramType;
  startDate: Date | null;
  requiredIntakeComplete: boolean;
  intakeMissingFields: string[];
  notes: string | null;
  reviewNotes: string | null;
  decisionReason: string | null;
  spotHoldExpiresAt: Date | null;
  spotSecuredAt: Date | null;
  selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
  createdAt: Date;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    allergies: string | null;
    medicalNotes: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    guardianSsnLast4Masked?: string | null;
  };
};

export type GroupedAdmissionsChild = {
  enrollmentId: string;
  status: AdmissionsEnrollmentStatus;
  programType: AdmissionsProgramType;
  startDate: string | null;
  requiredIntakeComplete: boolean;
  intakeMissingFields: string[];
  notes: string | null;
  reviewNotes: string | null;
  decisionReason: string | null;
  spotHoldExpiresAt: string | null;
  spotSecuredAt: string | null;
  selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
  handoff: {
    paymentState: AdmissionsPaymentState;
    holdExpiresAt: string | null;
    spotSecuredAt: string | null;
    selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
    isHoldExpiringSoon: boolean;
  };
  createdAt: string;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    allergies: string | null;
    medicalNotes: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  };
};

export type GroupedAdmissionsRow = {
  groupKey: string;
  intakeBatchId: string | null;
  submittedAt: string;
  batchReadiness: {
    readyToApproveCount: number;
    missingRequiredCount: number;
    exceptionCount: number;
  };
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    guardianSsnLast4Masked?: string | null;
  };
  children: GroupedAdmissionsChild[];
  programs: AdmissionsProgramType[];
  statusCounts: Record<AdmissionsEnrollmentStatus, number>;
};

const STATUS_ORDER: AdmissionsEnrollmentStatus[] = ['PENDING', 'REQUEST_INFO', 'APPROVED', 'WAITLISTED', 'DENIED'];
const LEGACY_BATCH_WINDOW_MS = 15_000;

function emptyStatusCounts(): Record<AdmissionsEnrollmentStatus, number> {
  return {
    PENDING: 0,
    REQUEST_INFO: 0,
    APPROVED: 0,
    WAITLISTED: 0,
    DENIED: 0,
  };
}

function normalizeProgramSet(children: GroupedAdmissionsChild[]) {
  return Array.from(new Set(children.map((child) => child.programType)));
}

function buildStatusCounts(children: GroupedAdmissionsChild[]) {
  const counts = emptyStatusCounts();
  for (const child of children) {
    counts[child.status] += 1;
  }
  return counts;
}

function newestSubmittedAt(children: GroupedAdmissionsChild[]) {
  const newest = children.reduce((latest, child) => {
    const next = new Date(child.createdAt).getTime();
    return next > latest ? next : latest;
  }, 0);
  return new Date(newest).toISOString();
}

function childMissingFields(child: GroupedAdmissionsChild) {
  const missing = new Set<string>(child.intakeMissingFields ?? []);
  if (!child.startDate) {
    missing.add('startDate');
  }
  return Array.from(missing);
}

function getPaymentHandoff(input: {
  status: AdmissionsEnrollmentStatus;
  spotHoldExpiresAt: Date | null;
  spotSecuredAt: Date | null;
  selectedCadence: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | null;
}) {
  const holdExpiresAt = input.spotHoldExpiresAt ? input.spotHoldExpiresAt.toISOString() : null;
  const spotSecuredAt = input.spotSecuredAt ? input.spotSecuredAt.toISOString() : null;
  const now = Date.now();
  const holdMs = input.spotHoldExpiresAt ? input.spotHoldExpiresAt.getTime() - now : null;
  const isHoldExpiringSoon = typeof holdMs === 'number' && holdMs > 0 && holdMs <= HOLD_EXPIRY_SOON_HOURS * 60 * 60 * 1000;

  if (input.status !== 'APPROVED') {
    return {
      paymentState: 'NOT_APPLICABLE' as AdmissionsPaymentState,
      holdExpiresAt,
      spotSecuredAt,
      selectedCadence: input.selectedCadence,
      isHoldExpiringSoon,
    };
  }

  if (input.spotSecuredAt) {
    return {
      paymentState: 'SECURED' as AdmissionsPaymentState,
      holdExpiresAt,
      spotSecuredAt,
      selectedCadence: input.selectedCadence,
      isHoldExpiringSoon: false,
    };
  }

  if (isHoldExpiringSoon) {
    return {
      paymentState: 'HOLD_EXPIRING' as AdmissionsPaymentState,
      holdExpiresAt,
      spotSecuredAt,
      selectedCadence: input.selectedCadence,
      isHoldExpiringSoon,
    };
  }

  return {
    paymentState: 'AWAITING_SECURE_SPOT' as AdmissionsPaymentState,
    holdExpiresAt,
    spotSecuredAt,
    selectedCadence: input.selectedCadence,
    isHoldExpiringSoon,
  };
}

function isActionable(child: GroupedAdmissionsChild) {
  return child.status !== 'APPROVED' && child.status !== 'DENIED';
}

function buildBatchReadiness(children: GroupedAdmissionsChild[]) {
  let readyToApproveCount = 0;
  let missingRequiredCount = 0;
  let exceptionCount = 0;

  for (const child of children) {
    if (!isActionable(child)) continue;
    const missing = childMissingFields(child);
    if (missing.length === 0) {
      readyToApproveCount += 1;
      continue;
    }
    missingRequiredCount += 1;
    exceptionCount += 1;
  }

  return {
    readyToApproveCount,
    missingRequiredCount,
    exceptionCount,
  };
}

export function rebuildGroupedAdmissionsRow(row: GroupedAdmissionsRow): GroupedAdmissionsRow {
  const sortedChildren = [...row.children].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return {
    ...row,
    children: sortedChildren,
    programs: normalizeProgramSet(sortedChildren),
    statusCounts: buildStatusCounts(sortedChildren),
    batchReadiness: buildBatchReadiness(sortedChildren),
    submittedAt: newestSubmittedAt(sortedChildren),
  };
}

export function formatAdmissionStatusSummary(statusCounts: Record<AdmissionsEnrollmentStatus, number>) {
  return STATUS_ORDER.filter((status) => statusCounts[status] > 0)
    .map((status) => `${statusCounts[status]} ${status.replace('_', ' ')}`)
    .join(', ');
}

export function groupAdmissionsRows(rows: RawAdmissionsEnrollmentRow[]): GroupedAdmissionsRow[] {
  const legacyFallbackGroupKeys = buildLegacyFallbackGroupKeys(rows);
  const grouped = new Map<string, GroupedAdmissionsRow>();

  for (const row of rows) {
    const groupKey = row.intakeBatchId ?? legacyFallbackGroupKeys.get(row.id) ?? row.id;
    const existing = grouped.get(groupKey);

    const child: GroupedAdmissionsChild = {
      enrollmentId: row.id,
      status: row.status,
      programType: row.programType,
      startDate: row.startDate ? row.startDate.toISOString() : null,
      requiredIntakeComplete: row.requiredIntakeComplete,
      intakeMissingFields: row.intakeMissingFields ?? [],
      notes: row.notes ?? null,
      reviewNotes: row.reviewNotes ?? null,
      decisionReason: row.decisionReason ?? null,
      spotHoldExpiresAt: row.spotHoldExpiresAt ? row.spotHoldExpiresAt.toISOString() : null,
      spotSecuredAt: row.spotSecuredAt ? row.spotSecuredAt.toISOString() : null,
      selectedCadence: row.selectedCadence ?? null,
      handoff: getPaymentHandoff({
        status: row.status,
        spotHoldExpiresAt: row.spotHoldExpiresAt,
        spotSecuredAt: row.spotSecuredAt,
        selectedCadence: row.selectedCadence ?? null,
      }),
      createdAt: row.createdAt.toISOString(),
      child: {
        id: row.child.id,
        firstName: row.child.firstName,
        lastName: row.child.lastName,
        dateOfBirth: row.child.dateOfBirth.toISOString(),
        allergies: row.child.allergies,
        medicalNotes: row.child.medicalNotes,
        emergencyContactName: row.child.emergencyContactName,
        emergencyContactPhone: row.child.emergencyContactPhone,
      },
    };

    if (!existing) {
      grouped.set(groupKey, {
        groupKey,
        intakeBatchId: row.intakeBatchId,
        submittedAt: row.createdAt.toISOString(),
        parent: {
          id: row.parent.id,
          firstName: row.parent.firstName,
          lastName: row.parent.lastName,
          email: row.parent.email,
          phone: row.parent.phone,
          guardianSsnLast4Masked: row.parent.guardianSsnLast4Masked ?? null,
        },
        children: [child],
        programs: [row.programType],
        statusCounts: emptyStatusCounts(),
        batchReadiness: {
          readyToApproveCount: 0,
          missingRequiredCount: 0,
          exceptionCount: 0,
        },
      });
      continue;
    }

    existing.children.push(child);
    grouped.set(groupKey, existing);
  }

  return Array.from(grouped.values())
    .map((row) => rebuildGroupedAdmissionsRow(row))
    .sort((a, b) => {
      const aTime = new Date(a.submittedAt).getTime();
      const bTime = new Date(b.submittedAt).getTime();
      return bTime - aTime;
    });
}

function buildLegacyFallbackGroupKeys(rows: RawAdmissionsEnrollmentRow[]) {
  const fallback = new Map<string, string>();
  const noBatchRows = rows
    .filter((row) => !row.intakeBatchId)
    .sort((a, b) => {
      if (a.parent.id !== b.parent.id) return a.parent.id.localeCompare(b.parent.id);
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

  type Cluster = {
    parentId: string;
    firstTimestampMs: number;
    lastTimestampMs: number;
    enrollmentIds: string[];
  };

  let cluster: Cluster | null = null;

  function flushCluster() {
    if (!cluster || cluster.enrollmentIds.length < 2) {
      cluster = null;
      return;
    }

    const key = `legacy_batch_${cluster.parentId}_${cluster.firstTimestampMs}`;
    for (const enrollmentId of cluster.enrollmentIds) {
      fallback.set(enrollmentId, key);
    }
    cluster = null;
  }

  for (const row of noBatchRows) {
    const timestamp = row.createdAt.getTime();

    if (!cluster) {
      cluster = {
        parentId: row.parent.id,
        firstTimestampMs: timestamp,
        lastTimestampMs: timestamp,
        enrollmentIds: [row.id],
      };
      continue;
    }

    const sameParent = cluster.parentId === row.parent.id;
    const withinWindow = timestamp - cluster.lastTimestampMs <= LEGACY_BATCH_WINDOW_MS;

    if (!sameParent || !withinWindow) {
      flushCluster();
      cluster = {
        parentId: row.parent.id,
        firstTimestampMs: timestamp,
        lastTimestampMs: timestamp,
        enrollmentIds: [row.id],
      };
      continue;
    }

    cluster.enrollmentIds.push(row.id);
    cluster.lastTimestampMs = timestamp;
  }

  flushCluster();
  return fallback;
}
