import type { TableSurfaceProps } from "@/types/app"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function TableSurface({
  title,
  description,
  children,
  toolbar,
  footer,
  className,
  size = "default",
  contentClassName,
}: TableSurfaceProps) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-[1.55rem] border-border/45 bg-card/92",
        size === "compact" && "rounded-[1.35rem]",
        className
      )}
    >
      <CardHeader
        className={cn(
          "border-b border-border/45 p-4 md:p-5",
          size === "compact" && "p-3.5 md:p-4"
        )}
      >
        <CardTitle className={cn(size === "compact" ? "text-xl" : "text-[1.35rem]")}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {toolbar ? (
        <div
          className={cn(
            "border-b border-border/45 px-4 py-3 md:px-5",
            size === "compact" && "px-3.5 py-2.5 md:px-4"
          )}
        >
          {toolbar}
        </div>
      ) : null}
      <CardContent className={cn("overflow-x-auto px-0", contentClassName)}>{children}</CardContent>
      {footer ? (
        <div
          className={cn(
            "border-t border-border/45 px-4 py-3 md:px-5",
            size === "compact" && "px-3.5 py-2.5 md:px-4"
          )}
        >
          {footer}
        </div>
      ) : null}
    </Card>
  )
}
