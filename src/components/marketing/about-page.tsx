import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Quote } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { testimonials, trustPoints, valuePillars } from "@/data/marketing"

const PILLAR_COLORS = [
  "bg-brand-yellow text-navy",
  "bg-brand-green text-white",
  "bg-brand-blue text-white",
  "bg-brand-red text-white",
] as const

export function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <PhilosophySection />
      <PillarsSection />
      <TrustSection />
      <TestimonialsSection />
      <CtaBand />
    </main>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-[linear-gradient(135deg,#0d3b78_0%,#0d3b78_50%,#5e2d2d_100%)] text-white md:min-h-184">
      <Confetti />
      <div className="shell-container relative z-10 grid w-full gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="md:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
            About Ambassadors Care
          </p>
          <h1 className="mt-7 font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-white md:text-7xl">
            Warmth and structure, <span className="text-brand-yellow">on purpose.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
            {brandConfig.name} is a small daycare in Benin City built around a simple
            belief: nurturing classrooms and clear communication should support each
            other, not compete. The way we run a day, write a note, or answer a
            question is the product.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
            >
              <Link href="/contact">
                Plan a visit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/programs"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
            >
              See our programs
            </Link>
          </div>
        </div>
        <div className="hidden md:col-span-5 md:flex md:items-center md:justify-end">
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-brand-yellow/20 blur-2xl" />
            <Image
              src="/branding/ac-logo-sm.jpg"
              alt={`${brandConfig.name} logo`}
              width={420}
              height={420}
              priority
              className="relative rounded-4xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function PhilosophySection() {
  return (
    <section className="border-t border-border/60">
      <div className="shell-container py-20 md:py-24">
        <SectionHeader
          eyebrow="Our approach"
          title="The strongest daycare experience feels personal in the small details."
          description="We design around moments parents and children actually remember: drop-off, the feel of the room, classroom pacing, the tone of updates, and whether questions are answered clearly."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                Why we exist
              </p>
              <h3 className="mt-3 font-heading text-2xl leading-snug text-foreground md:text-3xl">
                Warmth and organisation should not compete.
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Families need classrooms that feel nurturing, but they also need a
                school that communicates clearly, follows through, and makes daily
                logistics manageable. We hold both at once — that&rsquo;s the whole
                product.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                How we work
              </p>
              <h3 className="mt-3 font-heading text-2xl leading-snug text-foreground md:text-3xl">
                Every surface earns its place.
              </h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Public pages set expectations clearly. The parent portal stays
                intentionally small — billing, messages, daily reports, calendar —
                nothing more. The admin side covers enrolment, payments, and
                approvals. No noise, no clutter, no extra process.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PillarsSection() {
  return (
    <section className="border-t border-border/60 bg-secondary/40">
      <div className="shell-container py-20 md:py-24">
        <SectionHeader
          eyebrow="What guides us"
          title="A small number of values, applied consistently."
          description="These pillars shape both the classroom experience and how the rest of the product is built."
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {valuePillars.map((pillar, index) => (
            <li key={pillar.title}>
              <Reveal delay={index * 0.06}>
                <article className="flex h-full flex-col rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl font-heading text-lg font-bold ${PILLAR_COLORS[index % PILLAR_COLORS.length]}`}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-heading text-2xl leading-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {pillar.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm leading-6 text-muted-foreground">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-yellow" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="border-t border-border/60">
      <div className="shell-container py-20 md:py-24">
        <SectionHeader
          eyebrow="Communication & standards"
          title="Trust builds when routines and expectations are visible."
          description="Parents are more comfortable when the school&rsquo;s standards feel concrete and understandable."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {trustPoints.map((point, index) => (
            <Reveal key={point.title} delay={index * 0.05}>
              <article className="flex h-full flex-col rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                  {point.title}
                </p>
                <h3 className="mt-3 font-heading text-xl leading-snug text-foreground md:text-2xl">
                  {point.description}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {point.detail}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/60 bg-navy text-white">
      <Confetti />
      <div className="shell-container relative z-10 py-20 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">
              Family voices
            </p>
            <h2 className="mt-4 font-heading text-balance text-3xl leading-tight text-white md:text-5xl">
              Why families <span className="text-brand-yellow">stay.</span>
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-base leading-8 text-white/85 md:text-lg">
              Three short notes from families who&rsquo;ve been with us long enough to
              know what daily care here actually feels like. We collect every quote
              with permission.
            </p>
          </div>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <li key={t.parentName}>
              <Reveal delay={index * 0.06}>
                <article className="flex h-full flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/15 backdrop-blur-sm md:p-7">
                  <Quote className="h-8 w-8 text-brand-yellow" aria-hidden />
                  <p className="mt-4 flex-1 text-base leading-7 text-white/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-white/15 pt-4">
                    <p className="text-sm font-semibold text-white">{t.parentName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-yellow">
                      {t.childStage} · {t.tenure}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-brand-blue via-brand-blue to-navy text-white">
      <Confetti />
      <div className="shell-container relative z-10 py-20 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
              Ready when you are
            </p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-white md:text-5xl">
              Book a visit, or start your application today.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-8 text-white/85 md:text-lg">
              If the tone, routines, and communication feel aligned with what your
              family wants, the next step should still feel direct and low-friction.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
              >
                <Link href="/signup/parent">
                  {brandConfig.primaryCtaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/contact"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
              >
                Contact the school
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-heading text-balance text-3xl leading-tight text-foreground md:text-4xl">
          {title}
        </h2>
      </div>
      {description ? (
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="text-base leading-8 text-muted-foreground md:text-lg">
            {description}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function Confetti() {
  const dots: { className: string; style: React.CSSProperties }[] = [
    { className: "bg-brand-yellow", style: { top: "8%", left: "6%", width: 14, height: 14 } },
    { className: "bg-brand-green", style: { top: "20%", left: "48%", width: 8, height: 8 } },
    { className: "bg-brand-red", style: { top: "76%", left: "10%", width: 12, height: 12 } },
    { className: "bg-brand-blue-soft", style: { top: "88%", left: "62%", width: 10, height: 10 } },
    { className: "bg-brand-yellow", style: { top: "60%", left: "94%", width: 8, height: 8 } },
    { className: "bg-brand-green", style: { top: "12%", left: "92%", width: 12, height: 12 } },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
      {dots.map((dot, i) => (
        <span key={i} className={`absolute rounded-full ${dot.className}`} style={dot.style} />
      ))}
    </div>
  )
}
