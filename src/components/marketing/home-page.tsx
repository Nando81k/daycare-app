"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  MessageCircleHeart,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { brandConfig } from "@/config/brand"

const marqueeItems = [
  "Open House Discovery",
  "Preschool Program",
  "Pre-K Program",
  "Junior Kindergarten",
  "Affordable tuition options",
  "Day care that feels like home",
  "Quality care for growing children",
  "Benin City, Edo State",
]

const featureCards = [
  {
    icon: MessageCircleHeart,
    title: "Day care that feels like home",
    body: "Ambassadors Care gives children a warm, welcoming place to settle in, learn confidently, and feel genuinely cared for every day.",
  },
  {
    icon: ShieldCheck,
    title: "Affordable tuition with invaluable learning",
    body: "Families get accessible tuition options while children benefit from structured learning, dependable care, and thoughtful daily support.",
  },
  {
    icon: Sparkles,
    title: "Programs by age for steady growth",
    body: "Preschool, Pre-K, and Junior Kindergarten are designed to meet children at the right stage and help them grow with confidence.",
  },
]

const programSlides = [
  {
    title: "Preschool",
    subtitle: "A gentle start with care, routine, and early learning",
    copy: "The Preschool Program helps children ease into a classroom rhythm with guided play, warm support, and strong foundational habits.",
    stat: "Preschool Program",
  },
  {
    title: "Pre-K",
    subtitle: "School-readiness with confidence and consistency",
    copy: "The Pre-K Program builds focus, early academic confidence, and classroom structure in a setting that still feels welcoming and calm.",
    stat: "Pre-K Program",
  },
  {
    title: "Junior Kindergarten",
    subtitle: "A stronger bridge into the next stage of learning",
    copy: "Junior Kindergarten combines quality care and more guided learning to help children prepare well for their next academic step.",
    stat: "Junior Kindergarten",
  },
]

const galleryImages = [
  {
    src: "/marketing/hero-daycare-circle.jpg",
    alt: "Children doing a group activity",
  },
  {
    src: "/marketing/playroom-learning.jpg",
    alt: "Child smiling in daycare classroom",
  },
  {
    src: "/marketing/storytime-classroom.jpg",
    alt: "Teacher reading to children",
  },
]

const testimonialCards = [
  {
    name: "Pre-K parent",
    quote:
      "We wanted a school that felt like home and still took learning seriously. Ambassadors Care gave us both.",
  },
  {
    name: "Junior Kindergarten family",
    quote:
      "The open house made the program easy to understand, and the affordable tuition helped us move forward with confidence.",
  },
  {
    name: "Preschool parent",
    quote:
      "Our child settled in quickly because the environment felt warm, organized, and genuinely caring from the start.",
  },
]

