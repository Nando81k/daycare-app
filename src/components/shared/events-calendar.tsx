"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarX2Icon } from "lucide-react"

import type { CalendarEvent } from "@/lib/types"
import { formatLongDate } from "@/lib/format"
import { SoftEmptyState } from "@/components/shared/soft-empty-state"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EventsCalendar({
  events,
  title,
  description,
}: {
  events: CalendarEvent[]
  title: string
  description: string
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    () => (events[0] ? new Date(events[0].date) : undefined)
  )

  const selectedEvents = React.useMemo(() => {
    if (!selectedDate) {
      return events
    }

    const key = format(selectedDate, "yyyy-MM-dd")
    return events.filter((event) => event.date === key)
  }, [events, selectedDate])

  const highlightedDates = React.useMemo(
    () => events.map((event) => new Date(event.date)),
    [events]
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <Card className="border-border/70 bg-card/92">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ highlighted: highlightedDates }}
            modifiersClassNames={{
              highlighted: "bg-primary/10 text-primary font-semibold",
            }}
            className="rounded-[1.5rem] border border-border/70 bg-background/70"
          />
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-card/92">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">
            {selectedDate ? formatLongDate(selectedDate) : "Upcoming events"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {selectedEvents.length ? (
            selectedEvents.map((event) => (
              <div
                key={`${event.date}-${event.title}`}
                className="rounded-[1.6rem] border border-border/70 bg-background/78 p-4 shadow-[0_18px_40px_-32px_rgba(44,74,72,0.32)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.time} · {event.location}
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {event.audience}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <SoftEmptyState
              title="No events on this date"
              description="Try another highlighted day or keep this date open for a quieter schedule."
              icon={CalendarX2Icon}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
