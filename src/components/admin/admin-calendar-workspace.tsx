"use client"

import { useState } from "react"
import {
  CalendarDaysIcon,
  Clock3Icon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react"
import { TZDate } from "react-day-picker"

import { getCalendarEventVariant } from "@/components/admin/admin-status"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { AdminCalendarEventPreview } from "@/types/app"

const SCHOOL_TIME_ZONE = "America/New_York"
const DAY_KEY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  month: "long",
  year: "numeric",
})
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
})
const HOURS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  hour: "numeric",
})
const NEXT_EVENT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SCHOOL_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const TIMELINE_HOURS = Array.from({ length: 15 }, (_, index) => index + 6)

type NormalizedAdminEvent = AdminCalendarEventPreview & {
  schoolDate: TZDate
  startsAtIso: string
  dayKey: string
  monthKey: string
  startHour: number
  startMinute: number
  sortTimestamp: number
}

function getDatePart(value: Date | string, type: Intl.DateTimeFormatPartTypes) {
  return (
    DAY_KEY_FORMATTER.formatToParts(new Date(value)).find((part) => part.type === type)?.value ?? ""
  )
}

function toSchoolDayKey(value: Date | string) {
  return `${getDatePart(value, "year")}-${getDatePart(value, "month")}-${getDatePart(value, "day")}`
}

function toSchoolMonthKey(value: Date | string) {
  return `${getDatePart(value, "year")}-${getDatePart(value, "month")}`
}

function toSchoolCalendarDate(value: Date | string) {
  const zonedDate = TZDate.tz(SCHOOL_TIME_ZONE, new Date(value))
  return new TZDate(
    zonedDate.getFullYear(),
    zonedDate.getMonth(),
    zonedDate.getDate(),
    12,
    SCHOOL_TIME_ZONE,
  )
}

function toSchoolMonthStart(value: Date | string) {
  const zonedDate = TZDate.tz(SCHOOL_TIME_ZONE, new Date(value))
  return new TZDate(zonedDate.getFullYear(), zonedDate.getMonth(), 1, 12, SCHOOL_TIME_ZONE)
}

function getSchoolToday() {
  const today = TZDate.tz(SCHOOL_TIME_ZONE)
  return new TZDate(today.getFullYear(), today.getMonth(), today.getDate(), 12, SCHOOL_TIME_ZONE)
}

function formatMonthLabel(value: Date | string) {
  return MONTH_LABEL_FORMATTER.format(new Date(value))
}

function formatFullDateLabel(value: Date | string) {
  return FULL_DATE_FORMATTER.format(new Date(value))
}

function formatNextEventLabel(value: Date | string) {
  return NEXT_EVENT_FORMATTER.format(new Date(value))
}

function formatHourLabel(hour: number) {
  return HOURS_FORMATTER.format(new TZDate(2026, 3, 1, hour, 0, SCHOOL_TIME_ZONE))
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function buildIsoFromAdminEvent(event: AdminCalendarEventPreview): string {
  const [year, month, day] = event.eventDateValue.split("-").map((part) => Number(part))
  const [hourStr, minuteStr] = (event.startsAtValue ?? "09:00").split(":")
  const hour = Number(hourStr) || 9
  const minute = Number(minuteStr) || 0
  return new TZDate(year, month - 1, day, hour, minute, SCHOOL_TIME_ZONE).toISOString()
}

function normalizeEvents(events: AdminCalendarEventPreview[]): NormalizedAdminEvent[] {
  return [...events]
    .map<NormalizedAdminEvent>((event) => {
      const startsAtIso = buildIsoFromAdminEvent(event)
      const schoolDate = TZDate.tz(SCHOOL_TIME_ZONE, startsAtIso)

      return {
        ...event,
        schoolDate,
        startsAtIso,
        dayKey: toSchoolDayKey(startsAtIso),
        monthKey: toSchoolMonthKey(startsAtIso),
        startHour: schoolDate.getHours(),
        startMinute: schoolDate.getMinutes(),
        sortTimestamp: schoolDate.getTime(),
      }
    })
    .sort((first, second) => first.sortTimestamp - second.sortTimestamp)
}

function getDefaultSelectedDay(month: Date, events: NormalizedAdminEvent[]) {
  const today = getSchoolToday()

  if (toSchoolMonthKey(today) === toSchoolMonthKey(month)) {
    return today
  }

  const nextEventInMonth = events.find((event) => event.monthKey === toSchoolMonthKey(month))

  if (nextEventInMonth) {
    return toSchoolCalendarDate(nextEventInMonth.startsAtIso)
  }

  return toSchoolMonthStart(month)
}

function SummaryMetric({
  label,
  value,
  supporting,
}: {
  label: string
  value: string
  supporting: string
}) {
  return (
    <div className="rounded-[1.15rem] border border-border/60 bg-muted/14 px-4 py-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{supporting}</p>
    </div>
  )
}

function LegendChip({ category }: { category: AdminCalendarEventPreview["category"] }) {
  return (
    <StatusBadge variant={getCalendarEventVariant(category)}>{toTitleCase(category)}</StatusBadge>
  )
}

function TimelineEventCard({
  event,
  onEdit,
}: {
  event: NormalizedAdminEvent
  onEdit: (eventId: string) => void
}) {
  return (
    <div className="rounded-[1.1rem] border border-border/60 bg-background/92 px-3 py-3 shadow-[0_14px_28px_-24px_rgba(17,24,39,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{event.title}</p>
            <StatusBadge variant={getCalendarEventVariant(event.category)}>
              {toTitleCase(event.category)}
            </StatusBadge>
            <Badge variant="outline">{event.targetLabel}</Badge>
          </div>
          <p className="mt-1 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {event.timeLabel}
            {event.timeKind === "all-day" ? " · all-day" : ""}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onEdit(event.id)}
          className="gap-1 text-xs"
        >
          <PencilIcon className="h-3 w-3" />
          Edit
        </Button>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
    </div>
  )
}

