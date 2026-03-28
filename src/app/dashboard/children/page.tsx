import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentChildrenLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Children moved to Family Hub"
      description="Child profiles and enrollment are now managed together in Family Hub."
      target="/dashboard/family"
    />
  );
}
