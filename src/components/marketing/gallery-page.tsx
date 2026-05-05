"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, X } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { brandConfig } from "@/config/brand"
import { galleryVideos, type GalleryVideo } from "@/config/gallery"

const ACCENT_COLORS = [
  "bg-brand-yellow text-navy",
  "bg-brand-green text-white",
  "bg-brand-blue text-white",
  "bg-brand-red text-white",
  "bg-brand-blue-soft text-navy",
] as const

export function GalleryPage() {
  const [active, setActive] = useState<GalleryVideo | null>(null)

  return (
    <main className="bg-background text-foreground">
      <Hero />
      <section className="border-t border-border/60">
        <div className="shell-container py-16 md:py-24">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="editorial-kicker text-brand-blue">Watch · Listen · Visit</p>
              <h2 className="mt-4 font-heading text-balance text-3xl leading-tight text-foreground md:text-4xl">
                Real days, real classrooms.
              </h2>
            </div>
            <span className="hidden rounded-full bg-brand-yellow/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy md:inline-flex">
              {galleryVideos.length} clips
            </span>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryVideos.map((video, index) => (
              <li key={video.id}>
                <Reveal delay={index * 0.05}>
                  <VideoCard
                    video={video}
                    badgeColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
                    onPlay={() => setActive(video)}
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />

      {active ? (
        <VideoLightbox video={active} onClose={() => setActive(null)} />
      ) : null}
    </main>
  )
}

function Hero() {
  return (
    <section className="relative flex min-h-136 items-center overflow-hidden bg-[linear-gradient(135deg,#1d2d5e_0%,#0d3b78_50%,#3a1d5e_100%)] text-white md:min-h-184">
      {/* Decorative confetti dots — pulled from the logo's accent palette */}
      <Confetti />
      <div className="shell-container relative z-10 grid w-full gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-20">
        <div className="md:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
            Gallery · Inside Ambassadors Care
          </p>
          <h1 className="mt-6 font-heading text-balance text-5xl leading-[1.05] tracking-[-0.01em] text-white md:text-7xl">
            See the days <span className="text-brand-yellow">your child</span> would call their own.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/80 md:text-xl">
            Short clips from our classrooms, playtime, and learning moments — recorded by our
            teachers and shared with permission. The best way to feel the care before you visit.
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
              href="/programs"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white underline-offset-4 hover:underline"
            >
              Explore programs
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

function VideoCard({
  video,
  badgeColor,
  onPlay,
}: {
  video: GalleryVideo
  badgeColor: string
  onPlay: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="group relative block w-full overflow-hidden rounded-2xl bg-card text-left shadow-(--shadow-soft) ring-1 ring-border/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-float) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Play ${video.title}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-navy">
        <PreviewVideo src={video.src} poster={video.poster} />
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-navy/70 via-navy/20 to-transparent transition-colors group-hover:from-navy/55">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-navy shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-px fill-current" />
          </span>
        </div>
        <span
          className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${badgeColor}`}
        >
          {video.title}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg leading-snug text-foreground">{video.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {video.description}
        </p>
      </div>
    </button>
  )
}

function PreviewVideo({ src, poster }: { src: string; poster?: string }) {
  // Chrome won't paint a first frame for muted, non-autoplaying videos with
  // preload="metadata". Seeking a fraction of a second after metadata is
  // loaded forces a visible frame, giving each card a real preview without
  // shipping a separate poster image.
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const seek = () => {
      try {
        v.currentTime = 0.1
      } catch {
        /* ignore — some browsers throw before metadata fully ready */
      }
    }
    if (v.readyState >= 1) seek()
    else v.addEventListener("loadedmetadata", seek, { once: true })
  }, [src])
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className="h-full w-full object-cover"
      muted
      playsInline
      preload="auto"
    />
  )
}

function VideoLightbox({ video, onClose }: { video: GalleryVideo; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-100 flex items-center justify-center bg-navy/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/90 hover:text-brand-yellow"
          aria-label="Close video"
        >
          <X className="h-4 w-4" />
          Close
        </button>
        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
          <video
            src={video.src}
            poster={video.poster}
            className="aspect-video w-full"
            controls
            autoPlay
            playsInline
          />
        </div>
        <div className="mt-5 text-center text-white">
          <h2 className="font-heading text-2xl text-white">{video.title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-white/80">
            {video.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function Confetti() {
  // Pure-CSS decorative dots in the logo's accent palette.
  const dots: { className: string; style: React.CSSProperties }[] = [
    { className: "bg-brand-yellow", style: { top: "12%", left: "8%", width: 12, height: 12 } },
    { className: "bg-brand-green", style: { top: "22%", left: "62%", width: 8, height: 8 } },
    { className: "bg-brand-red", style: { top: "70%", left: "12%", width: 10, height: 10 } },
    { className: "bg-brand-blue-soft", style: { top: "85%", left: "78%", width: 14, height: 14 } },
    { className: "bg-brand-yellow", style: { top: "55%", left: "92%", width: 6, height: 6 } },
    { className: "bg-brand-green", style: { top: "8%", left: "88%", width: 10, height: 10 } },
    { className: "bg-brand-red", style: { top: "40%", left: "4%", width: 8, height: 8 } },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${dot.className}`}
          style={dot.style}
        />
      ))}
    </div>
  )
}

function CtaBand() {
  return (
    <section className="border-t border-border/60 bg-linear-to-br from-brand-blue via-brand-blue to-navy text-white">
      <div className="shell-container py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
              Want a closer look?
            </p>
            <h2 className="mt-4 font-heading text-balance text-3xl leading-tight text-white md:text-4xl">
              Schedule a visit and see the rooms in person.
            </h2>
          </div>
          <div className="flex items-center gap-4 md:col-span-5 md:justify-end">
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
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
