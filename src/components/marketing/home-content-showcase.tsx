"use client"

import * as React from "react"
import {
  AlarmClockCheckIcon,
  CalendarCheck2Icon,
  HeartHandshakeIcon,
} from "lucide-react"
import { motion } from "motion/react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type AccordionItemType = {
  title: string
  description: string
  icon: React.ReactNode
}

const accordionItemsData: AccordionItemType[] = [
  {
    title: "Daily updates that feel reassuring",
    description:
      "Parents can follow meals, naps, activities, and teacher notes in one calm feed that supports smoother pickup conversations.",
    icon: <HeartHandshakeIcon className="size-4" />,
  },
  {
    title: "Family logistics that stay organized",
    description:
      "Billing, forms, event reminders, and authorized pickup contacts stay visible without clutter or repeated back-and-forth.",
    icon: <CalendarCheck2Icon className="size-4" />,
  },
  {
    title: "Operations that keep pace with the day",
    description:
      "Attendance, staffing, classroom flow, and waitlist visibility help administrators stay ahead without turning the product cold or overly dense.",
    icon: <AlarmClockCheckIcon className="size-4" />,
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const accordionContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const accordionItemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function AnimatedNumber({
  targetValue,
  className,
}: {
  targetValue: number
  className?: string
}) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const [hasStarted, setHasStarted] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!hasStarted) {
      return
    }

    let frame = 0
    const duration = 900
    const start = performance.now()

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      setValue(Math.round(targetValue * progress))

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [hasStarted, targetValue])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}

function ContentAccordion() {
  return (
    <motion.div
      className="h-full w-full"
      variants={accordionContainerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Accordion type="single" collapsible className="flex h-full w-full flex-col gap-4">
        {accordionItemsData.map((item, i) => (
          <motion.div key={item.title} variants={accordionItemVariants}>
            <AccordionItem
              value={`item-${i + 1}`}
              className="rounded-[1.35rem] border border-border/60 bg-background/86 px-4 py-2 shadow-[0_18px_40px_-34px_rgba(31,64,62,0.22)]"
            >
              <AccordionTrigger className="py-3 text-left text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary text-primary">
                    {item.icon}
                  </span>
                  <span className="text-balance text-foreground">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-[3.25rem] text-base leading-7 text-muted-foreground">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  )
}

function ContentImage() {
  return (
    <div className="relative h-full min-h-[18rem] overflow-hidden rounded-[1.6rem] border border-border/60 bg-[linear-gradient(180deg,rgba(232,241,239,0.98),rgba(248,244,238,0.96))] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.74),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(124,168,164,0.18),transparent_34%)]" />
      <div className="relative flex h-full flex-col justify-between rounded-[1.3rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(243,248,246,0.88))] p-4 shadow-[0_22px_56px_-40px_rgba(31,64,62,0.3)]">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className="rounded-full">
            Parent portal preview
          </Badge>
          <div className="rounded-[1rem] border border-border/50 bg-background/86 px-3 py-2 text-xs font-medium text-foreground">
            8:12 AM arrival
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-[1.2rem] border border-border/50 bg-background/86 p-4">
            <p className="text-sm font-semibold text-foreground">Morning summary</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Smooth drop-off, breakfast finished, and a short teacher update already shared.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.1rem] border border-border/50 bg-secondary/72 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Forms
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">Medication renewal Friday</p>
            </div>
            <div className="rounded-[1.1rem] border border-border/50 bg-background/86 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Pickup
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">Grandma approved for today</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-border/50 bg-background/84 p-4">
          <p className="font-heading text-2xl tracking-tight text-foreground">
            Calm on the surface, organized underneath.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The same design language carries from the public site into the parent and admin tools.
          </p>
        </div>
      </div>
    </div>
  )
}

export function HomeContentShowcase() {
  return (
    <section className="bg-background w-full py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-primary text-sm font-semibold uppercase tracking-[0.24em]">
            Family experience
          </p>
          <h2 className="text-foreground font-heading text-4xl leading-[1.15] tracking-tight text-balance sm:text-5xl">
            A calmer way to understand the day, handle logistics, and stay in sync.
          </h2>
          <p className="text-muted-foreground leading-7 text-pretty sm:max-w-[600px] sm:text-lg">
            Abassadors Care gives parents and administrators one clear place to follow classroom updates,
            forms, billing, pickup details, and the daily operational rhythm.
          </p>
        </motion.div>

        <div className="text-foreground mx-auto mt-12 flex flex-col-reverse gap-6 md:mt-14 md:flex-row">
          <motion.div
            className="w-full overflow-hidden rounded-[1.75rem] shadow-[0_28px_70px_-52px_rgba(31,64,62,0.34)] md:w-2/5"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ContentImage />
          </motion.div>

          <motion.div
            className="grid w-full grid-cols-4 gap-4 rounded-[2rem] bg-secondary/55 p-4 shadow-[0_28px_70px_-56px_rgba(31,64,62,0.28)] md:w-3/5 md:grid-rows-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="col-span-4 row-span-2 flex h-full items-center justify-center">
              <ContentAccordion />
            </div>

            <div className="col-span-4 row-start-3 flex items-end justify-start px-4 pt-2 md:col-span-2 md:row-span-2 md:px-6 md:pt-4 md:pr-0">
              <p className="text-muted-foreground text-pretty italic">
                &quot;Parents should never feel like they have to piece the day together from memory,
                and administrators should never need five systems to keep the center running.&quot;
              </p>
            </div>

            <div className="col-span-4 row-start-4 p-1 md:col-span-2 md:col-start-3 md:row-span-2 md:row-start-3">
              <div className="bg-primary text-primary-foreground flex h-full w-full flex-col items-start justify-between rounded-[1.5rem] p-6">
                <AnimatedNumber
                  targetValue={92}
                  className="text-4xl font-semibold sm:text-5xl lg:text-6xl"
                />
                <span className="max-w-[20ch] text-sm font-medium leading-6 sm:text-base">
                  percent of families say clear daily updates make pickup feel more relaxed and informed.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
