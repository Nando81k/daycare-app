import type { StatCardProps } from "@/types/app"

import { SurfaceCard } from "@/components/shared/surface-card"

export function StatCard({ label, value, description, trend, icon: Icon, density = "default" }: StatCardProps) {
  return (
    <SurfaceCard density={density} className="justify-between" interactive>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p
            className={
              density === "compact"
                ? "text-2xl font-semibold tracking-tight text-foreground md:text-[1.8rem]"
                : "text-3xl font-semibold tracking-tight text-foreground md:text-[2.15rem]"
            }
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <div className="rounded-2xl border border-border/55 bg-background/88 p-2.5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
      {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {trend ? <p className="text-sm font-medium text-primary/90">{trend}</p> : null}
    </SurfaceCard>
  )
}
