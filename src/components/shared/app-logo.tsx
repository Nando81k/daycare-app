import Link from "next/link"
import { Flower2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

export function AppLogo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string
  compact?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-95",
        className
      )}
    >
      <span className="relative flex size-10 items-center justify-center rounded-[1.15rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(124,168,164,0.98),rgba(103,151,148,0.92))] text-primary-foreground shadow-[0_22px_44px_-24px_rgba(71,130,126,0.72)]">
        <span className="absolute inset-[1px] rounded-[calc(1.15rem-1px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.15),transparent)]" />
        <Flower2Icon className="relative size-4" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[1.08rem] font-semibold tracking-tight">
            Abassadors Care
          </span>
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
            Daycare & family portal
          </span>
        </span>
      )}
    </Link>
  )
}
