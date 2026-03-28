import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentEnrollLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Enrollment moved"
      description="Enrollment is now part of the Family Hub guided workflow."
      target="/dashboard/family"
    />
  );
}
