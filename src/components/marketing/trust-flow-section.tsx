"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardListIcon,
  HeartHandshakeIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { trustStats } from "@/data/marketing"
import { MotionFadeIn, MotionStagger } from "@/components/shared/motion-reveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TrustPillar = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  points: string[]
}

const trustPillars: TrustPillar[] = [
  {
    id: "safety",
    title: "Safety systems families can see",
    subtitle:
      "Arrival checks, pickup permissions, and health notes are handled in one clear flow so nothing relies on memory.",
    icon: ShieldCheckIcon,
    points: [
      "Authorized pickup contacts stay current and visible at dismissal.",
      "Daily classroom notes include health and comfort context.",
      "Licensing and ratio checkpoints map to real classroom routines.",
      "Tour conversations align with the same standards used in care.",
    ],
  },
  {
    id: "communication",
    title: "Communication that feels personal, not noisy",
    subtitle:
      "Families see meals, naps, activities, and teacher notes in one timeline with calm, useful detail.",
    icon: HeartHandshakeIcon,
    points: [
      "Real-time updates reduce uncertainty during the workday.",
      "Messages, forms, and reminders stay tied to each child profile.",
      "Pickup conversations start with context, not guesswork.",
      "Parents can scan quickly without digging through clutter.",
    ],
  },
  {
    id: "operations",
    title: "Operations that stay organized underneath",
    subtitle:
      "The parent and admin experiences share the same structure, so daily logistics stay reliable as enrollment grows.",
    icon: ClipboardListIcon,
    points: [
      "Billing, forms, and calendar details follow one consistent pattern.",
      "Classroom teams and administrators work from the same source of truth.",
      "Announcements and attendance reporting stay easy to track.",
      "The product remains calm even on busy, high-traffic days.",
    ],
  },
]

export function TrustFlowSection() {
  const defaultPillar = trustPillars[0]?.id ?? "safety"

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="soft-panel-strong relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(124,168,164,0.2),transparent_40%),radial-gradient(circle_at_90%_100%,rgba(232,205,168,0.24),transparent_35%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <MotionFadeIn y={18}>
              <Badge
                variant="secondary"
                className="rounded-full border-border/70 bg-background/72 text-primary"
              >
                Why families trust the flow
              </Badge>

              <h2 className="mt-4 font-heading text-3xl tracking-tight text-balance text-foreground sm:text-[2.55rem]">
                Emotionally reassuring on the surface, rigorously organized underneath.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Abassadors Care keeps the public experience calm while carrying the same clarity
                into parent updates and daily operations.
              </p>

              <Tabs defaultValue={defaultPillar} className="mt-8">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 shadow-none">
                  {trustPillars.map((pillar) => {
                    const Icon = pillar.icon

                    return (
                      <TabsTrigger
                        key={pillar.id}
                        value={pillar.id}
                        className="h-11 flex-none rounded-full border border-border/70 bg-background/72 px-4 text-foreground/74 hover:border-primary/38 hover:bg-background hover:text-foreground data-active:border-primary/44 data-active:bg-background data-active:text-foreground data-active:shadow-[0_16px_34px_-24px_rgba(44,74,72,0.5)]"
                      >
                        <Icon className="size-4" />
                        <span>{pillar.title.split(" ").slice(0, 2).join(" ")}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {trustPillars.map((pillar) => {
                  const Icon = pillar.icon

                  return (
                    <TabsContent key={pillar.id} value={pillar.id} className="mt-4">
                      <Card className="border-border/70 bg-background/88 shadow-[0_24px_60px_-44px_rgba(44,74,72,0.46)]">
                        <CardHeader className="pb-3">
                          <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border/65 bg-secondary/80 text-primary">
                            <Icon className="size-5" />
                          </div>
                          <CardTitle className="font-heading text-2xl tracking-tight text-balance text-foreground">
                            {pillar.title}
                          </CardTitle>
                          <p className="text-sm leading-7 text-muted-foreground">{pillar.subtitle}</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <ul className="grid gap-2.5 sm:grid-cols-2">
                            {pillar.points.map((point) => (
                              <li
                                key={point}
                                className="flex items-start gap-2.5 rounded-xl border border-border/58 bg-secondary/52 p-3 text-sm leading-6 text-foreground/88"
                              >
                                <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary/38 bg-primary/12 text-primary">
                                  <CheckIcon className="size-3" />
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </MotionFadeIn>

            <MotionStagger
              className="grid gap-4 self-start sm:grid-cols-3 lg:grid-cols-1"
              baseDelay={0.04}
              step={0.07}
              y={16}
            >
              {trustStats.map((item) => (
                <Card key={item.label} className="border-border/70 bg-background/82">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-4xl tracking-tight text-foreground">
                      {item.value}
                    </CardTitle>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </CardContent>
                </Card>
              ))}

              <div className="rounded-[min(var(--radius-2xl),1.75rem)] border border-border/70 bg-[linear-gradient(180deg,rgba(232,241,239,0.8),rgba(250,244,238,0.95))] p-5 shadow-[0_24px_56px_-42px_rgba(44,74,72,0.34)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Next step
                </p>
                <p className="mt-2 font-heading text-2xl tracking-tight text-foreground">
                  See the daily flow in a tour.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Walk through classrooms, safety routines, and the exact parent portal view.
                </p>
                <Button asChild className="mt-4 w-full justify-center">
                  <Link href="/tour">
                    Schedule a Tour
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </Button>
              </div>
            </MotionStagger>
          </div>
        </div>
      </div>
    </section>
  )
}
