import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminStaffScheduleLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Schedule module archived"
      description="Staff schedule workflows moved out of active v3 scope."
      target="/admin"
    />
  );
}
