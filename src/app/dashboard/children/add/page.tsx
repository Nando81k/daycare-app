import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentChildrenAddLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Add child moved"
      description="Use Family Hub to add child details and submit enrollment in one flow."
      target="/dashboard/family"
    />
  );
}
