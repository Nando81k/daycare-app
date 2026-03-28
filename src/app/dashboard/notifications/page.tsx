import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentNotificationsRedirectPage() {
  return (
    <LegacyRouteRedirect
      title="Notifications moved"
      description="This dashboard now focuses on enrollment and tuition only."
      target="/dashboard/family"
    />
  );
}
