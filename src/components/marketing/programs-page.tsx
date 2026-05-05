import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { LandingFaq, type LandingFaqItem } from "@/components/marketing/sections/landing-faq"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { faqGroups } from "@/data/marketing"
import { formatCurrencyFromCents } from "@/lib/format"
import type { PublicProgramsAndPricing } from "@/lib/dal/public"

const PROGRAM_TAG_COLORS = [
  "bg-brand-yellow text-navy",
  "bg-brand-green text-white",
  "bg-brand-blue text-white",
  "bg-brand-red text-white",
  "bg-brand-blue-soft text-navy",
] as const

const PROGRAMS_FAQ: LandingFaqItem[] = faqGroups
  .filter((group) => ["programs", "tuition", "enrollment"].includes(group.id))
  .flatMap((group) =>
    group.items.map((item) => ({ question: item.question, answer: item.answer })),
  )
  .slice(0, 8)

export function ProgramsPage({
  data,
}: {
  data: PublicProgramsAndPricing
}) {
  return (
    <main className="bg-background text-foreground">
      <Hero hasPrograms={data.hasPrograms} />
      <ProgramsSection programs={data.programs} />
      <TuitionSection data={data} />
      <FaqSection />
      <CtaBand />
    </main>
  )
}

function Hero({ hasPrograms }: { hasPrograms: boolean }) {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-[linear-gradient(135deg,#0d3b78_0%,#0d3b78_50%,#1f5a3a_100%)] text-white md:min-h-184">
      <Confetti />
      <div className="shell-container relative z-10 grid w-full gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="md:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
            Programs &amp; Tuition
          </p>
          <h1 className="mt-7 font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-white md:text-7xl">
            Programs by age. <span className="text-brand-yellow">Tuition without surprises.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
            {hasPrograms
              ? `Each room at ${brandConfig.name} has its own teacher, daily rhythm, and learning focus. Pick the schedule that works for your family — tuition for every combination is shown below.`
              : `${brandConfig.name} is finalising its 2026 program lineup. Reach out and we'll share specifics tailored to your child's age and your schedule.`}
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
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
            >
              Watch the gallery
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

function ProgramsSection({ programs }: { programs: PublicProgramsAndPricing["programs"] }) {
  if (programs.length === 0) {
    return (
      <section id="programs" className="border-t border-border/60 scroll-mt-24">
        <div className="shell-container py-20 md:py-24">
          <Header eyebrow="Programs" title="Our classrooms are taking shape." />
          <Placeholder
            title="Programs are being finalised"
            body="We're putting the finishing touches on this term's classroom lineup. Share your timing with our team and we'll let you know exactly when enrolment opens for your child's age range."
            cta={{ label: "Contact the school", href: "/contact" }}
          />
        </div>
      </section>
    )
  }

  return (
    <section id="programs" className="border-t border-border/60 scroll-mt-24">
      <div className="shell-container py-20 md:py-24">
        <Header
          eyebrow="Programs"
          title="Three rooms, three rhythms — each calibrated to the age and the child."
          description="Children move from one program to the next on a steady arc. Every room has its own lead teacher, materials, and daily shape."
        />

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, index) => (
            <li key={program.id}>
              <Reveal delay={index * 0.05}>
                <article className="flex h-full flex-col rounded-3xl bg-card p-7 shadow-(--shadow-soft) ring-1 ring-border/60">
                  {program.ageRange ? (
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] ${PROGRAM_TAG_COLORS[index % PROGRAM_TAG_COLORS.length]}`}
                    >
                      {program.ageRange}
                    </span>
                  ) : null}
                  <h3 className="mt-4 font-heading text-2xl leading-tight text-foreground md:text-3xl">
                    {program.name}
                  </h3>
                  {program.description ? (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {program.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground italic">
                      Detailed program description coming soon.
                    </p>
                  )}
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function TuitionSection({ data }: { data: PublicProgramsAndPricing }) {
  const { programs, schedules, ratesByPair, hasPricing } = data

  return (
    <section id="tuition" className="border-t border-border/60 bg-secondary/30 scroll-mt-24">
      <div className="shell-container py-20 md:py-24">
        <Header
          eyebrow="Tuition"
          title="Clear monthly tuition. No paperwork tricks."
          description="Pick a program row and a schedule column to see the monthly tuition that applies. All amounts are quoted in Nigerian Naira."
        />

        {!hasPricing || programs.length === 0 || schedules.length === 0 ? (
          <Placeholder
            title="Tuition for the next term is under review"
            body="Our team is finalising rates for the upcoming intake. Reach out and we'll share the schedule and tuition that fits your child best — no commitment, just a clear picture."
            cta={{ label: "Ask for current rates", href: "/contact" }}
          />
        ) : (
          <div className="mt-12 overflow-hidden rounded-3xl bg-card shadow-(--shadow-soft) ring-1 ring-border/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-navy text-white">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-navy px-6 py-5 text-left text-[0.7rem] font-bold uppercase tracking-[0.22em] text-brand-yellow"
                    >
                      Program
                    </th>
                    {schedules.map((schedule) => (
                      <th
                        key={schedule.id}
                        scope="col"
                        className="px-6 py-5 text-left text-[0.7rem] font-bold uppercase tracking-[0.22em] text-brand-yellow"
                      >
                        <span className="block text-white">{schedule.name}</span>
                        {schedule.daysDescription ? (
                          <span className="mt-1 block text-[0.65rem] font-medium tracking-[0.18em] text-white/70">
                            {schedule.daysDescription}
                          </span>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program, idx) => (
                    <tr
                      key={program.id}
                      className={idx % 2 === 0 ? "bg-card" : "bg-muted/40"}
                    >
                      <th
                        scope="row"
                        className={`sticky left-0 z-[1] px-6 py-5 text-left align-top ${idx % 2 === 0 ? "bg-card" : "bg-muted/40"}`}
                      >
                        <span className="font-heading text-lg leading-snug text-foreground">
                          {program.name}
                        </span>
                        {program.ageRange ? (
                          <span className="mt-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            {program.ageRange}
                          </span>
                        ) : null}
                      </th>
                      {schedules.map((schedule) => {
                        const rate = ratesByPair[`${program.id}::${schedule.id}`]
                        return (
                          <td
                            key={schedule.id}
                            className="px-6 py-5 align-top"
                          >
                            {rate ? (
                              <>
                                <span className="font-heading text-xl text-foreground">
                                  {formatCurrencyFromCents(rate.rateCents)}
                                </span>
                                <span className="mt-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                  {rate.billingLabel ?? "per month"}
                                </span>
                              </>
                            ) : (
                              <span className="inline-flex items-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                On request
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border/60 bg-secondary/40 px-6 py-5 text-xs leading-6 text-muted-foreground md:px-7">
              <p>
                Tuition includes daily care, all program activities, meals and snacks, and
                full parent-portal access. Optional extras (extended hours, special programs)
                are billed transparently when used. Speak with our team for sibling
                considerations or financial-aid questions.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section className="border-t border-border/60 scroll-mt-24">
      <div className="shell-container py-20 md:py-24">
        <Header
          eyebrow="Common questions"
          title="The questions families ask before they walk through the door."
        />
        <div className="mt-10">
          <LandingFaq items={PROGRAMS_FAQ} />
        </div>
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
              Pick a program, plan a visit, take the next step.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-8 text-white/85 md:text-lg">
              The fastest way to know if a room is the right fit is to see it in person.
              Visits last about 30 minutes — bring questions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
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
                href="/signup/parent"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
              >
                Create parent account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Header({
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
          <p className="text-base leading-8 text-muted-foreground md:text-lg">{description}</p>
        </div>
      ) : null}
    </div>
  )
}

function Placeholder({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta: { label: string; href: string }
}) {
  return (
    <Reveal>
      <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-brand-blue/40 bg-card p-8 text-center shadow-(--shadow-soft) md:p-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow text-navy">
          <Sparkles className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-heading text-2xl leading-tight text-foreground md:text-3xl">
          {title}
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {body}
        </p>
        <div className="mt-7">
          <Button asChild size="lg" className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-primary/90">
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Reveal>
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
