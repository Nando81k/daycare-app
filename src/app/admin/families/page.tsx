import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminFamiliesRedirectPage() {
  return (
    <LegacyRouteRedirect
      title="Family CRM moved"
      description="Admin dashboard now focuses on applications and payments only."
      target="/admin/admissions"
    />
  );
}
