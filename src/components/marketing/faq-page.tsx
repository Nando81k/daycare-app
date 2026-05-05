import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  GraduationCap,
  HeartHandshake,
} from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { brandConfig } from "@/config/brand"
import { faqGroups } from "@/data/marketing"
import type { FaqGroup } from "@/types/app"

// Per-group icon + accent colour so the accordion stack visually matches the
// rest of the marketing palette (yellow / green / blue / red).
const GROUP_META: Record<
  string,
  { icon: typeof CalendarDays; accentClass: string; iconBgClass: string }
> = {
  programs: {
    icon: GraduationCap,
    accentClass: "text-brand-yellow",
    iconBgClass: "bg-brand-yellow text-navy",
  },
  enrollment: {
    icon: HeartHandshake,
    accentClass: "text-brand-green",
    iconBgClass: "bg-brand-green text-white",
  },
  "daily-care": {
    icon: CalendarDays,
    accentClass: "text-brand-blue",
    iconBgClass: "bg-brand-blue text-white",
  },
  tuition: {
    icon: CreditCard,
    accentClass: "text-brand-red",
    iconBgClass: "bg-brand-red text-white",
  },
}

export function FaqPage() {
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <FaqSection />
      <CtaBand />
    </main>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-[linear-gradient(135deg,#2F80ED_0%,#1d5aa8_55%,#0d3b78_100%)] text-white md:min-h-184">
      <Confetti />
      <div className="shell-container relative z-10 grid w-full gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="md:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-navy">
            Frequently asked
          </p>
          <h1 className="mt-7 font-heading text-balance text-5xl leading-[1.04] tracking-[-0.02em] text-white md:text-7xl">
            Plain answers, <span className="text-brand-yellow">no fluff.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
            The questions families ask before they walk through the door — grouped by
            the decisions you&rsquo;re actually making. If yours isn&rsquo;t here, the
            team is one call or message away.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
            >
              <Link href="/contact">
                Ask the team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/waitlist"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
            >
              Join the waitlist
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

function FaqSection() {
  return (
    <section className="border-t border-border/60">
      <div className="shell-container py-20 md:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
              Browse by topic
            </p>
            <h2 className="mt-4 font-heading text-balance text-3xl leading-tight text-foreground md:text-4xl">
              Pick a category and tap a question to expand.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              Each group answers a different stage of the conversation — from
              first-research questions to live enrolment details. Most parents read
              two or three before reaching out.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {faqGroups.map((group, index) => (
            <Reveal key={group.id} delay={index * 0.06}>
              <FaqGroupCard group={group} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqGroupCard({ group }: { group: FaqGroup }) {
  const meta = GROUP_META[group.id] ?? GROUP_META.programs
  const Icon = meta.icon
  return (
    <article className="flex h-full flex-col py-2 md:py-4">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.iconBgClass}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className={`text-[0.7rem] font-bold uppercase tracking-[0.22em] ${meta.accentClass}`}>
            {group.id.replace("-", " ")}
          </p>
          <h3 className="mt-1 font-heading text-xl leading-snug text-foreground md:text-2xl">
            {group.title}
          </h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{group.description}</p>
      <Accordion type="single" collapsible className="mt-4 flex flex-col gap-1">
        {group.items.map((item) => (
          <AccordionItem
            key={item.question}
            value={item.question}
            className="overflow-hidden rounded-xl border-0 bg-transparent transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40"
          >
            <AccordionTrigger className="rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground hover:no-underline data-[state=open]:text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 text-sm leading-7 text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </article>
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
              Need a more specific answer?
            </p>
            <h2 className="mt-6 font-heading text-balance text-4xl leading-tight text-white md:text-5xl">
              Some questions are better answered{" "}
              <span className="text-brand-yellow">in context.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-base leading-8 text-white/85 md:text-lg">
              If your family has unique timing, schedule, or care needs, send a note
              or join the waitlist so we can respond with the right level of detail.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
              >
                <Link href="/contact">
                  Contact the school
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/waitlist"
                className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
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
