import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminSettingsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Settings moved"
      description="Operational policy controls are now available under Billing."
      target="/admin/billing"
    />
  );
}
