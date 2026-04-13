import { SurfaceCard } from "@/components/shared/surface-card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingBlock({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <SurfaceCard className="gap-6 px-6 py-8">
      <div className="space-y-3">
        <h2 className="text-2xl text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </SurfaceCard>
  )
}
