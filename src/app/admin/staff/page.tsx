import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminStaffLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Staff module archived"
      description="Staff scheduling moved out of active v3 scope."
      target="/admin"
    />
  );
}
