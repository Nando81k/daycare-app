import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminTestimonialsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Testimonials module archived"
      description="Content management moved out of active v3 scope."
      target="/admin"
    />
  );
}
