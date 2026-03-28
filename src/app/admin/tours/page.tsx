import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminToursLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Tours deprecated"
      description="Tours are no longer part of active operations."
      target="/admin/admissions"
    />
  );
}
