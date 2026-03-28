import { NextResponse } from 'next/server';
import { FamilyCrmStage } from '@prisma/client';
import { getCrmOwners, getFamiliesCrmRows, type BalanceStateFilter, type TaskSlaFilter } from '@/lib/crm/families';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/rbac';
import { requireApiAdmin } from '@/lib/route-helpers';

export async function GET(request: Request) {
  try {
    const { error, user } = await requireApiAdmin(PERMISSIONS.CRM_READ);
    if (error || !user) return error;

    const params = new URL(request.url).searchParams;
    const page = Number(params.get('page') || '1');
    const pageSize = Number(params.get('pageSize') || '50');
    const query = params.get('query')?.trim() || '';
    const stage = (params.get('stage') || 'ALL') as FamilyCrmStage | 'ALL';
    const ownerId = (params.get('ownerId') || 'ALL') as string | 'ALL';
    const tag = (params.get('tag') || 'ALL') as string | 'ALL';
    const taskState = (params.get('taskState') || 'ALL') as TaskSlaFilter;
    const balanceState = (params.get('balanceState') || 'ALL') as BalanceStateFilter;
    const viewId = params.get('viewId');

    let resolvedFilters = {
      page,
      pageSize,
      query,
      stage,
      ownerId,
      tag,
      taskState,
      balanceState,
    };

    if (viewId) {
      const view = await prisma.familyCrmSavedView.findFirst({
        where: { id: viewId, adminUserId: user.id },
      });
      if (view) {
        const saved = (view.filtersJson || {}) as Record<string, unknown>;
        resolvedFilters = {
          page,
          pageSize,
          query: typeof saved.query === 'string' ? saved.query : query,
          stage:
            typeof saved.stage === 'string'
              ? (saved.stage as FamilyCrmStage | 'ALL')
              : stage,
          ownerId: typeof saved.ownerId === 'string' ? (saved.ownerId as string | 'ALL') : ownerId,
          tag: typeof saved.tag === 'string' ? (saved.tag as string | 'ALL') : tag,
          taskState:
            typeof saved.taskState === 'string'
              ? (saved.taskState as TaskSlaFilter)
              : taskState,
          balanceState:
            typeof saved.balanceState === 'string'
              ? (saved.balanceState as BalanceStateFilter)
              : balanceState,
        };
      }
    }

    const [result, owners, tags, views] = await Promise.all([
      getFamiliesCrmRows(resolvedFilters),
      getCrmOwners(),
      prisma.familyCrmTag.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.familyCrmSavedView.findMany({
        where: { adminUserId: user.id },
        orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      }),
    ]);

    return NextResponse.json({
      ...result,
      owners,
      tags,
      views,
      filters: resolvedFilters,
    });
  } catch (error) {
    console.error('CRM_FAMILIES_LIST_FAILED', error);
    return NextResponse.json(
      {
        error: {
          message:
            'CRM data is temporarily unavailable. Ensure Postgres is running and Prisma schema is synced, then refresh.',
        },
      },
      { status: 503 },
    );
  }
}
