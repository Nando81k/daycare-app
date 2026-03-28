import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentAttendanceLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Attendance module archived"
      description="Attendance is out of active v3 scope for this release."
      target="/dashboard"
    />
  );
}
