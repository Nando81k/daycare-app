import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminTeamLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Team module archived"
      description="Staff and content management moved out of active v3 scope."
      target="/admin"
    />
  );
}
