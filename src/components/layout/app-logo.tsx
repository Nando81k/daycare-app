import Link from "next/link"

import { brandConfig } from "@/config/brand"
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
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="inline-flex size-11 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(180deg,var(--color-brand-blue),var(--color-navy))] text-sm font-bold tracking-[0.16em] text-primary-foreground shadow-[0_18px_42px_-24px_rgba(13,59,120,0.55)]">
        AC
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-[1.32rem]" style={{ color: "var(--navy)" }}>{brandConfig.name}</span>
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
            Early learning center
          </span>
        </span>
      ) : null}
    </Link>
  )
}
