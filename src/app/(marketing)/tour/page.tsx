import { CalendarDaysIcon } from "lucide-react"

import { tourSlots, visitChecklist } from "@/data/marketing"
import { EventsCalendar } from "@/components/shared/events-calendar"
import { PageIntro } from "@/components/shared/page-intro"
import { SectionShell } from "@/components/shared/section-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const tourEvents = tourSlots.map((slot) => ({
  title: `Tour with ${slot.host}`,
  date: slot.date,
  time: slot.time,
  audience: `${slot.seatsLeft} spots left`,
  location: "Abassadors Care",
}))

export default function TourPage() {
  return (
    <>
      <PageIntro
        eyebrow="Schedule a tour"
        title="See the classrooms, daily rhythm, and parent portal in one visit."
        description="Tours are designed to answer the practical questions first. You’ll walk the space, hear how routines work, and see how communication stays clear after enrollment."
        badge="No backend yet · mocked form"
      />
      <SectionShell
        title="Share a few details and pick a time that fits."
        description="This frontend form is mocked for now, but the structure reflects the intended production flow."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_1.05fr]">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="font-heading text-3xl tracking-tight">
                Tour request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-5">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="family-name">Parent or guardian name</FieldLabel>
                    <Input id="family-name" placeholder="Jordan Johnson" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="parent@example.com" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="child-age">Child age</FieldLabel>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="infant">Infant</SelectItem>
                          <SelectItem value="toddler">Toddler</SelectItem>
                          <SelectItem value="preschool">Preschool</SelectItem>
                          <SelectItem value="pre-k">Pre-K</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="notes">What would you like to talk through?</FieldLabel>
                    <Textarea
                      id="notes"
                      placeholder="Availability, daily routine, billing, or anything else that matters to your family."
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="w-full">
                  Submit mock request
                </Button>
              </form>
            </CardContent>
          </Card>
          <EventsCalendar
            events={tourEvents}
            title="Available tours"
            description="Tap a date to see the hosted time slots we’re holding this week."
          />
        </div>
      </SectionShell>
      <SectionShell
        eyebrow="Visit details"
        title="What the visit covers."
        description="Tours are built to be useful, not performative."
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-2xl tracking-tight">
                <CalendarDaysIcon className="size-5 text-primary" />
                Tour checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {visitChecklist.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-border/70 bg-background/75 p-4 text-sm leading-7 text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
          <Accordion type="single" collapsible className="rounded-[2rem] border border-border/70 bg-card/90 px-6">
            {tourSlots.map((slot) => (
              <AccordionItem key={`${slot.date}-${slot.time}`} value={`${slot.date}-${slot.time}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>{slot.time} on {slot.date}</span>
                    <Badge variant="secondary" className="rounded-full">
                      {slot.seatsLeft} seats left
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-muted-foreground">
                  Hosted by {slot.host}. This visit includes classroom walkthroughs, parent portal preview, and time for tuition or waitlist questions.
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SectionShell>
    </>
  )
}
