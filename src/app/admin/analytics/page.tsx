import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminAnalyticsPage() {
  return (
    <LegacyRouteRedirect
      title="Analytics moved into Billing"
      description="The standalone analytics module was consolidated into Billing for a simpler admin workflow."
      target="/admin/billing"
    />
  );
}
