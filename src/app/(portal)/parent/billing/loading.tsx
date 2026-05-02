import { PageShell } from "@/components/shared/page-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function ParentBillingLoading() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </PageShell>
  )
}
