"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";

const chartDataPie = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfigPie = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const chartDataBar = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
  { month: "Jul", desktop: 186, mobile: 80 },
  { month: "Aug", desktop: 305, mobile: 200 },
  { month: "Sep", desktop: 237, mobile: 120 },
  { month: "Oct", desktop: 73, mobile: 190 },
  { month: "Nov", desktop: 209, mobile: 130 },
  { month: "Dec", desktop: 214, mobile: 140 },
];

const chartConfigBar = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const metricsData = [
  { label: "Impressions", value: "1.67M", color: "bg-chart-1" },
  { label: "Clicks", value: "20.7K", color: "bg-chart-2" },
  { label: "Conversions", value: "14.2K", color: "bg-chart-3" },
  { label: "Avg. CPC", value: "$3.50", color: "bg-chart-4" },
];

export function ChartSalesMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ChartContainer
            config={chartConfigPie}
            className="aspect-square max-h-[200px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartDataPie}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={50}
                strokeWidth={5}
              />
            </PieChart>
          </ChartContainer>
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              {metricsData.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`${item.color} h-3 w-3 rounded-full`} />
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground text-xs">
                Total Revenue
              </span>
              <span className="text-lg font-bold">$45,231.89</span>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground text-xs">
                Subscriptions
              </span>
              <span className="text-lg font-bold">+2,350</span>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="flex flex-col items-start">
              <span className="text-muted-foreground text-xs">
                Avg. Revenue
              </span>
              <span className="text-lg font-bold">$19.24</span>
            </div>
          </div>
          <ChartContainer config={chartConfigBar}>
            <BarChart accessibilityLayer data={chartDataBar}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="desktop"
                fill="var(--color-desktop)"
                radius={4}
              />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
