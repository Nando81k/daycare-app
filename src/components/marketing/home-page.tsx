import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { LandingFaq, type LandingFaqItem } from "@/components/marketing/sections/landing-faq"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"

const PILLARS = [
  {
    title: "Quality care, every day",
    body: "A small, warm team that knows your child by name. Routines that respect attachment, language, and rest.",
  },
  {
    title: "Programs by age",
    body: "Preschool, Pre-K, and Junior Kindergarten — each with its own rhythm, classroom, and curriculum thread.",
  },
  {
    title: "Affordable tuition",
    body: "Tuition options designed for working families. Clear costs, predictable billing, and no surprises.",
  },
  {
    title: "Family-first communication",
    body: "A daily portal with notes, photos, and updates. Quiet enough that the important things stand out.",
  },
] as const

const PROGRAMS = [
  {
    name: "Preschool",
    ages: "3 years",
    lede: "A gentle introduction to classroom life: shared meals, guided play, story time, and the first steady friendships.",
    image: "/marketing/cornrows-shapes.jpg",
    href: "/programs#preschool",
    tagClass: "bg-brand-yellow text-navy",
  },
  {
    name: "Pre-K",
    ages: "4 years",
    lede: "Reading, early numbers, and longer concentration in a setting that still feels warm and unhurried.",
    image: "/marketing/smiling-with-pencil.jpg",
    href: "/programs#prek",
    tagClass: "bg-brand-green text-white",
  },
  {
    name: "Junior Kindergarten",
    ages: "5 years",
    lede: "A strong, confident bridge into primary school — academics framed by curiosity, conversation, and care.",
    image: "/marketing/alphabet-cards.jpg",
    href: "/programs#jk",
    tagClass: "bg-brand-blue text-white",
  },
] as const

const FAQS: LandingFaqItem[] = [
  {
    question: "What programs do you offer?",
    answer:
      "Preschool, Pre-K, and Junior Kindergarten. Each program has its own classroom, lead teacher, and daily rhythm tuned to the age group.",
  },
  {
    question: "How does enrollment work?",
    answer:
      "Plan a visit, walk through the classrooms, and meet the team. Once you decide, the enrollment portal handles paperwork, scheduling, and tuition online.",
  },
  {
    question: "What does tuition cover?",
    answer:
      "Daily care, all programs, meals and snacks, and parent portal access. Optional extras (extended hours, special programs) are billed transparently when used.",
  },
  {
    question: "How will I hear about my child's day?",
    answer:
      "Through the parent portal: notes, photos, and updates from teachers, plus monthly milestones. Calm, organized, and never overwhelming.",
  },
  {
    question: "Where are you located?",
    answer: brandConfig.address,
  },
]

export function HomePage() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <Pillars />
      <Approach />
      <ProgramsSection />
      <Spread />
      <FaqSection />
      <CtaBand />
    </main>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-navy text-white md:min-h-184">
      {/* Decorative confetti dots in the logo's accent palette */}
      <HeroConfetti />
      <div className="shell-container relative z-10 w-full py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="flex flex-col lg:col-span-7">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
                Now enrolling · September 2026
              </p>
              <h1 className="mt-7 font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-white md:text-7xl">
                A school day that feels{" "}
                <span className="text-brand-yellow">like home.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
                {brandConfig.name} is a small daycare in Benin City offering Preschool,
                Pre-K, and Junior Kindergarten. Warm classrooms, attentive teachers,
                and a portal that keeps families close to the day.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border-transparent bg-brand-yellow bg-none px-7 text-navy shadow-none hover:bg-brand-yellow/90"
                >
                  <Link href="/contact">
                    Plan a visit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
                >
                  Watch the gallery
                  <ArrowRight className="h-4 w-4 text-brand-yellow" />
                </Link>
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-white/15 pt-6 md:gap-10">
              <Stat label="Programs" value="3" accent="text-brand-yellow" />
              <Stat label="Ages" value="3 – 5" accent="text-brand-green" />
              <Stat label="Where" value="Benin City" accent="text-brand-blue-soft" />
            </dl>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <figure className="relative mx-auto max-w-md">
                <div className="absolute -inset-8 rounded-[2.5rem] bg-brand-yellow/20 blur-3xl" />
                <div className="relative aspect-square w-full overflow-hidden rounded-4xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
                  <Image
                    src="/branding/ac-logo.jpg"
                    alt={`${brandConfig.name} logo`}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="mt-5 flex items-baseline justify-between border-t border-white/15 pt-3 text-xs uppercase tracking-[0.22em] text-white/70">
                  <span>Where every child belongs</span>
                  <span className="text-brand-yellow">Est. 2026</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroConfetti() {
  const dots: { className: string; style: React.CSSProperties }[] = [
    { className: "bg-brand-yellow", style: { top: "8%", left: "6%", width: 14, height: 14 } },
    { className: "bg-brand-green", style: { top: "18%", left: "48%", width: 8, height: 8 } },
    { className: "bg-brand-red", style: { top: "78%", left: "10%", width: 12, height: 12 } },
    { className: "bg-brand-blue-soft", style: { top: "88%", left: "62%", width: 10, height: 10 } },
    { className: "bg-brand-yellow", style: { top: "60%", left: "94%", width: 8, height: 8 } },
    { className: "bg-brand-green", style: { top: "12%", left: "92%", width: 12, height: 12 } },
    { className: "bg-brand-red", style: { top: "44%", left: "3%", width: 6, height: 6 } },
    { className: "bg-brand-blue-soft", style: { top: "6%", left: "70%", width: 6, height: 6 } },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
      {dots.map((dot, i) => (
        <span key={i} className={`absolute rounded-full ${dot.className}`} style={dot.style} />
      ))}
    </div>
  )
}

