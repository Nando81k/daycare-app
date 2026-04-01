import { Badge } from "@/components/ui/badge"

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  badge?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="soft-panel relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_center,rgba(124,168,164,0.12),transparent_65%)]" />
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl tracking-tight text-balance text-foreground sm:text-4xl">
              {title}
            </h1>
            {badge && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {badge}
              </Badge>
            )}
          </div>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  )
}
