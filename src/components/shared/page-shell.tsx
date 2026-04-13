import type * as React from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"main"> & {
  variant?: "default" | "portal"
}) {
  return (
    <main
      className={cn(
        variant === "portal"
          ? "flex min-w-0 flex-col gap-5 pb-8 md:gap-6 md:pb-10"
          : "shell-container flex flex-col gap-10 py-8 md:gap-12 md:py-10",
        className
      )}
      {...props}
    />
  )
}
