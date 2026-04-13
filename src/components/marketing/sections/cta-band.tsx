import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CtaBand({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
}: {
  eyebrow?: string
  title: string
  description: string
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  className?: string
}) {
  return (
    <section
      className={cn(
        "surface-panel-emphasis section-grid relative overflow-hidden px-6 py-8 md:px-8 md:py-10",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(118,158,154,0.22),transparent_70%)]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
          <h2 className="text-balance text-4xl leading-tight text-foreground md:text-[3rem]">{title}</h2>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href={primaryHref}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-12 px-7 text-base font-semibold shadow-md transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:brightness-110"
            )}
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 px-7 text-base font-semibold transition-all duration-200 hover:scale-[1.03] hover:border-primary/40 hover:shadow-md"
            )}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
