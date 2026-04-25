import type { SurfaceCardProps } from "@/types/app"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const toneClasses: Record<NonNullable<SurfaceCardProps["tone"]>, string> = {
  default: "border border-border/60 bg-card",
  accent: "border border-accent/40 bg-accent/6",
  muted: "border border-border/40 bg-secondary/40",
  strong: "border border-border/70 bg-card",
}

const densityClasses: Record<NonNullable<SurfaceCardProps["density"]>, string> = {
  default: "gap-4 md:gap-5",
  compact: "gap-3 md:gap-4",
}

export function SurfaceCard({
  className,
  tone = "default",
  interactive = false,
  density = "default",
  ...props
}: SurfaceCardProps) {
  return (
    <Card
      className={cn(
        "rounded-sm shadow-none",
        toneClasses[tone],
        densityClasses[density],
        interactive && "transition-colors hover:border-accent/50 hover:bg-accent/4",
        className
      )}
      {...props}
    />
  )
}
