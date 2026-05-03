"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default:
          "h-9 gap-1 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-sm",
        line: "h-auto gap-6 rounded-none border-b border-border/60 bg-transparent p-0 group-data-vertical/tabs:gap-2 group-data-vertical/tabs:border-b-0 group-data-vertical/tabs:border-l group-data-vertical/tabs:pl-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base reset shared across variants.
        "relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium text-foreground/60 transition-colors duration-200 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Default (pill) variant.
        "group-data-[variant=default]/tabs-list:h-7 group-data-[variant=default]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:rounded-full group-data-[variant=default]/tabs-list:px-3.5 group-data-[variant=default]/tabs-list:py-0",
        "group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.02)]",
        // Line variant: editorial accent underline that scales in.
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:py-2.5",
        "group-data-[variant=line]/tabs-list:data-active:text-foreground",
        // Animated underline (line variant + horizontal). Uses `accent` token so
        // it picks up the brand color on both auth screens and portal pages.
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:left-0 group-data-[variant=line]/tabs-list:after:right-0 group-data-[variant=line]/tabs-list:after:-bottom-px group-data-[variant=line]/tabs-list:after:h-0.5 group-data-[variant=line]/tabs-list:after:origin-left group-data-[variant=line]/tabs-list:after:scale-x-0 group-data-[variant=line]/tabs-list:after:bg-accent group-data-[variant=line]/tabs-list:after:transition-transform group-data-[variant=line]/tabs-list:after:duration-300 group-data-[variant=line]/tabs-list:after:ease-out",
        "group-data-[variant=line]/tabs-list:hover:after:scale-x-100 group-data-[variant=line]/tabs-list:focus-visible:after:scale-x-100 group-data-[variant=line]/tabs-list:data-active:after:scale-x-100",
        // Vertical line variant: swap underline for a left-edge bar.
        "group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:inset-y-0 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:-left-px group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:right-auto group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:bottom-auto group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:h-auto group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:w-0.5 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:origin-top group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:scale-y-0 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:scale-x-100 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:hover:after:scale-y-100 group-data-vertical/tabs:group-data-[variant=line]/tabs-list:data-active:after:scale-y-100",
        // Focus ring for keyboard users — applied on both variants.
        "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0 group-data-[variant=default]/tabs-list:focus-visible:rounded-full",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
