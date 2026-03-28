import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminFamilyDetailRedirectPage() {
  return (
    <LegacyRouteRedirect
      title="Family detail moved"
      description="Admin dashboard now focuses on applications and payments only."
      target="/admin/admissions"
    />
  );
}
