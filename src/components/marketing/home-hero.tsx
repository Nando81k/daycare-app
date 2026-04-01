import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { trustLabels } from "@/data/navigation"
import { HeroParticles } from "@/components/marketing/hero-particles"
import { HomeHeroShowcase } from "@/components/marketing/home-hero-showcase"
import { MotionFadeIn, MotionStagger } from "@/components/shared/motion-reveal"
import { Button } from "@/components/ui/button"

export function HomeHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_top_left,rgba(124,168,164,0.3),transparent_30%),radial-gradient(circle_at_top_right,rgba(234,210,178,0.36),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,244,239,0.3)_58%,rgba(255,255,255,0))]" />
      <HeroParticles />

      <div className="mx-auto max-w-6xl">
        <div className="relative z-10 mx-auto mt-4 max-w-4xl text-center">
          <MotionFadeIn y={14}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Abassadors Care
            </p>
          </MotionFadeIn>
          <MotionFadeIn delay={0.06} y={18}>
            <h1 className="mt-6 font-heading text-5xl tracking-tight text-balance text-foreground sm:text-6xl lg:text-[4.35rem] lg:leading-[1.05]">
              Calm classrooms, clear updates, and child care parents can trust.
            </h1>
          </MotionFadeIn>
          <MotionFadeIn delay={0.1} y={18}>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Warm daily care for children, with structured communication, billing, and operations
              that feel steady from morning drop-off to afternoon pickup.
            </p>
          </MotionFadeIn>

          <MotionFadeIn delay={0.14} y={14}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/tour">
                  Schedule a Tour
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/login">Preview the portal</Link>
              </Button>
            </div>
          </MotionFadeIn>

          <MotionStagger
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            baseDelay={0.18}
            step={0.05}
            y={12}
          >
            {trustLabels.map((item) => (
              <div key={item.title} className="inline-flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/82 text-primary">
                  <item.icon className="size-4" />
                </span>
                <span className="font-medium text-foreground">{item.title}</span>
              </div>
            ))}
            <div className="inline-flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/82 text-primary">
                <ArrowRightIcon className="size-4" />
              </span>
              <span className="font-medium text-foreground">Organized parent portal</span>
            </div>
          </MotionStagger>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[20rem] z-0 h-[22rem] w-[140%] -translate-x-1/2 rounded-[100%] border-t border-primary/20 bg-[radial-gradient(circle_at_center,rgba(109,166,162,0.18),rgba(255,255,255,0)_70%)] blur-3xl" />

        <MotionFadeIn className="relative z-10 mt-14 sm:mt-16 lg:mt-20" delay={0.08} y={24} amount={0.1}>
          <HomeHeroShowcase />
        </MotionFadeIn>
      </div>
    </section>
  )
}
