import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import {
  activityNotes,
  careChart,
  childProfile,
  dayTimeline,
  mealLogs,
  napLogs,
  parentEvents,
  parentStats,
} from "@/data/parent"
import { CareInsightsChart } from "@/components/shared/dashboard-charts"
import { ParentDayTabs } from "@/components/parent/parent-day-tabs"
import { StatCard } from "@/components/shared/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ParentOverview() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {parentStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden bg-card/92">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 border border-border/70 bg-secondary">
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Today&apos;s rhythm
                  </p>
                  <CardTitle className="font-heading text-2xl tracking-tight">
                    {childProfile.name}’s day so far
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Checked in at {childProfile.checkInAt} · {childProfile.classroom}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/parent/child">
                  View full profile
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayTimeline.map((event) => (
                <div
                  key={`${event.time}-${event.title}`}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-border/60 bg-background/82 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {event.detail}
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                    {event.time}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <CareInsightsChart data={careChart} />
        </div>
        <div className="flex flex-col gap-6">
          <Card className="bg-card/92">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Care details
              </p>
              <CardTitle className="font-heading text-2xl tracking-tight">
                Meals, naps, and activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ParentDayTabs
                meals={mealLogs}
                naps={napLogs}
                activities={activityNotes}
              />
            </CardContent>
          </Card>
          <Card className="bg-card/92">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="font-heading text-2xl tracking-tight">
                Coming up
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/parent/calendar">See calendar</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {parentEvents.slice(0, 2).map((event) => (
                <div
                  key={event.title}
                  className="rounded-[1.5rem] border border-border/60 bg-background/82 p-4"
                >
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.time} · {event.location}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
