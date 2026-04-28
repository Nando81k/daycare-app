import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
        "relative bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="grid gap-12 px-8 py-16 md:px-12 md:py-20 lg:grid-cols-12 lg:items-end lg:gap-16">
        <div className="lg:col-span-7">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          ) : null}
          <h2 className="mt-6 font-heading text-balance text-4xl leading-tight tracking-[-0.01em] md:text-5xl lg:text-[3.25rem]">
            {title}
          </h2>
        </div>

        <div className="lg:col-span-5">
          <p className="text-base leading-7 text-primary-foreground/80 md:text-lg">{description}</p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center bg-accent px-7 text-sm font-medium uppercase tracking-[0.18em] text-foreground transition-all duration-200 hover:bg-accent/90 hover:shadow-[0_10px_28px_-12px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={secondaryHref}
              className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground underline-offset-4 hover:underline"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
