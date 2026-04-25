import type { PageIntroProps } from "@/types/app"

import { cn } from "@/lib/utils"

export function PageIntro({ eyebrow, title, description, actions, align = "start" }: PageIntroProps) {
  return (
    <section
      className={cn(
        "surface-panel-strong section-grid relative flex flex-col gap-6 overflow-hidden px-6 py-8 md:px-8 md:py-10",
        align === "center" && "items-center text-center"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(184,146,74,0.18),transparent_70%)]" />
      <div className={cn("relative max-w-3xl space-y-4", align === "center" && "items-center text-center")}>
        {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}
        <div className="space-y-3">
          <h1 className="text-balance text-4xl leading-tight text-foreground md:text-[3.7rem]">{title}</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.08rem]">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className={cn("relative flex flex-wrap items-center gap-3", align === "center" && "justify-center")}>
          {actions}
        </div>
      ) : null}
    </section>
  )
}
