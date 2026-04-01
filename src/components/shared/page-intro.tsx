import { Badge } from "@/components/ui/badge"

export function PageIntro({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string
  title: string
  description: string
  badge?: string
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
      <div className="soft-panel-strong relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="max-w-3xl font-heading text-4xl tracking-tight text-balance text-foreground sm:text-5xl">
            {title}
          </h1>
          {badge && (
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {badge}
            </Badge>
          )}
        </div>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  )
}
