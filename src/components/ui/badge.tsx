import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit items-center justify-center rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.02em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border/70 bg-background/78 text-muted-foreground",
        outline: "border-border/70 bg-transparent text-foreground",
        success: "border-transparent bg-emerald-500/14 text-emerald-700",
        warning: "border-transparent bg-amber-500/16 text-amber-800",
        destructive: "border-transparent bg-destructive/12 text-destructive",
        info: "border-transparent bg-sky-500/14 text-sky-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
