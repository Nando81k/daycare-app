import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminTutorialRedirectPage() {
  return (
    <LegacyRouteRedirect
      title="Tutorial retired"
      description="Admin dashboard now focuses on applications and payments only."
      target="/admin/admissions"
    />
  );
}
