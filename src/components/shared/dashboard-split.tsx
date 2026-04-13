"use client"

import type { ReactNode } from "react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export function DashboardSplit({
  primary,
  secondary,
  className,
  primaryDefaultSize = 62,
  secondaryDefaultSize = 38,
  primaryMinSize = 48,
  secondaryMinSize = 28,
}: {
  primary: ReactNode
  secondary: ReactNode
  className?: string
  primaryDefaultSize?: number
  secondaryDefaultSize?: number
  primaryMinSize?: number
  secondaryMinSize?: number
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <div className={cn("grid gap-4", className)}>{primary}{secondary}</div>
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className={cn("min-h-[42rem] gap-4", className)}>
      <ResizablePanel defaultSize={primaryDefaultSize} minSize={primaryMinSize}>
        <div className="h-full min-w-0">{primary}</div>
      </ResizablePanel>
      <ResizableHandle withHandle className="mx-1 rounded-full bg-border/75" />
      <ResizablePanel defaultSize={secondaryDefaultSize} minSize={secondaryMinSize}>
        <div className="h-full min-w-0">{secondary}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
