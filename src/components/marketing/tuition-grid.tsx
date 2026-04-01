"use client"

import Link from "next/link"
import type { TuitionTier } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import {
  CalendarClockIcon,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const comparisonRows = [
  { id: "portal", label: "Daily parent portal updates" },
  { id: "meals", label: "Meals and snacks included" },
  { id: "events", label: "Events and enrichment touchpoints" },
  { id: "conferences", label: "Conferences and milestone notes" },
  { id: "early", label: "Early drop-off access" },
  { id: "late", label: "Late pickup coverage" },
] as const

const billingPillars = [
  {
    title: "Transparent billing",
    detail: "Statements, receipts, and balances stay readable in one place.",
    icon: ReceiptTextIcon,
  },
  {
    title: "Predictable timing",
    detail: "Due dates and upcoming charges are visible before they become urgent.",
    icon: CalendarClockIcon,
  },
  {
    title: "Secure payments",
    detail: "Autopay status and payment methods stay easy to review and update.",
    icon: ShieldCheckIcon,
  },
] as const

const billingFaqs = [
  {
    title: "How are deposits handled?",
    detail:
      "Deposits are applied to your family account and reflected directly in the portal billing history.",
  },
  {
    title: "Can we switch plans later?",
    detail:
      "Yes. Plan changes are coordinated with staff, and new rates and dates appear in your billing timeline.",
  },
  {
    title: "Where do receipts and statements live?",
    detail:
      "Inside the parent portal billing area, alongside autopay status and upcoming charge dates.",
  },
] as const

function hasFeature(tier: TuitionTier, featureId: (typeof comparisonRows)[number]["id"]) {
  const text = [tier.description, tier.deposit, ...tier.includes].join(" ").toLowerCase()

  switch (featureId) {
    case "portal":
      return text.includes("portal") || text.includes("update")
    case "meals":
      return text.includes("meal") || text.includes("snack")
    case "events":
      return text.includes("event") || text.includes("enrichment")
    case "conferences":
      return text.includes("conference") || text.includes("milestone")
    case "early":
      return text.includes("early drop-off")
    case "late":
      return text.includes("late pickup")
    default:
      return false
  }
}

function PlanCard({ tier, compact }: { tier: TuitionTier; compact: boolean }) {
  const visibleIncludes = compact ? tier.includes.slice(0, 2) : tier.includes

  return (
    <Card
      className={cn(
        "border-border/70 bg-card/90 shadow-[0_18px_52px_-38px_rgba(31,64,62,0.42)]",
        tier.featured && "border-primary/35"
      )}
    >
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-2xl tracking-tight">{tier.name}</CardTitle>
            <CardDescription className="mt-1 text-sm">{tier.schedule}</CardDescription>
          </div>
          {tier.featured ? (
            <Badge className="rounded-full px-3 py-1.5">Most chosen</Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full px-3 py-1.5">
              Family plan
            </Badge>
          )}
        </div>

        <div>
          <p className="font-heading text-4xl tracking-tight text-foreground">
            {formatCurrency(tier.weeklyRate)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">per week</p>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{tier.description}</p>
      </CardHeader>

      <CardContent className="grid gap-3">
        <div className="rounded-[1.35rem] border border-border/60 bg-[linear-gradient(180deg,rgba(232,240,238,0.78),rgba(255,255,255,0.72))] p-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
          {tier.deposit}
        </div>
        <div className="grid gap-2">
          {visibleIncludes.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-[1.1rem] border border-border/60 bg-background/78 px-3 py-2.5 text-sm leading-6 text-muted-foreground"
            >
              <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button
          asChild
          variant={tier.featured ? "default" : "outline"}
          className="w-full rounded-full sm:w-auto"
        >
          <Link href="/tour">
            Schedule a tour
            <ChevronRightIcon data-icon="inline-end" />
          </Link>
        </Button>
        {!compact && (
          <Button asChild variant="ghost" className="w-full rounded-full sm:w-auto">
            <Link href="/login">
              View billing portal
              <CreditCardIcon data-icon="inline-end" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function ComparisonAndBilling({ items }: { items: TuitionTier[] }) {
  return (
    <Tabs defaultValue="compare" className="grid gap-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="compare">Compare plans</TabsTrigger>
        <TabsTrigger value="billing">Billing clarity</TabsTrigger>
      </TabsList>

      <TabsContent value="compare" className="mt-0">
        <Card className="bg-background/88">
          <CardHeader className="gap-3">
            <CardTitle className="text-xl tracking-tight">Plan comparison at a glance</CardTitle>
            <CardDescription>
              Families can compare schedule fit and included services before they ever need to call.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Feature</TableHead>
                  {items.map((tier) => (
                    <TableHead key={tier.name} className="text-center">
                      {tier.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                    {items.map((tier) => (
                      <TableCell key={`${tier.name}-${row.id}`} className="text-center">
                        {hasFeature(tier, row.id) ? (
                          <span className="inline-flex items-center justify-center rounded-full border border-border/60 bg-secondary/65 px-2 py-1 text-xs font-semibold text-foreground">
                            Included
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not included</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-0">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-background/88">
            <CardHeader>
              <CardTitle className="text-xl tracking-tight">Billing built for less friction</CardTitle>
              <CardDescription>
                Parents and administrators use the same system for charges, history, and follow-up.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {billingPillars.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-border/60 bg-background/82 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 items-center justify-center rounded-[0.9rem] border border-border/60 bg-secondary/65 text-primary">
                      <item.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-background/88">
            <CardHeader>
              <CardTitle className="text-xl tracking-tight">Common billing questions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Accordion type="single" collapsible defaultValue="q-1">
                {billingFaqs.map((faq, index) => (
                  <AccordionItem key={faq.title} value={`q-${index + 1}`}>
                    <AccordionTrigger className="py-3 text-left hover:no-underline">
                      {faq.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-6 text-muted-foreground">
                      {faq.detail}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Separator />
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/tour">
                  Talk through tuition on a tour
                  <ChevronRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export function TuitionGrid({
  items,
  compact = false,
}: {
  items: TuitionTier[]
  compact?: boolean
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn("grid gap-4", compact && "gap-3")}>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((tier, index) => (
          <MotionFadeIn key={tier.name} y={14} delay={index * 0.05}>
            <PlanCard tier={tier} compact={compact} />
          </MotionFadeIn>
        ))}
      </div>
      {!compact && (
        <MotionFadeIn y={16} delay={0.08}>
          <ComparisonAndBilling items={items} />
        </MotionFadeIn>
      )}
    </div>
  )
}
