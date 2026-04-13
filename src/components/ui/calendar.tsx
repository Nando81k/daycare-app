"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"

import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("w-full", defaultClassNames.months),
        month: cn("w-full space-y-4", defaultClassNames.month),
        month_caption: cn(
          "mb-3 flex items-center justify-between gap-2",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-sm font-semibold tracking-[0.01em] text-foreground",
          defaultClassNames.caption_label
        ),
        nav: cn("flex items-center gap-1", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 rounded-full border border-border/60 bg-background/80 text-foreground/80 shadow-none hover:bg-accent/60",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 rounded-full border border-border/60 bg-background/80 text-foreground/80 shadow-none hover:bg-accent/60",
          defaultClassNames.button_next
        ),
        weekdays: cn("mb-2 grid grid-cols-7", defaultClassNames.weekdays),
        weekday: cn(
          "flex h-9 items-center justify-center text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 grid grid-cols-7", defaultClassNames.week),
        day: cn(
          "group/day relative p-0 text-center align-middle",
          "[&[data-today=true]>button]:ring-1 [&[data-today=true]>button]:ring-primary/45",
          "[&[data-selected=true]>button]:border-primary/18 [&[data-selected=true]>button]:bg-primary [&[data-selected=true]>button]:text-primary-foreground [&[data-selected=true]>button]:shadow-[0_18px_36px_-28px_rgba(71,130,126,0.78)]",
          "[&[data-outside=true]>button]:text-muted-foreground/38 [&[data-outside=true]>button]:opacity-80",
          "[&[data-disabled=true]>button]:text-muted-foreground/35 [&[data-disabled=true]>button]:opacity-55",
          defaultClassNames.day
        ),
        day_button: cn(
          "flex size-11 items-center justify-center rounded-[1rem] border border-transparent bg-transparent text-sm font-medium text-foreground transition-[background-color,border-color,color,box-shadow] duration-200 hover:border-primary/16 hover:bg-accent/52 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          defaultClassNames.day_button
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        outside: cn(defaultClassNames.outside),
        disabled: cn(defaultClassNames.disabled),
        hidden: cn(defaultClassNames.hidden),
        today: cn(defaultClassNames.today),
        selected: cn(defaultClassNames.selected),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation = "right" }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className={cn("size-4", chevronClassName)} />
          ) : (
            <ChevronRightIcon className={cn("size-4", chevronClassName)} />
          ),
        ...components,
      }}
      {...props}
    />
  )
}