export function AdminCalendarWorkspace({
  events,
  onEditEvent,
  onCreateEvent,
}: {
  events: AdminCalendarEventPreview[]
  onEditEvent: (eventId: string) => void
  onCreateEvent: () => void
}) {
  const normalizedEvents = normalizeEvents(events)
  const initialMonth = toSchoolMonthStart(getSchoolToday())
  const [visibleMonth, setVisibleMonth] = useState<Date>(initialMonth)
  const [selectedDay, setSelectedDay] = useState<Date>(() =>
    getDefaultSelectedDay(initialMonth, normalizedEvents),
  )

  const visibleMonthKey = toSchoolMonthKey(visibleMonth)
  const monthEvents = normalizedEvents.filter((event) => event.monthKey === visibleMonthKey)
  const closuresInMonth = monthEvents.filter((event) => event.category === "closure").length
  const nextUpcomingEvent = normalizedEvents[0] ?? null

  const eventDays = Array.from(
    new Map(
      normalizedEvents.map((event) => [event.dayKey, toSchoolCalendarDate(event.startsAtIso)]),
    ).values(),
  )

  const selectedDayKey = toSchoolDayKey(selectedDay)
  const selectedDayEvents = normalizedEvents.filter((event) => event.dayKey === selectedDayKey)
  const allDayEvents = selectedDayEvents.filter((event) => event.timeKind === "all-day")
  const timelineEvents = selectedDayEvents.filter((event) => event.timeKind !== "all-day")

  function handleMonthChange(nextMonth: Date) {
    const schoolMonth = toSchoolMonthStart(nextMonth)
    setVisibleMonth(schoolMonth)
    setSelectedDay(getDefaultSelectedDay(schoolMonth, normalizedEvents))
  }

  function handleSelectedDay(nextSelectedDay: Date | undefined) {
    if (!nextSelectedDay) {
      return
    }

    const schoolDay = toSchoolCalendarDate(nextSelectedDay)
    const schoolMonth = toSchoolMonthStart(nextSelectedDay)

    if (toSchoolMonthKey(schoolMonth) !== visibleMonthKey) {
      setVisibleMonth(schoolMonth)
    }

    setSelectedDay(schoolDay)
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.18fr)_minmax(10rem,0.5fr)_minmax(10rem,0.5fr)]">
          <div className="rounded-[1.3rem] border border-primary/14 bg-primary/6 px-4 py-4 md:px-5">
            {nextUpcomingEvent ? (
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/92 text-primary">
                  <SparklesIcon className="size-4" />
                </span>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Next upcoming</Badge>
                    <StatusBadge variant={getCalendarEventVariant(nextUpcomingEvent.category)}>
                      {toTitleCase(nextUpcomingEvent.category)}
                    </StatusBadge>
                    <Badge variant="outline">{nextUpcomingEvent.targetLabel}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold tracking-tight text-foreground">
                      {nextUpcomingEvent.title}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {nextUpcomingEvent.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDaysIcon className="size-4 text-primary" />
                      {formatNextEventLabel(nextUpcomingEvent.startsAtIso)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3Icon className="size-4 text-primary" />
                      {nextUpcomingEvent.timeLabel}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="secondary">Calendar overview</Badge>
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  No published events yet
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Create the first family event, classroom activity, or closure and it will appear
                  on every parent calendar within the targeted scope.
                </p>
                <Button type="button" size="sm" onClick={onCreateEvent} className="mt-2 gap-1.5">
                  <PlusIcon className="h-3.5 w-3.5" />
                  New event
                </Button>
              </div>
            )}
          </div>

          <SummaryMetric
            label="Visible month"
            value={String(monthEvents.length)}
            supporting={`${formatMonthLabel(visibleMonth)} events currently highlighted in the calendar grid.`}
          />
          <SummaryMetric
            label="Closures this month"
            value={String(closuresInMonth)}
            supporting="Closure events publish across the whole school for parents."
          />
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="gap-4 border-b border-border/50 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Month view and selected-day agenda</CardTitle>
              <CardDescription>
                Click any day to focus the school schedule for that date. Each event has an inline
                edit button — tap it to revise time, target, or copy.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LegendChip category="family" />
              <LegendChip category="classroom" />
              <LegendChip category="closure" />
              <Button type="button" size="sm" onClick={onCreateEvent} className="gap-1.5">
                <PlusIcon className="h-3.5 w-3.5" />
                New event
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1.04fr)_minmax(20rem,0.96fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {formatMonthLabel(visibleMonth)}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Days with published events are softly highlighted in the month grid.
                </p>
              </div>
              <Badge variant="secondary">{monthEvents.length} events</Badge>
            </div>

            <div className="rounded-[1.35rem] border border-border/60 bg-muted/10 p-3 sm:p-4">
              <Calendar
                mode="single"
                month={visibleMonth}
                onMonthChange={handleMonthChange}
                selected={selectedDay}
                onSelect={handleSelectedDay}
                timeZone={SCHOOL_TIME_ZONE}
                fixedWeeks
                showOutsideDays
                modifiers={{ hasEvents: eventDays }}
                modifiersClassNames={{
                  hasEvents:
                    "after:pointer-events-none after:absolute after:bottom-[0.42rem] after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary/55",
                }}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-[1.35rem] border border-border/60 bg-background/92">
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Selected day
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {formatFullDateLabel(selectedDay)}
                  </h3>
                </div>
                <Badge variant="secondary">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? "event" : "events"}
                </Badge>
              </div>

              {selectedDayEvents.length ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  All-day reminders sit at the top; timed events appear in the hourly agenda below
                  from 6:00 AM through 8:00 PM.
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  No events scheduled for this date yet — pick a different day, or create one.
                </p>
              )}
            </div>

            <Separator />

            {selectedDayEvents.length ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">All-day events</p>
                    <Badge variant="secondary">
                      {allDayEvents.length} {allDayEvents.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>

                  {allDayEvents.length ? (
                    <div className="flex flex-wrap gap-3">
                      {allDayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="min-w-[14rem] flex-1 rounded-[1.05rem] border border-border/60 bg-muted/16 px-3 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{event.title}</p>
                              <StatusBadge variant={getCalendarEventVariant(event.category)}>
                                {toTitleCase(event.category)}
                              </StatusBadge>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => onEditEvent(event.id)}
                              className="gap-1 text-xs"
                            >
                              <PencilIcon className="h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                          <p className="mt-1 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {event.targetLabel}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-border/60 bg-muted/12 px-3 py-3 text-sm leading-6 text-muted-foreground">
                      No all-day items for this date.
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3 pb-3">
                    <p className="text-sm font-semibold text-foreground">Hourly timeline</p>
                    <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted-foreground">
                      6:00 AM to 8:00 PM
                    </p>
                  </div>

                  {timelineEvents.length ? (
                    <ScrollArea className="h-[34rem] pr-2">
                      <div className="space-y-2 pb-2">
                        {TIMELINE_HOURS.map((hour) => {
                          const slotEvents = timelineEvents.filter(
                            (event) => event.startHour === hour,
                          )

                          return (
                            <div
                              key={hour}
                              className="grid grid-cols-[3.35rem_minmax(0,1fr)] items-start gap-3"
                            >
                              <div className="pt-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                {formatHourLabel(hour)}
                              </div>
                              <div className="rounded-[1rem] border border-dashed border-border/55 bg-muted/10 px-3 py-3">
                                {slotEvents.length ? (
                                  <div className="space-y-2">
                                    {slotEvents.map((event) => (
                                      <TimelineEventCard
                                        key={event.id}
                                        event={event}
                                        onEdit={onEditEvent}
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="h-10 rounded-[0.95rem] bg-transparent" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <Empty className="min-h-[15rem] rounded-[1.15rem] border-border/60 bg-muted/12">
                      <EmptyMedia variant="icon">
                        <Clock3Icon />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No timed events on this day</EmptyTitle>
                        <EmptyDescription>
                          Add a classroom activity or family event with a specific start time and it
                          will appear here.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                <Empty className="min-h-[24rem] rounded-[1.2rem] border-border/60 bg-muted/12">
                  <EmptyMedia variant="icon">
                    <CalendarDaysIcon />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No events on this date</EmptyTitle>
                    <EmptyDescription>
                      Pick a highlighted day in the month view, or create a new event for this date.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button type="button" size="sm" onClick={onCreateEvent} className="mt-4 gap-1.5">
                    <PlusIcon className="h-3.5 w-3.5" />
                    New event
                  </Button>
                </Empty>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
