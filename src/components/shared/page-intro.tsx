import type { PageIntroProps } from "@/types/app"

import { cn } from "@/lib/utils"

export function PageIntro({ eyebrow, title, description, actions, align = "start" }: PageIntroProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-8 border-b border-border/60 pb-14 md:pb-20",
        align === "center" && "items-center text-center"
      )}
    >
      {eyebrow ? <p className="editorial-kicker">{eyebrow}</p> : null}

      <div className={cn("space-y-6", align === "center" ? "max-w-3xl" : "max-w-4xl")}>
        <h1 className="font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-foreground md:text-7xl lg:text-[5rem]">
          {title}
        </h1>
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-muted-foreground md:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      </div>

      {actions ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-4",
            align === "center" && "justify-center"
          )}
        >
          {actions}
        </div>
      ) : null}
    </section>
  )
}
