import type { SurfaceCardProps } from "@/types/app"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const toneClasses: Record<NonNullable<SurfaceCardProps["tone"]>, string> = {
  default: "surface-panel",
  accent: "surface-panel-emphasis",
  muted: "border-border/40 bg-muted/72 backdrop-blur-md",
  strong: "surface-panel-strong",
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
        toneClasses[tone],
        densityClasses[density],
        interactive && "row-hover",
        className
      )}
      {...props}
    />
  )
}
