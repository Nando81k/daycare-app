"use client"

import {
  CreditCardIcon,
  MessageSquareTextIcon,
  MoonStarIcon,
  UtensilsIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const previewTabs = [
  {
    value: "meals",
    label: "Meals",
    icon: UtensilsIcon,
    summary: "Breakfast logged at 8:35 AM with one refill of water.",
    detail: "Ate oatmeal, pear slices, and water. Teacher noted a calm start and steady appetite.",
    action: "Shared with both parents",
  },
  {
    value: "naps",
    label: "Naps",
    icon: MoonStarIcon,
    summary: "Rest started at 12:35 PM and ended calm after 58 minutes.",
    detail: "Sleep started smoothly after story time and ended with a quiet diaper change and cuddle.",
    action: "Updated in real time",
  },
  {
    value: "messages",
    label: "Messages",
    icon: MessageSquareTextIcon,
    summary: "Teachers can send clear, practical updates without clutter.",
    detail: "Families receive short notes, quick replies, and context that supports pickup conversations.",
    action: "Unread replies highlighted",
  },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    summary: "Statements, autopay, receipts, and balances live in one place.",
    detail: "Invoices stay readable, payment methods stay visible, and follow-up actions are never buried.",
    action: "Autopay status visible",
  },
]

export function PortalPreview() {
  return (
    <div className="soft-panel-strong relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">Parent portal preview</p>
              <Badge variant="secondary" className="rounded-full">
                Live classroom updates
              </Badge>
            </div>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Warm updates, practical details, and fewer end-of-day surprises for busy families.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                What parents can see
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Parent portal at a glance</DialogTitle>
                <DialogDescription>
                  Families get a calm daily overview, quick billing access, and direct classroom notes
                  in one place.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
                  Daily feed with check-in, meals, naps, activities, and teacher notes.
                </div>
                <div className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
                  Messages, billing, forms, event calendar, and pickup contacts from the same navigation.
                </div>
                <div className="rounded-[1.35rem] border border-border/70 bg-background/75 p-4">
                  Mobile-friendly layouts designed for quick scanning during work, commute, or pickup.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 rounded-[1.9rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(245,249,247,0.96))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-border/60 bg-background/88 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-primary/70" />
              <span className="size-2.5 rounded-full bg-secondary" />
              <span className="size-2.5 rounded-full bg-border" />
            </div>
            <div className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground">
              Tuesday overview
            </div>
          </div>

          <Tabs defaultValue="meals" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 gap-2 rounded-[1.35rem] bg-background/70 p-1.5 md:grid-cols-4">
              {previewTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-[1rem]">
                  <tab.icon data-icon="inline-start" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {previewTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-5">
                <div className="soft-grid gap-4 rounded-[1.6rem] bg-background/82 p-4 sm:grid-cols-[minmax(0,1.2fr)_0.8fr]">
                  <div className="rounded-[1.35rem] border border-border/60 bg-background/92 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{tab.label} snapshot</p>
                      <Badge variant="outline" className="rounded-full">
                        {tab.action}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{tab.summary}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{tab.detail}</p>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-[1.25rem] border border-border/60 bg-secondary/55 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        First update
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">8:12 AM</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/60 bg-background/90 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Staff note
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">Clear, brief, and easy to scan</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/60 bg-background/90 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Parent action
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">One tap away</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
