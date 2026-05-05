import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading skeleton for every marketing page. Mirrors the uniform hero stage
 * (navy section with min-h-184) so the layout doesn't jump when the real
 * page hydrates, plus a single content section with a card grid that fits
 * most pages (programs, about, faq, gallery).
 */
export default function MarketingLoading() {
  return (
    <main className="bg-background text-foreground">
      <HeroSkeleton />
      <SectionSkeleton />
    </main>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-navy text-white md:min-h-184">
      <div className="shell-container relative z-10 grid w-full gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="space-y-6 md:col-span-7">
          {/* Eyebrow chip */}
          <Skeleton className="h-7 w-44 rounded-full bg-white/10" />
          {/* Headline — three stacked rows to match h1 wrap */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-11/12 bg-white/10 md:h-16" />
            <Skeleton className="h-12 w-9/12 bg-white/10 md:h-16" />
            <Skeleton className="h-12 w-7/12 bg-white/10 md:h-16" />
          </div>
          {/* Description */}
          <div className="max-w-xl space-y-2 pt-2">
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-11/12 bg-white/10" />
            <Skeleton className="h-4 w-9/12 bg-white/10" />
          </div>
          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Skeleton className="h-12 w-36 rounded-full bg-brand-yellow/30" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        </div>

        <div className="hidden md:col-span-5 md:flex md:items-center md:justify-end">
          {/* Logo placeholder */}
          <Skeleton className="aspect-square w-full max-w-md rounded-4xl bg-white/10" />
        </div>
      </div>
    </section>
  )
}

function SectionSkeleton() {
  return (
    <section className="border-t border-border/60">
      <div className="shell-container py-20 md:py-24">
        {/* Section header */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-11/12" />
            <Skeleton className="h-8 w-9/12" />
          </div>
          <div className="space-y-2 lg:col-span-6 lg:col-start-7">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Card grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <article
              key={i}
              className="rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60"
            >
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="mt-5 h-6 w-9/12" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-11/12" />
              <Skeleton className="mt-2 h-4 w-7/12" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
