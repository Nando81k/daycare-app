"use client"
// Interactive FAQ section
function FAQSection() {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null)
  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
      <div className="divide-y divide-slate-200 border rounded-2xl bg-white/80 shadow-sm">
        {faqs.map((faq, idx) => {
          const open = openIdx === idx
          return (
            <div key={faq.q} className="px-6 py-4">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-panel-${idx}`}
                className="flex w-full items-center justify-between gap-4 text-left text-lg font-medium text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                onClick={() => setOpenIdx(open ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className={`transition-transform duration-200 ${open ? "rotate-90 text-sky-600" : "rotate-0 text-slate-400"}`}>▶</span>
              </button>
              <div
                id={`faq-panel-${idx}`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"}`}
                aria-hidden={!open}
              >
                <div className="text-sm sm:text-base text-slate-600 leading-7">
                  {faq.a}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
// Modernized cards with hover only on Preschool Program when hovered
export function ProgramCardsWithHover({ activeSlide, setActiveSlide }: { activeSlide: number; setActiveSlide: (index: number) => void }) {
  // Icons for each program, in order
  const icons = [
    <MoonStar key="moon" className="h-7 w-7" />,
    <CalendarDays key="calendar" className="h-7 w-7" />,
    <Sun key="sun" className="h-7 w-7" />,
    <ShieldCheck key="shield" className="h-7 w-7" />,
  ]
  // Map programSlides to cards (Affordable Tuition is not a slide, so only 3)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
      {programSlides.map((slide, idx) => (
        <button
          key={slide.title}
          type="button"
          onClick={() => setActiveSlide(idx)}
          className="focus:outline-none"
        >
          <ProgramCard
            icon={icons[idx]}
            title={slide.title + (slide.title === "Preschool" ? " Program" : slide.title === "Pre-K" ? " Program" : slide.title === "Junior Kindergarten" ? "" : "")}
            description={slide.copy}
            highlight={activeSlide === idx}
            className="w-full min-w-60 max-w-85 h-55 sm:h-60 mx-auto"
          />
        </button>
      ))}
    </div>
  )
}

// import Image from "next/image" (unused)
import Link from "next/link"
import React, { useEffect, useState } from "react"
import {
  CalendarDays,
  MessageCircleHeart,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Sun
} from "lucide-react"

// Accordion imports removed (not used)
import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card" (unused)
import { brandConfig } from "@/config/brand"
import { Reveal } from "@/components/shared/reveal"
// import { AnimateIn } from "@/components/shared/animate-in" (unused)
// import { StaggerChildren } from "@/components/shared/stagger-children" (unused)
import { Marquee } from "@/components/shared/marquee"
import { CombinedStatsFeatures } from "@/components/marketing/CombinedStatsFeatures"
import { ProgramCard } from "@/components/marketing/ProgramCard"
import { ModernProgramSlideshow } from "@/components/marketing/ModernProgramSlideshow"

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
    imageSrc: "/marketing/hero-daycare-circle.jpg",
    imageAlt: "Children doing a group activity",
    title: "Day care that feels like home",
    body: "Ambassadors Care gives children a warm, welcoming place to settle in, learn confidently, and feel genuinely cared for every day.",
  },
  {
    icon: ShieldCheck,
    imageSrc: "/marketing/playroom-learning.jpg",
    imageAlt: "Child smiling in daycare classroom",
    title: "Affordable tuition with invaluable learning",
    body: "Families get accessible tuition options while children benefit from structured learning, dependable care, and thoughtful daily support.",
  },
  {
    icon: Sparkles,
    imageSrc: "/marketing/storytime-classroom.jpg",
    imageAlt: "Teacher reading to children",
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
    imageSrc: "/marketing/hero-daycare-circle.jpg",
    imageAlt: "Preschool children doing a group activity",
  },
  {
    title: "Pre-K",
    subtitle: "School-readiness with confidence and consistency",
    copy: "The Pre-K Program builds focus, early academic confidence, and classroom structure in a setting that still feels welcoming and calm.",
    stat: "Pre-K Program",
    imageSrc: "/marketing/playroom-learning.jpg",
    imageAlt: "Pre-K child smiling in daycare classroom",
  },
  {
    title: "Junior Kindergarten",
    subtitle: "A stronger bridge into the next stage of learning",
    copy: "Junior Kindergarten combines quality care and more guided learning to help children prepare well for their next academic step.",
    stat: "Junior Kindergarten",
    imageSrc: "/marketing/storytime-classroom.jpg",
    imageAlt: "Teacher reading to Junior Kindergarten children",
  },
  {
    title: "Affordable Tuition",
    subtitle: "Accessible tuition, quality care",
    copy: "Families get accessible tuition options while children benefit from structured learning, dependable care, and thoughtful daily support.",
    stat: "Affordable Tuition",
    imageSrc: "/marketing/playroom-learning.jpg",
    imageAlt: "Affordable tuition and quality care",
  },
]

