import { FamilyCrmStage, FamilyCrmTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type TaskSlaFilter = 'ALL' | 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NONE';
export type BalanceStateFilter = 'ALL' | 'CLEAR' | 'OPEN' | 'PAST_DUE';

export interface FamiliesCrmQueryInput {
  page?: number;
  pageSize?: number;
  query?: string;
  stage?: FamilyCrmStage | 'ALL';
  ownerId?: string | 'ALL';
  tag?: string | 'ALL';
  taskState?: TaskSlaFilter;
  balanceState?: BalanceStateFilter;
}

export interface FamiliesCrmRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  childrenCount: number;
  latestEnrollment: {
    id: string;
    status: string;
    programType: string;
    createdAt: string;
  } | null;
  outstandingBalanceCents: number;
  openInvoiceCount: number;
  pastDueInvoiceCount: number;
  crmStage: FamilyCrmStage;
  suggestedStage: FamilyCrmStage | null;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  nextTaskDueAt: string | null;
  openTaskCount: number;
  lastContactedAt: string | null;
  tagNames: string[];
  riskFlags: string[];
  nextAction: string;
  slaState: 'OVERDUE' | 'TODAY' | 'UPCOMING' | 'NONE';
  handoffState: 'ADMISSIONS_REVIEW' | 'AWAITING_SECURE_SPOT' | 'BILLING_FOLLOW_UP' | 'TASK_FOLLOW_UP' | 'STABLE';
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function taskFilterToWhere(taskFilter: TaskSlaFilter, today: Date, tomorrow: Date) {
  switch (taskFilter) {
    case 'NONE':
      return {
        none: {
          status: { not: FamilyCrmTaskStatus.DONE },
        },
      };
    case 'OVERDUE':
      return {
        some: {
          status: { not: FamilyCrmTaskStatus.DONE },
          dueAt: { lt: today },
        },
      };
    case 'TODAY':
      return {
        some: {
          status: { not: FamilyCrmTaskStatus.DONE },
          dueAt: { gte: today, lt: tomorrow },
        },
      };
    case 'UPCOMING':
      return {
        some: {
          status: { not: FamilyCrmTaskStatus.DONE },
          dueAt: { gte: tomorrow },
        },
      };
    default:
      return undefined;
  }
}

function buildRiskFlags(input: {
  pastDueInvoiceCount: number;
  openInvoiceCount: number;
  latestEnrollmentStatus: string | null;
  hasApprovedWithoutSpot: boolean;
  isActive: boolean;
}) {
  const flags: string[] = [];
  if (!input.isActive) flags.push('INACTIVE_ACCOUNT');
  if (input.pastDueInvoiceCount > 0) flags.push('PAST_DUE_BALANCE');
  if (input.openInvoiceCount >= 3) flags.push('HIGH_OPEN_INVOICES');
  if (input.latestEnrollmentStatus === 'REQUEST_INFO') flags.push('ADMISSIONS_INFO_REQUIRED');
  if (input.hasApprovedWithoutSpot) flags.push('AWAITING_SPOT_SECURE');
  return flags;
}

function deriveSlaState(nextTaskDueAt: Date | null, now: Date): FamiliesCrmRow['slaState'] {
  if (!nextTaskDueAt) return 'NONE';
  const today = startOfDay(now).getTime();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dueMs = nextTaskDueAt.getTime();
  if (dueMs < today) return 'OVERDUE';
  if (dueMs < tomorrow.getTime()) return 'TODAY';
  return 'UPCOMING';
}

function deriveRowSummaries(input: {
  latestEnrollmentStatus: string | null;
  hasApprovedWithoutSpot: boolean;
  pastDueInvoiceCount: number;
  openTaskCount: number;
}): Pick<FamiliesCrmRow, 'nextAction' | 'handoffState'> {
  if (input.latestEnrollmentStatus === 'REQUEST_INFO') {
    return {
      nextAction: 'Request updated intake details and re-review admissions status.',
      handoffState: 'ADMISSIONS_REVIEW',
    };
  }
  if (input.latestEnrollmentStatus === 'PENDING') {
    return {
      nextAction: 'Review the newest enrollment and publish a decision.',
      handoffState: 'ADMISSIONS_REVIEW',
    };
  }
  if (input.hasApprovedWithoutSpot) {
    return {
      nextAction: 'Follow up on secure-spot checkout before hold expiry.',
      handoffState: 'AWAITING_SECURE_SPOT',
    };
  }
  if (input.pastDueInvoiceCount > 0) {
    return {
      nextAction: 'Run billing follow-up on past-due balances.',
      handoffState: 'BILLING_FOLLOW_UP',
    };
  }
  if (input.openTaskCount > 0) {
    return {
      nextAction: 'Complete open CRM follow-up tasks.',
      handoffState: 'TASK_FOLLOW_UP',
    };
  }
  return {
    nextAction: 'No urgent blockers. Keep routine family follow-up current.',
    handoffState: 'STABLE',
  };
}

export async function getFamiliesCrmRows(input: FamiliesCrmQueryInput) {
  const page = Math.max(1, Number(input.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(input.pageSize) || 50));
  const query = input.query?.trim() || '';
  const stage = input.stage && input.stage !== 'ALL' ? input.stage : undefined;
  const ownerId = input.ownerId && input.ownerId !== 'ALL' ? input.ownerId : undefined;
  const tag = input.tag && input.tag !== 'ALL' ? input.tag : undefined;
  const taskState: TaskSlaFilter = input.taskState || 'ALL';
  const balanceState: BalanceStateFilter = input.balanceState || 'ALL';

  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const taskWhere = taskFilterToWhere(taskState, today, tomorrow);

  const where: any = {
    role: 'PARENT',
    ...(query
      ? {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { children: { some: { firstName: { contains: query, mode: 'insensitive' } } } },
            { children: { some: { lastName: { contains: query, mode: 'insensitive' } } } },
          ],
        }
      : {}),
    ...(balanceState === 'PAST_DUE'
      ? { invoices: { some: { status: 'PAST_DUE' } } }
      : balanceState === 'OPEN'
        ? {
            invoices: { some: { status: 'OPEN' } },
          }
        : balanceState === 'CLEAR'
          ? {
              invoices: { none: { status: { in: ['OPEN', 'PAST_DUE'] } } },
            }
          : {}),
    crmProfileParent: {
      ...(stage ? { stage } : {}),
      ...(ownerId ? { ownerAdminId: ownerId } : {}),
      ...(taskWhere ? { tasks: taskWhere } : {}),
      ...(tag
        ? {
            tags: {
              some: {
                tag: {
                  name: tag,
                },
              },
            },
          }
        : {}),
    },
  };

  const [total, parents] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        children: {
          select: { id: true },
        },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            programType: true,
            createdAt: true,
            spotSecuredAt: true,
          },
        },
        invoices: {
          where: { status: { in: ['OPEN', 'PAST_DUE'] } },
          select: { amountDueCents: true, status: true },
        },
        crmProfileParent: {
          include: {
            ownerAdmin: {
              select: { id: true, firstName: true, lastName: true },
            },
            tasks: {
              where: { status: { not: FamilyCrmTaskStatus.DONE } },
              select: { id: true, dueAt: true },
              orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
            },
            tags: {
              include: { tag: true },
            },
          },
        },
      },
      orderBy: [{ crmProfileParent: { updatedAt: 'desc' } }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const rows: FamiliesCrmRow[] = parents.map((parent) => {
    const profile = parent.crmProfileParent;
    const latestEnrollment = parent.enrollments[0] ?? null;
    const outstandingBalanceCents = parent.invoices.reduce((sum, invoice) => sum + invoice.amountDueCents, 0);
    const openInvoiceCount = parent.invoices.filter((invoice) => invoice.status === 'OPEN').length;
    const pastDueInvoiceCount = parent.invoices.filter((invoice) => invoice.status === 'PAST_DUE').length;
    const openTasks = profile?.tasks ?? [];
    const nextTaskDueAt = openTasks.find((task) => task.dueAt)?.dueAt ?? null;
    const tagNames = (profile?.tags ?? []).map((profileTag) => profileTag.tag.name).sort((a, b) => a.localeCompare(b));
    const hasApprovedWithoutSpot = parent.enrollments.some(
      (enrollment) => enrollment.status === 'APPROVED' && !enrollment.spotSecuredAt,
    );

    const rowSummary = deriveRowSummaries({
      latestEnrollmentStatus: latestEnrollment?.status ?? null,
      hasApprovedWithoutSpot,
      pastDueInvoiceCount,
      openTaskCount: openTasks.length,
    });

    return {
      id: parent.id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      phone: parent.phone,
      isActive: parent.isActive,
      createdAt: parent.createdAt.toISOString(),
      childrenCount: parent.children.length,
      latestEnrollment: latestEnrollment
        ? {
            id: latestEnrollment.id,
            status: latestEnrollment.status,
            programType: latestEnrollment.programType,
            createdAt: latestEnrollment.createdAt.toISOString(),
          }
        : null,
      outstandingBalanceCents,
      openInvoiceCount,
      pastDueInvoiceCount,
      crmStage: profile?.stage ?? FamilyCrmStage.LEAD,
      suggestedStage: profile?.suggestedStage ?? null,
      owner: profile?.ownerAdmin ?? null,
      nextTaskDueAt: nextTaskDueAt ? nextTaskDueAt.toISOString() : null,
      openTaskCount: openTasks.length,
      lastContactedAt: profile?.lastContactedAt ? profile.lastContactedAt.toISOString() : null,
      tagNames,
      riskFlags: buildRiskFlags({
        pastDueInvoiceCount,
        openInvoiceCount,
        latestEnrollmentStatus: latestEnrollment?.status ?? null,
        hasApprovedWithoutSpot,
        isActive: parent.isActive,
      }),
      nextAction: rowSummary.nextAction,
      handoffState: rowSummary.handoffState,
      slaState: deriveSlaState(nextTaskDueAt, now),
    };
  });

  return {
    rows,
    page,
    pageSize,
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCrmOwners() {
  return prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      adminRole: true,
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });
}
