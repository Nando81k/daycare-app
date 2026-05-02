import { LoadingBlock } from "@/components/shared/loading-block"
import { PageShell } from "@/components/shared/page-shell"

export default function ParentLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <LoadingBlock
        title="Preparing your portal"
        description="Loading the latest from your child's classroom and billing."
      />
    </PageShell>
  )
}
