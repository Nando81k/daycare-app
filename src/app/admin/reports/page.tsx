import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminReportsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Reports module archived"
      description="Use the Billing and Overview pages for current reporting workflows."
      target="/admin/billing"
    />
  );
}
