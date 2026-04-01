import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  Clock3Icon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

import { MotionFadeIn, MotionStagger } from "@/components/shared/motion-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

const tourHighlights = [
  "Walk classrooms and daily routines",
  "Meet teachers and leadership",
  "Preview the parent portal workflow",
] as const

const tourSlides = [
  {
    title: "Thursday Evening Tour",
    date: "April 9, 2026",
    time: "5:30 PM",
    host: "Jordan Hayes",
    seats: "2 seats left",
    focus: [
      "Infant and toddler room walkthrough",
      "Arrival and pickup flow",
      "Q&A on tuition and enrollment timing",
    ],
  },
  {
    title: "Saturday Morning Tour",
    date: "April 11, 2026",
    time: "9:15 AM",
    host: "Elena Park",
    seats: "3 seats left",
    focus: [
      "Preschool and pre-k classroom rhythm",
      "Safety and communication standards",
      "Portal demo with daily update examples",
    ],
  },
  {
    title: "Weekday Family Tour",
    date: "April 14, 2026",
    time: "10:00 AM",
    host: "Mina Thompson",
    seats: "4 seats left",
    focus: [
      "Operations overview with admin team",
      "Billing and forms flow",
      "Waitlist process and next steps",
    ],
  },
] as const

function TourCarousel() {
  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      autoScrollMs={4200}
      className="w-full rounded-[1.75rem] border border-border/65 bg-background/74 p-4 shadow-[0_24px_70px_-52px_rgba(31,64,62,0.36)] sm:p-5"
    >
      <CarouselContent>
        {tourSlides.map((slide) => (
          <CarouselItem key={`${slide.title}-${slide.date}`}>
            <Card className="h-full border-border/65 bg-card/92">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {slide.seats}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    Tour session
                  </Badge>
                </div>
                <CardTitle className="font-heading text-2xl tracking-tight text-foreground">
                  {slide.title}
                </CardTitle>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDaysIcon className="size-4 text-primary" />
                    {slide.date}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Clock3Icon className="size-4 text-primary" />
                    {slide.time}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <UsersIcon className="size-4 text-primary" />
                    Host: {slide.host}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 pt-0">
                {slide.focus.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-[1rem] border border-border/60 bg-background/80 px-3 py-2.5 text-sm leading-6 text-muted-foreground"
                  >
                    <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export function HomeCallToAction() {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="soft-panel-strong relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(124,168,164,0.18),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(232,205,168,0.24),transparent_35%)]" />

          <div className="relative grid items-stretch gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <MotionFadeIn y={18}>
              <Badge variant="secondary" className="rounded-full">
                Tours available this month
              </Badge>
              <h2 className="mt-5 font-heading text-4xl tracking-tight text-balance text-foreground sm:text-[3rem]">
                Visit Abassadors Care and feel the rhythm in person.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Walk classrooms, meet the team, and preview how the parent portal keeps the day
                organized from arrival to pickup.
              </p>

              <MotionStagger className="mt-7 grid gap-2.5" y={12} baseDelay={0.04}>
                {tourHighlights.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-start gap-2 rounded-[1rem] border border-border/60 bg-background/78 px-3 py-2 text-sm font-medium text-foreground"
                  >
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </MotionStagger>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-full px-6">
                  <Link href="/tour">
                    Schedule a Tour
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                  <Link href="/programs">Explore Programs</Link>
                </Button>
              </div>
            </MotionFadeIn>

            <MotionFadeIn y={20} delay={0.1}>
              <TourCarousel />
            </MotionFadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
