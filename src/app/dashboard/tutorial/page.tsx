import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentTutorialRedirectPage() {
  return (
    <LegacyRouteRedirect
      title="Tutorial retired"
      description="This dashboard now focuses on enrollment and tuition only."
      target="/dashboard/family"
    />
  );
}
