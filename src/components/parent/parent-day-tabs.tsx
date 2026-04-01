"use client"

import type { ActivityNote, MealLog, NapLog } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ParentDayTabs({
  meals,
  naps,
  activities,
}: {
  meals: MealLog[]
  naps: NapLog[]
  activities: ActivityNote[]
}) {
  return (
    <Tabs defaultValue="meals">
      <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-secondary/70 p-1">
        <TabsTrigger value="meals" className="rounded-xl">
          Meals
        </TabsTrigger>
        <TabsTrigger value="naps" className="rounded-xl">
          Naps
        </TabsTrigger>
        <TabsTrigger value="activities" className="rounded-xl">
          Activities
        </TabsTrigger>
      </TabsList>
      <TabsContent value="meals" className="mt-4 flex flex-col gap-3">
        {meals.map((meal) => (
          <div
            key={`${meal.meal}-${meal.time}`}
            className="rounded-3xl border border-border/70 bg-background/75 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{meal.meal}</p>
                <p className="mt-1 text-sm text-muted-foreground">{meal.note}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {meal.ate} · {meal.time}
              </Badge>
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="naps" className="mt-4 flex flex-col gap-3">
        {naps.map((nap) => (
          <div
            key={`${nap.start}-${nap.end}`}
            className="rounded-3xl border border-border/70 bg-background/75 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {nap.start} - {nap.end}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{nap.note}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {nap.duration}
              </Badge>
            </div>
          </div>
        ))}
      </TabsContent>
      <TabsContent value="activities" className="mt-4 flex flex-col gap-3">
        {activities.map((activity) => (
          <div
            key={activity.title}
            className="rounded-3xl border border-border/70 bg-background/75 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium text-foreground">{activity.title}</p>
              <Badge variant="secondary" className="rounded-full">
                {activity.domain}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {activity.detail}
            </p>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}
