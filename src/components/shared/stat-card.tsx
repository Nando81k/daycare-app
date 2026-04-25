import type { StatCardProps } from "@/types/app"

import { SurfaceCard } from "@/components/shared/surface-card"
import { cn } from "@/lib/utils"

export function StatCard({ label, value, description, trend, icon: Icon, density = "default" }: StatCardProps) {
  return (
    <SurfaceCard density={density} className="justify-between gap-4 px-5 py-5" interactive>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "font-heading tracking-[-0.01em] text-foreground",
              density === "compact" ? "text-2xl md:text-[1.7rem]" : "text-3xl md:text-[2rem]"
            )}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div className="text-accent">
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {trend ? (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{trend}</p>
      ) : null}
    </SurfaceCard>
  )
}
