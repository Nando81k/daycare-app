import type { SectionShellProps } from "@/types/app"

import { cn } from "@/lib/utils"

export function SectionShell({
  eyebrow,
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
}: SectionShellProps) {
  return (
    <section className={cn("flex flex-col gap-10", className)}>
      {(eyebrow || title || description || actions) && (
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 space-y-5">
            {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
            {title ? (
              <h2 className="font-heading text-balance text-3xl leading-tight tracking-[-0.01em] text-foreground md:text-5xl">
                {title}
              </h2>
            ) : null}
          </div>
          {(description || actions) && (
            <div className="space-y-6 lg:col-span-6 lg:col-start-7">
              {description ? (
                <p className="text-base leading-7 text-muted-foreground md:text-lg">
                  {description}
                </p>
              ) : null}
              {actions ? (
                <div className="flex flex-wrap items-center gap-4">{actions}</div>
              ) : null}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex flex-col gap-6", contentClassName)}>{children}</div>
    </section>
  )
}
