import { Skeleton } from "@/components/ui/skeleton"

export default function ParentEnrollmentLoading() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-1.5 flex-1 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex h-[calc(100vh-12rem)] min-h-[600px] flex-col gap-4 rounded-xl border border-border/60 bg-white/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-9" />
        </div>
      </div>
    </div>
  )
}
