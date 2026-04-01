import { cn } from "@/lib/utils"

export function SectionShell({
  eyebrow,
  title,
  description,
  tone = "default",
  panel = false,
  className,
  contentClassName,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  tone?: "default" | "mist" | "warm"
  panel?: boolean
  className?: string
  contentClassName?: string
  children: React.ReactNode
}) {
  const toneClasses = {
    default: "",
    mist:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(241,247,245,0.86),rgba(255,255,255,0))]",
    warm:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(250,244,238,0.9),rgba(255,255,255,0))]",
  } as const

  return (
    <section className={cn("relative", toneClasses[tone], className)}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className={cn(panel && "soft-panel-strong px-6 py-8 sm:px-8 sm:py-10")}>
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-4 font-heading text-3xl tracking-tight text-balance text-foreground sm:text-[2.7rem]">
              {title}
            </h2>
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
          </div>
          <div className={cn("mt-10", contentClassName)}>{children}</div>
        </div>
      </div>
    </section>
  )
}
