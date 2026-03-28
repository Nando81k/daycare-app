import { LegacyRouteRedirect } from '@/components/common/LegacyRouteRedirect';

export default function ParentMessagesLegacyPage() {
  return (
    <LegacyRouteRedirect
      title="Messages module archived"
      description="Communication history is visible through billing and enrollment updates."
      target="/dashboard"
    />
  );
}
