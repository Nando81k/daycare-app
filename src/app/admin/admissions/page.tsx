import { prisma } from '@/lib/prisma';
import { DashboardHero } from '@/components/shell';
import { SimpleAdmissionsQueue } from '@/components/admin/SimpleAdmissionsQueue';
import { normalizeLegacyEnrollmentStatuses } from '@/lib/enrollment-normalization';

export const dynamic = 'force-dynamic';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'WAITLISTED' | 'REQUEST_INFO';
type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';

export default async function AdminAdmissionsPage() {
  await normalizeLegacyEnrollmentStatuses(prisma);

  const rows = await prisma.enrollmentApplication.findMany({
    include: {
      child: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      parent: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  });

  const pendingCount = rows.filter(
    (row) => row.status === 'PENDING' || row.status === 'WAITLISTED' || row.status === 'REQUEST_INFO',
  ).length;
  const approvedCount = rows.filter((row) => row.status === 'APPROVED').length;
  const rejectedCount = rows.filter((row) => row.status === 'DENIED').length;

  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="admin"
        eyebrow="Applications"
        title="Incoming Enrollment Applications"
        description="Review pending applications and issue simple approve/reject decisions."
        stats={[
          { label: 'Total', value: rows.length },
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
        ]}
      />

      <SimpleAdmissionsQueue
        rows={rows.map((row) => ({
          id: row.id,
          status: row.status as EnrollmentStatus,
          programType: row.programType as ProgramType,
          startDate: row.startDate ? row.startDate.toISOString() : null,
          createdAt: row.createdAt.toISOString(),
          child: row.child,
          parent: row.parent,
        }))}
      />
    </div>
  );
}
