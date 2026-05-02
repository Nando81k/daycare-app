import { LoadingBlock } from "@/components/shared/loading-block"
import { PageShell } from "@/components/shared/page-shell"

export default function AdminLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <LoadingBlock
        title="Loading the admin workspace"
        description="Fetching enrollments, balances, and classroom updates."
      />
    </PageShell>
  )
}
