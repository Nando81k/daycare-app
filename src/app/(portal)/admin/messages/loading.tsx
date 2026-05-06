import { PageShell } from "@/components/shared/page-shell"
import {
  ConversationSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function AdminMessagesLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="admin" actionCount={2} metricCount={0} />
      <ConversationSkeleton />
    </PageShell>
  )
}