function Stat({
  label,
  value,
  accent = "text-foreground",
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.22em] text-current/60">{label}</dt>
      <dd className={`mt-3 font-heading text-3xl md:text-4xl ${accent}`}>{value}</dd>
    </div>
  )
}

const PILLAR_COLORS = [
  "bg-brand-yellow text-navy",
  "bg-brand-green text-white",
  "bg-brand-blue text-white",
  "bg-brand-red text-white",
] as const

function Pillars() {
  return (
    <section className="bg-secondary/40">
      <div className="shell-container py-20 md:py-24">
        <div className="grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.06}>
              <div>
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl font-heading text-lg font-bold shadow-(--shadow-soft) ${PILLAR_COLORS[index % PILLAR_COLORS.length]}`}
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-heading text-xl leading-snug text-foreground md:text-2xl">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-[0.95rem]">
                  {pillar.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section id="approach" className="border-t border-border/60 scroll-mt-24">
      <div className="shell-container py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="editorial-kicker">02 · Approach</p>
              <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-foreground md:text-5xl">
                Care that pays attention to the small things.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.1}>
              <div className="space-y-6 text-base leading-8 text-muted-foreground md:text-lg">
                <p>
                  Our classrooms stay small on purpose. Teachers know your child&rsquo;s name on
                  day one and what makes them laugh by week&rsquo;s end. Days are predictable
                  enough to feel safe, varied enough to feel alive.
                </p>
                <p>
                  We share what matters — naps, meals, milestones, the moments worth keeping —
                  and skip the noise that doesn&rsquo;t. The aim is for parents to feel close to
                  the day without being interrupted by it.
                </p>
              </div>
              <div className="mt-10">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
                >
                  Read about our team
                  <ArrowRight className="h-4 w-4 text-accent" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgramsSection() {
  return (
    <section id="programs" className="border-t border-border/60 bg-secondary/30 scroll-mt-24">
      <div className="shell-container py-24 md:py-32">
        <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="editorial-kicker">03 · Programs</p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-foreground md:text-5xl">
              Three programs, each with its own rhythm.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              Children move from Preschool through Junior Kindergarten on a steady arc.
              Each room has its own teacher, its own materials, and its own daily shape —
              built to meet the age and the child where they are.
            </p>
          </div>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((program) => (
            <li key={program.name}>
              <Link
                href={program.href}
                className="group block h-full overflow-hidden rounded-3xl bg-card shadow-(--shadow-soft) ring-1 ring-border/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-float)"
              >
                <div className="relative aspect-5/4 w-full overflow-hidden">
                  <Image
                    src={program.image}
                    alt={`${program.name} classroom`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span
                    className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] ${program.tagClass}`}
                  >
                    {program.ages}
                  </span>
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="font-heading text-2xl leading-tight text-foreground md:text-3xl">
                    {program.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {program.lede}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary underline-offset-4 group-hover:underline">
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Spread() {
  return (
    <section className="border-t border-border/60">
      <div className="relative">
        <div className="relative h-[60vh] w-full overflow-hidden md:h-[80vh]">
          <Image
            src="/marketing/circle-time-folders.jpg"
            alt="Preschool children gathered together with their classroom folders."
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/15 to-transparent" />
        </div>
        <div className="shell-container absolute inset-x-0 bottom-0 pb-12 md:pb-20">
          <Reveal>
            <div className="max-w-3xl text-background">
              <p className="text-xs uppercase tracking-[0.22em] text-background/70">
                A note from the director
              </p>
              <blockquote className="mt-5 font-heading text-3xl leading-snug md:text-5xl">
                &ldquo;The day a child runs into the classroom without looking back —
                that&rsquo;s the day we know we&rsquo;ve done it right.&rdquo;
              </blockquote>
              <p className="mt-6 text-sm uppercase tracking-[0.22em] text-background/70">
                — Director of Care, {brandConfig.name}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section id="faq" className="border-t border-border/60 scroll-mt-24">
      <div className="shell-container py-24 md:py-32">
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="editorial-kicker">04 · Questions</p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-foreground md:text-5xl">
              Answers, plainly.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              The questions families ask before they walk through the door. If something
              isn&rsquo;t here, the team is one call away.
            </p>
          </div>
        </div>
        <LandingFaq items={FAQS} />
      </div>
    </section>
  )
}

function CtaBand() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-linear-to-br from-brand-blue via-brand-blue to-navy text-white scroll-mt-24"
    >
      <HeroConfetti />
      <div className="shell-container relative z-10 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
              Plan a visit
            </p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-white md:text-6xl">
              Come by, see a classroom,{" "}
              <span className="text-brand-yellow">meet the team.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-8 text-white/85 md:text-lg">
              Visits last about 30 minutes. We&rsquo;ll walk you through the rooms,
              talk through the day, and answer everything you bring.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="rounded-full border-transparent bg-brand-yellow bg-none px-7 text-navy shadow-none hover:bg-brand-yellow/90"
              >
                <Link href="/contact">
                  Schedule a visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href={`tel:${brandConfig.phone.replace(/[^\d+]/g, "")}`}
                className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
              >
                Or call {brandConfig.phone}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
