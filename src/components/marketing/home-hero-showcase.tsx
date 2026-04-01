import {
  CalendarDaysIcon,
  CheckCheckIcon,
  HeartHandshakeIcon,
  MessageSquareTextIcon,
  MoonStarIcon,
  UtensilsIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

const updateCards = [
  {
    meta: "8:12 AM",
    title: "Warm arrival logged",
    detail: "Teacher handoff noted with comfort item and pickup reminder.",
    icon: HeartHandshakeIcon,
  },
  {
    meta: "11:40 AM",
    title: "Lunch note posted",
    detail: "Meal plan, water refill, and allergy reminders stay visible in one place.",
    icon: UtensilsIcon,
  },
  {
    meta: "12:35 PM",
    title: "Rest window started",
    detail: "Nap timing and follow-up notes are shared before pickup questions begin.",
    icon: MoonStarIcon,
  },
  {
    meta: "2:15 PM",
    title: "Pickup confirmed",
    detail: "Grandma is cleared for dismissal and the classroom note is already synced.",
    icon: CheckCheckIcon,
  },
  {
    meta: "Friday",
    title: "Form reminder",
    detail: "Medication renewal and calendar details stay close to the daily feed.",
    icon: CalendarDaysIcon,
  },
  {
    meta: "Unread",
    title: "Teacher message ready",
    detail: "Quick replies stay warm, brief, and easy to scan during a workday.",
    icon: MessageSquareTextIcon,
  },
] as const

function HeroUpdateRail() {
  const marqueeCards = [...updateCards, ...updateCards]

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/84 p-3 shadow-[0_28px_72px_-52px_rgba(31,64,62,0.42)]">
      <div className="absolute inset-x-16 bottom-0 h-24 rounded-full bg-primary/10 blur-3xl" />
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="hero-card-marquee flex w-max gap-3 py-1 group-hover:[animation-play-state:paused]">
          {marqueeCards.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              aria-hidden={index >= updateCards.length || undefined}
              className="w-[15.25rem] shrink-0 rounded-[1.45rem] border border-border/60 bg-background/88 p-4 shadow-[0_20px_40px_-34px_rgba(31,64,62,0.24)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-[1rem] border border-border/60 bg-secondary/68 text-primary">
                  <item.icon className="size-4" />
                </div>
                <span className="rounded-full border border-border/60 bg-card/72 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {item.meta}
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HomeHeroShowcase() {
  return (
    <div className="relative overflow-hidden rounded-[2.4rem] border border-border/60 bg-card/72 p-3 shadow-[0_34px_90px_-56px_rgba(31,64,62,0.46)]">
      <div className="absolute inset-x-16 bottom-0 h-32 rounded-full bg-primary/12 blur-3xl" />
      <div className="relative grid items-center gap-4 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <div className="relative min-h-[22.5rem] overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(180deg,rgba(231,241,239,0.98),rgba(248,244,238,0.96))] p-6 sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(239,214,178,0.3),transparent_34%)]" />
          <div className="relative z-10 max-w-md">
            <Badge variant="secondary" className="rounded-full bg-background/86">
              Preschool studio
            </Badge>
            <h3 className="mt-4 font-heading text-3xl tracking-tight text-foreground sm:text-[2.05rem]">
              A calm classroom, ready before the first drop-off.
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Sunlit rooms, predictable rhythms, and practical parent communication across the day.
            </p>
          </div>

          <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-border/60 bg-background/84 p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                First update
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">8:12 AM check-in</p>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/84 p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Midday
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">Lunch + rest posted</p>
            </div>
            <div className="rounded-[1.2rem] border border-border/60 bg-background/84 p-3">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Dismissal
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">Pickup verified early</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 self-center lg:pl-2">
          <HeroUpdateRail />
        </div>
      </div>
    </div>
  )
}
