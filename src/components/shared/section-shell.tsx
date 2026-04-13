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
    <section className={cn("flex flex-col gap-6", className)}>
      {(eyebrow || title || description || actions) && (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
            {title ? <h2 className="text-balance text-3xl leading-tight text-foreground md:text-[2.55rem]">{title}</h2> : null}
            {description ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      )}
      <div className={cn("flex flex-col gap-5", contentClassName)}>{children}</div>
    </section>
  )
}