// galleryImages removed (unused)

// testimonialCards removed (not used)

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
  // galleryIndex removed (not used)

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % programSlides.length)
    }, 4500)

    return () => window.clearInterval(slideTimer)
  }, [])

  useEffect(() => {
    const galleryTimer = window.setInterval(() => {
      // setGalleryIndex removed (unused)
    }, 4000)

    return () => window.clearInterval(galleryTimer)
  }, [])


  return (
    <main className="min-h-screen bg-linear-to-b from-sky-50 via-white to-teal-50 text-slate-900">

      <LandingNavbar />
      <HeroSection />

      <section id="marquee" className="border-y border-sky-100 bg-white/80 py-4 backdrop-blur-xl scroll-mt-24">
        <Marquee speed={35} pauseOnHover>
          {marqueeItems.map((item) => (
            <div key={item} className="flex items-center gap-4 whitespace-nowrap rounded-full border border-sky-100 bg-sky-50/70 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-teal-600" />
              {item}
            </div>
          ))}
        </Marquee>
      </section>

      {/* AnimatedNumber stats row */}
      <CombinedStatsFeatures
        stats={[
          { value: 2026, label: "Opened in" },
          { value: 1, suffix: "st", label: "Year of operation" },
          { value: 3, label: "Programs by age" },
        ]}
        features={featureCards}
        className="mx-auto max-w-7xl px-6 py-20"
      />

      <section id="programs" className="w-full px-0 py-16 scroll-mt-24 bg-white/90">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Removed label for a cleaner look */}
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl text-center">
            Programs that help children feel at home while they learn
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 mx-auto text-center">
            {brandConfig.name} serves families in Benin City with Preschool, Pre-K, and Junior Kindergarten
            programs, affordable tuition, and a calm environment centered on quality care.
          </p>
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <ProgramCardsWithHover activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
            <div className="flex justify-center w-full">
              <ModernProgramSlideshow
                slides={programSlides}
                activeSlide={activeSlide}
                setActiveSlide={setActiveSlide}
                className="w-full max-w-xl"
              />
            </div>
          </div>

        </div>
      </section>



      <FAQSection />

      <section id="cta" className="mx-auto max-w-7xl px-6 pb-24 scroll-mt-24">
        <Reveal>
          <div className="relative flex flex-col gap-8 rounded-3xl bg-linear-to-r from-sky-50 via-white to-teal-50 px-8 py-12 shadow-none border border-sky-100/60">
            <div className="absolute left-8 top-8 hidden md:block">
              <Sun className="h-10 w-10 text-teal-300/80" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 mb-1">Enrollment opens April 27, 2026</p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 max-w-2xl">Discover the right program and take the next step with Ambassadors Care</h2>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">Visit the center, compare Preschool, Pre-K, and Junior Kindergarten options, and move into enrollment with a team focused on quality care.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row md:items-center md:gap-4 mt-4 md:mt-0">
                <Button asChild variant="outline" className="rounded-full border-slate-300 bg-white px-7 text-slate-800 hover:bg-slate-50 text-base font-semibold">
                  <Link href="/waitlist">Join Our Waitlist</Link>
                </Button>
                <Button asChild className="rounded-full bg-slate-900 px-7 text-white hover:bg-slate-800 text-base font-semibold">
                  <Link href="/signup/parent">Start Enrollment</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}

