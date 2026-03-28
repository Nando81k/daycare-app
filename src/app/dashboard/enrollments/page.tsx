import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentEnrollmentsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Enrollment tracking moved"
      description="Track enrollment status directly inside Family Hub."
      target="/dashboard/family"
    />
  );
}
