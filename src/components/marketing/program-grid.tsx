"use client"

import type { Program } from "@/lib/types"
import {
  BookOpenTextIcon,
  CalendarDaysIcon,
  CheckIcon,
  HeartHandshakeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { MotionFadeIn } from "@/components/shared/motion-reveal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const programIcons = [
  HeartHandshakeIcon,
  CalendarDaysIcon,
  BookOpenTextIcon,
  ShieldCheckIcon,
] as const

const programAccentClasses = [
  "bg-[linear-gradient(180deg,rgba(232,240,238,0.82),rgba(255,255,255,0.74))]",
  "bg-[linear-gradient(180deg,rgba(248,236,218,0.74),rgba(255,255,255,0.78))]",
  "bg-[linear-gradient(180deg,rgba(232,237,247,0.75),rgba(255,255,255,0.8))]",
  "bg-[linear-gradient(180deg,rgba(231,246,244,0.78),rgba(255,255,255,0.8))]",
] as const

function ProgramCard({
  program,
  compact,
  accentClass,
}: {
  program: Program
  compact: boolean
  accentClass: string
}) {
  const visibleHighlights = program.highlights.slice(0, compact ? 2 : program.highlights.length)

  return (
    <Card className="overflow-hidden bg-card/92">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {program.schedule}
            </p>
            <CardTitle className="mt-3 font-heading text-2xl tracking-tight">{program.name}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{program.ages}</p>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1.5">
            {program.ratio}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{program.summary}</p>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div
          className={cn(
            "rounded-[1.5rem] border border-border/60 p-4 text-sm leading-6 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
            accentClass
          )}
        >
          {program.highlight}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-[1.2rem] border border-border/60 bg-background/84 px-3 py-2 text-xs font-medium text-foreground">
            <CalendarDaysIcon className="size-4 text-primary" />
            {program.schedule}
          </div>
          <div className="flex items-center gap-2 rounded-[1.2rem] border border-border/60 bg-background/84 px-3 py-2 text-xs font-medium text-foreground">
            <UsersIcon className="size-4 text-primary" />
            {program.ratio}
          </div>
        </div>

        <div className="grid gap-2">
          {visibleHighlights.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-[1.2rem] border border-border/60 bg-background/82 px-3 py-2.5 text-sm leading-6 text-muted-foreground"
            >
              <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgramTabs({
  items,
  compact,
}: {
  items: Program[]
  compact: boolean
}) {
  return (
    <Tabs
      defaultValue={items[0]?.id}
      orientation="vertical"
      className="hidden items-stretch gap-5 md:flex"
    >
      <TabsList className="h-auto w-[18.5rem] flex-col items-stretch gap-1 rounded-[1.6rem] p-2">
        {items.map((program, index) => {
          const ProgramIcon = programIcons[index % programIcons.length]

          return (
            <TabsTrigger
              key={program.id}
              value={program.id}
              className="h-auto items-start rounded-[1.2rem] px-3 py-3"
            >
              <div className="flex w-full items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-[0.9rem] border border-border/60 bg-background/86 text-primary">
                  <ProgramIcon className="size-4" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground">{program.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {compact ? program.ages : program.schedule}
                  </p>
                </div>
              </div>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <div className="min-w-0 flex-1">
        {items.map((program, index) => (
          <TabsContent key={program.id} value={program.id} className="mt-0">
            <ProgramCard
              program={program}
              compact={compact}
              accentClass={programAccentClasses[index % programAccentClasses.length]}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

function ProgramAccordion({
  items,
  compact,
}: {
  items: Program[]
  compact: boolean
}) {
  return (
    <Accordion type="single" collapsible defaultValue={items[0]?.id} className="flex flex-col gap-3 md:hidden">
      {items.map((program, index) => {
        const ProgramIcon = programIcons[index % programIcons.length]

        return (
          <AccordionItem
            key={program.id}
            value={program.id}
            className="rounded-[1.6rem] border border-border/60 bg-card/90 px-4 shadow-[0_16px_44px_-34px_rgba(44,74,72,0.28)]"
          >
            <AccordionTrigger className="py-4 hover:no-underline">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-[0.9rem] border border-border/60 bg-background/86 text-primary">
                  <ProgramIcon className="size-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{program.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {compact ? program.ages : program.schedule}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ProgramCard
                program={program}
                compact={compact}
                accentClass={programAccentClasses[index % programAccentClasses.length]}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export function ProgramGrid({
  items,
  compact = false,
}: {
  items: Program[]
  compact?: boolean
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("grid gap-5", compact && "gap-4")}>
      <MotionFadeIn y={14}>
        <ProgramAccordion items={items} compact={compact} />
      </MotionFadeIn>
      <MotionFadeIn y={14} delay={0.06}>
        <ProgramTabs items={items} compact={compact} />
      </MotionFadeIn>
    </div>
  )
}