const faqs = [
  {
    q: "What programs are available at Ambassadors Care?",
    a: "Ambassadors Care offers Preschool Program, Pre-K Program, and Junior Kindergarten options so families can choose the right fit by age and readiness.",
  },
  {
    q: "Do you offer affordable tuition options?",
    a: "Yes. Affordable tuition is part of the Ambassadors Care promise, helping families access quality care and invaluable learning for their child.",
  },
  {
    q: "Where is the center located?",
    a: "You can find Ambassadors Care at 5 Engineering Street off Textile Mill Road, Edo State, Benin City, Nigeria.",
  },
  {
    q: "How do I start enrollment or ask questions?",
    a: "Families can plan a visit, join the open house discovery, and call 08071671289, 08029088818, or 08163913912 for next steps. Enrollment for the current intake begins April 27, 2026.",
  },
]

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % programSlides.length)
    }, 4500)

    return () => window.clearInterval(slideTimer)
  }, [])

  useEffect(() => {
    const galleryTimer = window.setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % galleryImages.length)
    }, 4000)

    return () => window.clearInterval(galleryTimer)
  }, [])

  const repeatedMarquee = useMemo(() => [...marqueeItems, ...marqueeItems], [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-teal-50 text-slate-900">
      <LandingNavbar />
      <HeroSection />
      <MarqueeStrip repeatedMarquee={repeatedMarquee} />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon

            return (
              <Card
                key={feature.title}
                className="rounded-3xl border-white/60 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl"
              >
                <CardContent className="p-8">
                  <div className="mb-5 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.body}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
              <Sun className="h-4 w-4 text-amber-500" />
              Affordable tuition, quality care, and programs by age
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Programs that help children feel at home while they learn
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {brandConfig.name} serves families in Benin City with Preschool, Pre-K, and Junior Kindergarten
              programs, affordable tuition, and a calm environment centered on quality care.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <MiniInfoCard icon={MoonStar} title="Preschool Program" body="A gentle classroom start with care, routine, and early learning." />
              <MiniInfoCard icon={CalendarDays} title="Pre-K Program" body="School-readiness support that helps children build confidence before their next step." />
              <MiniInfoCard icon={Sun} title="Junior Kindergarten" body="More guided learning for children preparing for the next school stage." />
              <MiniInfoCard icon={ShieldCheck} title="Affordable Tuition" body="Accessible tuition options that still deliver quality care and strong learning value." />
            </div>
          </div>

          <ProgramSlideshow activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <GalleryShowcase galleryIndex={galleryIndex} setGalleryIndex={setGalleryIndex} />
          <div className="space-y-6">
            <Card className="rounded-3xl border-white/60 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold tracking-tight">Built to reassure parents at every touchpoint</h3>
                <ul className="mt-6 space-y-4 text-slate-600">
                  {[
                    "Open house discovery for new families",
                    "Preschool, Pre-K, and Junior Kindergarten options",
                    "Affordable tuition with quality care",
                    "Benin City location and enrollment guidance",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/60 bg-gradient-to-br from-sky-100/70 via-white to-teal-100/70 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
                  <HeartHandshake className="h-4 w-4 text-rose-500" />
                  Open House Discovery
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">A first impression that feels welcoming and clear</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The homepage now reflects {brandConfig.name} with the same tone as the flyer: quality care, affordable tuition,
                  programs by age, and a clear next step for families ready to enroll.
                </p>
                <Button asChild className="mt-6 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
                  <Link href="/signup/parent">Start Enrollment</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">What parents say</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Care that feels connected and dependable</h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonialCards.map((item) => (
            <Card
              key={item.name}
              className="rounded-3xl border-white/60 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl"
            >
              <CardContent className="p-8">
                <div className="mb-5 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-slate-600">“{item.quote}”</p>
                <p className="mt-6 text-sm font-semibold text-slate-900">{item.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <FAQSection />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-gradient-to-r from-sky-100 via-white to-teal-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">Enrollment opens April 27, 2026</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Discover the right program and take the next step with Ambassadors Care
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Visit the center, compare Preschool, Pre-K, and Junior Kindergarten options, and move into enrollment with a team focused on quality care.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild className="rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
                <Link href="/tour">Book Open House</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white px-6 text-slate-800 hover:bg-slate-50">
                <Link href="/signup/parent">Start Enrollment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function LandingNavbar() {
  return (
    <header className="fixed top-0 z-50 w-full px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-teal-100 text-slate-800 shadow-inner">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">{brandConfig.name}</p>
            <p className="text-xs text-slate-500">Open House & Enrollment</p>
          </div>
        </div>

        <Button asChild className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
          <Link href="/login/parent">Parent Sign In</Link>
        </Button>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1600&q=80"
      >
        <source src="https://cdn.coverr.co/videos/coverr-children-playing-in-a-playground-1561897799884?download=1080p" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-900/25 to-slate-950/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.18),transparent_22%),radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.14),transparent_25%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl items-center px-6 pb-16 pt-36">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
            <MapPin className="h-4 w-4 text-sky-300" />
            Open House Discovery • Benin City, Edo State
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Day care that feels like home, with quality care and real learning
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
            {brandConfig.name} welcomes families in Benin City with Preschool, Pre-K, and Junior Kindergarten programs,
            affordable tuition options, and a clear path from open house discovery into enrollment.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild className="rounded-full bg-white px-7 text-slate-900 hover:bg-slate-100">
              <Link href="/tour">
                Book Open House
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/40 bg-white/10 px-7 text-white backdrop-blur-md hover:bg-white/15">
              <Link href="/signup/parent">Start Enrollment</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <HeroChip icon={HeartHandshake} label="Quality care that feels like home" />
            <HeroChip icon={ShieldCheck} label="Affordable tuition options" />
            <HeroChip icon={CalendarDays} label="Preschool, Pre-K, and Junior Kindergarten" />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroChip({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-white backdrop-blur-md shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/10 p-2 text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-white/90">{label}</span>
      </div>
    </div>
  )
}

function MarqueeStrip({ repeatedMarquee }: { repeatedMarquee: string[] }) {
  return (
    <section className="border-y border-sky-100 bg-white/80 py-4 backdrop-blur-xl">
      <div className="overflow-hidden">
        <div className="landing-marquee-track flex min-w-max gap-4">
          {repeatedMarquee.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center gap-4 whitespace-nowrap rounded-full border border-sky-100 bg-sky-50/70 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-teal-600" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProgramSlideshow({ activeSlide, setActiveSlide }: { activeSlide: number; setActiveSlide: (index: number) => void }) {
  const slide = programSlides[activeSlide]

  return (
    <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-sky-100 via-white to-teal-100 p-8">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
            Programs by Age
          </div>
          <h3 className="mt-5 text-3xl font-semibold tracking-tight">{slide.title}</h3>
          <p className="mt-2 text-sm font-medium text-sky-700">{slide.subtitle}</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">{slide.copy}</p>
          <div className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white">{slide.stat}</div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">
          <div className="flex gap-2">
            {programSlides.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-slate-900" : "w-2.5 bg-slate-300"}`}
                aria-label={`Show ${item.title} slide`}
                type="button"
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">Programs by age</p>
        </div>
      </CardContent>
    </Card>
  )
}

function GalleryShowcase({ galleryIndex, setGalleryIndex }: { galleryIndex: number; setGalleryIndex: (index: number) => void }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-white/60 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="relative aspect-[16/11] overflow-hidden">
          {galleryImages.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === galleryIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md">
              <p className="text-sm font-medium">Open house at {brandConfig.shortName}</p>
              <p className="mt-1 text-sm text-white/80">Warm classroom moments, joyful learning, and quality care for growing children.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-5">
          <p className="text-sm text-slate-500">Center glimpse</p>
          <div className="flex gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={image.alt}
                onClick={() => setGalleryIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === galleryIndex ? "w-8 bg-slate-900" : "w-2.5 bg-slate-300"}`}
                aria-label={`Show image ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FAQSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600">FAQ</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Questions parents usually ask first</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A calm, easy-to-scan section that gives families quick answers about programs, tuition, location, and the next enrollment step.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[2rem] border-white/60 bg-gradient-to-br from-sky-100/80 via-white to-teal-100/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-slate-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              Open House and Enrollment
            </div>

            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">Clear answers, less hesitation</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This section helps families understand the Ambassadors Care offer before they visit, call, or begin enrollment.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Open house visits and enrollment timing",
                "Affordable tuition options",
                "Preschool, Pre-K, and Junior Kindergarten details",
                "Benin City location and contact guidance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <span className="text-sm leading-6 text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <Button asChild className="mt-8 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
              <Link href="/tour">Book Open House</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/60 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={faq.q}
                  value={`item-${idx}`}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-5 data-[state=open]:bg-white"
                >
                  <AccordionTrigger className="py-5 text-left text-base font-semibold text-slate-900 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pr-6 text-sm leading-7 text-slate-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function MiniInfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="mb-4 inline-flex rounded-2xl bg-teal-100 p-3 text-teal-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
    </div>
  )
}
