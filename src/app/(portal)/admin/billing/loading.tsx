import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBillingLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </PageShell>
  )
}
