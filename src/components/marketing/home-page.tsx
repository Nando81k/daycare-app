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
  },
  {
    name: "Pre-K",
    ages: "4 years",
    lede: "Reading, early numbers, and longer concentration in a setting that still feels warm and unhurried.",
    image: "/marketing/smiling-with-pencil.jpg",
    href: "/programs#prek",
  },
  {
    name: "Junior Kindergarten",
    ages: "5 years",
    lede: "A strong, confident bridge into primary school — academics framed by curiosity, conversation, and care.",
    image: "/marketing/alphabet-cards.jpg",
    href: "/programs#jk",
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
    <section className="relative">
      <div className="shell-container pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="editorial-kicker">Now enrolling · September 2026</p>
              <h1 className="mt-6 font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-foreground md:text-7xl lg:text-[5.25rem]">
                A school day that feels like home.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
                {brandConfig.name} is a small daycare in Benin City offering Preschool,
                Pre-K, and Junior Kindergarten. Quiet classrooms, attentive teachers,
                and a portal that keeps families close to the day.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/contact">
                    Plan a visit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  href="/programs"
                  className="text-sm font-medium uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
                >
                  Explore programs
                </Link>
              </div>
            </div>
            <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-border/60 pt-8 md:gap-10">
              <Stat label="Programs" value="3" />
              <Stat label="Ages" value="3 – 5" />
              <Stat label="Where" value="Benin City" />
            </dl>
          </div>
          <div className="lg:col-span-5">
            <Reveal>
              <figure className="relative">
                <div className="relative aspect-4/5 w-full overflow-hidden">
                  <Image
                    src="/marketing/boy-at-desk.jpg"
                    alt="A young boy with an afro concentrates on his work at a classroom desk."
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <span>Spring intake · 2026</span>
                  <span className="text-accent">No. 01</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</dt>
      <dd className="mt-3 font-heading text-3xl text-foreground md:text-4xl">{value}</dd>
    </div>
  )
}

function Pillars() {
  return (
    <section className="border-t border-border/60 bg-secondary/40">
      <div className="shell-container py-20 md:py-24">
        <div className="grid gap-x-16 gap-y-12 md:grid-cols-4">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.06}>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-accent">
                  0{index + 1}
                </p>
                <h3 className="mt-4 font-heading text-xl leading-snug text-foreground md:text-2xl">
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

        <ul className="divide-y divide-border/60 border-y border-border/60">
          {PROGRAMS.map((program, index) => (
            <li key={program.name}>
              <Link
                href={program.href}
                className="group grid gap-6 py-10 transition-colors hover:bg-background/50 md:grid-cols-12 md:gap-8 md:py-14"
              >
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-accent">
                    0{index + 1}
                  </p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    {program.ages}
                  </p>
                </div>
                <div className="md:col-span-5">
                  <h3 className="font-heading text-3xl leading-tight text-foreground transition-colors group-hover:text-accent md:text-4xl">
                    {program.name}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
                    {program.lede}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-foreground underline-offset-4 group-hover:underline">
                    Learn more
                    <ArrowRight className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="md:col-span-5">
                  <div className="relative aspect-5/4 w-full overflow-hidden">
                    <Image
                      src={program.image}
                      alt={`${program.name} classroom`}
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
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
    <section id="cta" className="border-t border-border/60 bg-primary text-primary-foreground scroll-mt-24">
      <div className="shell-container py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.22em] text-accent">
              Plan a visit
            </p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight md:text-6xl">
              Come by, see a classroom, meet the team.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-8 text-primary-foreground/80 md:text-lg">
              Visits last about 30 minutes. We&rsquo;ll walk you through the rooms,
              talk through the day, and answer everything you bring.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Button
                asChild
                size="lg"
                className="rounded-none bg-background px-8 text-foreground hover:bg-background/90"
              >
                <Link href="/contact">
                  Schedule a visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href={`tel:${brandConfig.phone.replace(/[^\d+]/g, "")}`}
                className="text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground underline-offset-4 hover:underline"
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
