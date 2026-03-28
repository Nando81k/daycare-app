import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminAttendanceLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Attendance module archived"
      description="Attendance moved out of active v3 scope."
      target="/admin"
    />
  );
}
