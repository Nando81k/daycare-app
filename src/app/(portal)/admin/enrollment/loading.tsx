import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEnrollmentLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </PageShell>
  )
}