function LandingNavbar() {
  // Mobile menu state
  const [menuOpen, setMenuOpen] = React.useState(false)
  return (
    <header className="fixed top-0 z-50 w-full px-2 sm:px-6 bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.08)] border-b border-sky-100/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full px-2 sm:px-6 py-2 sm:py-3 gap-2">
        {/* Logo pill */}
        <div className="flex items-center gap-3 rounded-full bg-white/90 px-3 py-1 shadow-md border border-sky-100/70">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-sky-100 to-teal-100 text-slate-800 shadow-inner">
            <Sun className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-slate-900">{brandConfig.shortName || brandConfig.name}</span>
            <span className="text-[11px] text-sky-700 font-medium">Open House</span>
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-3 sm:gap-6 items-center">
          <a href="#marquee" className="text-base font-semibold text-slate-700 px-3 py-1.5 rounded-full transition-all duration-150 hover:text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">Highlights</a>
          <a href="#programs" className="text-base font-semibold text-slate-700 px-3 py-1.5 rounded-full transition-all duration-150 hover:text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">Programs</a>
          <a href="#faq" className="text-base font-semibold text-slate-700 px-3 py-1.5 rounded-full transition-all duration-150 hover:text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">FAQ</a>
          <a href="#cta" className="text-base font-semibold text-slate-700 px-3 py-1.5 rounded-full transition-all duration-150 hover:text-white hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">Enroll</a>
        </nav>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="sr-only">Open menu</span>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        {/* Sign in button */}
        <Button asChild className="rounded-full bg-sky-700 px-6 text-white hover:bg-sky-800 text-base font-bold shadow-md ml-2">
          <Link href="/login/parent">Parent Sign In</Link>
        </Button>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 shadow-lg border-b border-sky-100 animate-in fade-in slide-in-from-top-2 z-50">
          <nav className="flex flex-col gap-1 py-3 px-6">
            <a href="#marquee" className="text-base font-semibold text-slate-700 px-3 py-2 rounded-full hover:text-white hover:bg-sky-600 transition-all" onClick={() => setMenuOpen(false)}>Highlights</a>
            <a href="#programs" className="text-base font-semibold text-slate-700 px-3 py-2 rounded-full hover:text-white hover:bg-sky-600 transition-all" onClick={() => setMenuOpen(false)}>Programs</a>
            <a href="#faq" className="text-base font-semibold text-slate-700 px-3 py-2 rounded-full hover:text-white hover:bg-sky-600 transition-all" onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#cta" className="text-base font-semibold text-slate-700 px-3 py-2 rounded-full hover:text-white hover:bg-sky-600 transition-all" onClick={() => setMenuOpen(false)}>Enroll</a>
            <Link href="/login/parent" className="mt-2">
              <Button className="w-full rounded-full bg-sky-700 text-white hover:bg-sky-800 text-base font-bold shadow">Parent Sign In</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  return (
    <section id="hero" className="relative min-h-svh flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background video or fallback image */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/marketing/hero-daycare-circle.jpg"
      >
        <source src="https://cdn.coverr.co/videos/coverr-children-playing-in-a-playground-1561897799884?download=1080p" type="video/mp4" />
      </video>
      {/* Soft overlays for readability */}
      <div className="absolute inset-0 bg-slate-950/50" />
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/30 via-slate-900/20 to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.13),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.13),transparent_22%),radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.10),transparent_25%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto flex flex-col items-center justify-center min-h-svh max-w-3xl px-6 py-24 text-center">
        <span className="inline-block mb-4 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-700 shadow-sm border border-sky-100/70">
          Open House & Enrollment
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg mb-4">
          Ambassadors Care
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-sky-100 mb-6">
          Day care that feels like home, with quality care.
        </h2>
        <p className="max-w-xl mx-auto text-base sm:text-lg md:text-xl text-slate-100/90 mb-8">
          Quality care, affordable tuition, and programs by age for families in Benin City. Discover a welcoming path to enrollment and a place where children thrive.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full bg-sky-600 px-8 text-white hover:bg-sky-700 text-lg font-semibold shadow-lg">
            <Link href="/signup/parent">Start Enrollment</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full border-white/80 bg-white/80 px-8 text-sky-900 hover:bg-slate-50 text-lg font-semibold shadow">
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}


