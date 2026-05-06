import { PageShell } from "@/components/shared/page-shell"
import {
  ConversationSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/skeletons"

export default function ParentMessagesLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <PageHeaderSkeleton variant="parent" actionCount={1} metricCount={0} />
      <ConversationSkeleton />
    </PageShell>
  )
}
