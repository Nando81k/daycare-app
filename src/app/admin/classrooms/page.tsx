import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminClassroomsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Classrooms module archived"
      description="Classroom management moved out of active v3 scope."
      target="/admin"
    />
  );
}
