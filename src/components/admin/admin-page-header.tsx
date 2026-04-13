import type { ReactNode } from "react"

import { SurfaceCard } from "@/components/shared/surface-card"
import { cn } from "@/lib/utils"

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <SurfaceCard
      tone="strong"
      density="compact"
      className={cn("gap-4 px-5 py-5 md:px-6 md:py-5", className)}
    >
      <div className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,1.2fr)_auto] xl:items-end">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
          <div className="space-y-2">
            <h1 className="text-balance text-[2rem] leading-tight text-foreground md:text-[2.45rem]">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[0.98rem]">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2.5 xl:justify-end">{actions}</div> : null}
      </div>
      {children ? (
        <div className="grid gap-2.5 border-t border-border/55 pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {children}
        </div>
      ) : null}
    </SurfaceCard>
  )
}
