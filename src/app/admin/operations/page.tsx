import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function AdminOperationsLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Operations module moved"
      description="Classrooms and attendance workflows are now consolidated into Admissions + Families in v3."
      target="/admin/admissions"
    />
  );
}
