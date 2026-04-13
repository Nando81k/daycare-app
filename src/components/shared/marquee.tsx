"use client"

import { useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  speed = 40,
}: {
  children: React.ReactNode
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  speed?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={cn("flex gap-10 overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:2.5rem]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 gap-[var(--gap)] [animation:marquee_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--duration": `${speed}s` } as React.CSSProperties}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0 gap-[var(--gap)] [animation:marquee_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--duration": `${speed}s` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
}
