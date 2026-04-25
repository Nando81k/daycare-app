import type { ReactNode } from "react"
import Link from "next/link"
import {
  CalendarDays,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function MarketingHero() {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50 pt-36 pb-24 md:-mt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.45),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(204,251,241,0.35),transparent_25%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.9),transparent_30%)]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="hero-cloud hero-cloud-1" />
        <div className="hero-cloud hero-cloud-2" />
        <div className="hero-cloud hero-cloud-3" />
        <div className="hero-cloud hero-cloud-4" />
        <div className="hero-cloud hero-cloud-5" />
      </div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <FloatingCard className="left-[7%] top-[22%] w-64 rotate-[-10deg]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-teal-100 p-2 text-teal-700">
              <MessageCircleHeart className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Daily Update</p>
              <p className="text-sm font-semibold text-slate-800">
                Naptime, meals, and activity notes
              </p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="right-[10%] top-[18%] w-64 rotate-[8deg]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-100 p-2 text-sky-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Safe Pickup</p>
              <p className="text-sm font-semibold text-slate-800">
                Authorized contacts and peace of mind
              </p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-[16%] left-[12%] w-60 rotate-[6deg]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Family Calendar</p>
              <p className="text-sm font-semibold text-slate-800">
                Events, closures, and reminders
              </p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard className="bottom-[12%] right-[12%] w-56 rotate-[-7deg]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-violet-100 p-2 text-violet-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Nurturing Programs</p>
              <p className="text-sm font-semibold text-slate-800">
                Built for growth, play, and care
              </p>
            </div>
          </div>
        </FloatingCard>
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-xl">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-400" />
            Peaceful care for growing minds
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            A calm, caring place where
            <span className="block bg-gradient-to-r from-sky-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
              families feel at ease
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Thoughtful childcare, daily updates, and a warm environment designed
            to give parents confidence and children room to grow.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-slate-900 px-8 text-base text-white shadow-lg transition hover:bg-slate-800"
            >
              <Link href="/waitlist">Join Our Waitlist</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/70 bg-white/70 px-8 text-base text-slate-800 shadow-sm backdrop-blur-xl hover:bg-white"
            >
              <Link href="/programs">Explore Programs</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
            <TrustPill>Daily parent updates</TrustPill>
            <TrustPill>Safe pickup management</TrustPill>
            <TrustPill>Nurturing age-based programs</TrustPill>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-sky-200/40 via-white/50 to-teal-200/40 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Today&apos;s Care Snapshot</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      Bright, connected, and organized
                    </h3>
                  </div>
                  <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    Live updates
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <InfoCard title="Meals" value="2 snacks + lunch" tone="sky" />
                  <InfoCard title="Nap" value="1 hr 20 min" tone="teal" />
                  <InfoCard title="Mood" value="Happy & engaged" tone="amber" />
                </div>

                <div className="mt-4 rounded-2xl bg-sky-50/80 p-4">
                  <p className="text-sm font-medium text-slate-700">Teacher note</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Today we explored shapes, read together, and spent time outside.
                    Parents receive updates in a calm, easy-to-read format throughout the day.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5">
                  <p className="text-sm font-medium text-slate-500">Upcoming</p>
                  <div className="mt-3 space-y-3">
                    <MiniRow label="Spring Family Day" value="Friday, 3:30 PM" />
                    <MiniRow label="Tuition Due" value="April 15" />
                    <MiniRow label="Parent Conference" value="Next Week" />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5">
                  <p className="text-sm font-medium text-slate-500">Why families choose us</p>
                  <ul className="mt-3 space-y-3 text-sm text-slate-600">
                    <li>• Daily communication without the clutter</li>
                    <li>• Warm, structured programs by age group</li>
                    <li>• Safe pickup and attendance visibility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

function TrustPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-xl">
      {children}
    </div>
  )
}

function FloatingCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute rounded-[1.5rem] border border-white/70 bg-white/55 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl",
        className
      )}
    >
      {children}
    </div>
  )
}

function InfoCard({
  title,
  value,
  tone,
}: {
  title: string
  value: string
  tone: "sky" | "teal" | "amber"
}) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <div className={cn("mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium", tones[tone])}>
        {value}
      </div>
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}
