import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminContentStaffLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Staff profiles archived"
      description="Content management moved out of active v3 scope."
      target="/admin"
    />
  );
}
