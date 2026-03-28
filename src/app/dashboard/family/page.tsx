import { prisma } from '@/lib/prisma';
import { DashboardHero } from '@/components/shell';
import { SimpleEnrollmentDashboard } from '@/components/dashboard/SimpleEnrollmentDashboard';
import { getSessionUser } from '@/lib/auth';
import { normalizeLegacyEnrollmentStatuses } from '@/lib/enrollment-normalization';

export const dynamic = 'force-dynamic';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'WAITLISTED' | 'REQUEST_INFO';
type ProgramType = 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K';

export default async function ParentEnrollmentPage() {
  const user = await getSessionUser();
  if (!user) return null;

  await normalizeLegacyEnrollmentStatuses(prisma);

  const enrollments = await prisma.enrollmentApplication.findMany({
    where: { parentId: user.id },
    include: {
      child: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
  });

  const pendingCount = enrollments.filter(
    (row) => row.status === 'PENDING' || row.status === 'WAITLISTED' || row.status === 'REQUEST_INFO',
  ).length;
  const approvedCount = enrollments.filter((row) => row.status === 'APPROVED').length;
  const rejectedCount = enrollments.filter((row) => row.status === 'DENIED').length;

  return (
    <div className="dashboard-page">
      <DashboardHero
        tone="parent"
        eyebrow="Enrollment"
        title="Child Enrollment"
        description="Submit child applications and track decisions in one simple workflow."
        stats={[
          { label: 'Applications', value: enrollments.length },
          { label: 'Pending', value: pendingCount },
          { label: 'Approved', value: approvedCount },
          { label: 'Rejected', value: rejectedCount },
        ]}
      />

      <SimpleEnrollmentDashboard
        initialEnrollments={enrollments.map((row) => ({
          id: row.id,
          status: row.status as EnrollmentStatus,
          programType: row.programType as ProgramType,
          startDate: row.startDate ? row.startDate.toISOString() : null,
          createdAt: row.createdAt.toISOString(),
          child: row.child,
        }))}
      />
    </div>
  );
}
