"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import type { AttendanceMetric } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const careConfig = {
  naps: {
    label: "Naps",
    color: "var(--color-chart-2)",
  },
  activities: {
    label: "Activities",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig

const attendanceConfig = {
  present: {
    label: "Present",
    color: "var(--color-chart-1)",
  },
  absent: {
    label: "Absent",
    color: "var(--color-chart-4)",
  },
} satisfies ChartConfig

const paymentConfig = {
  collected: {
    label: "Collected",
    color: "var(--color-chart-1)",
  },
  outstanding: {
    label: "Outstanding",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig

export function CareInsightsChart({
  data,
}: {
  data: Array<{ day: string; naps: number; meals: number; activities: number }>
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-tight">
          Weekly care rhythm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={careConfig} className="h-[260px] w-full aspect-auto">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="activities"
              stroke="var(--color-activities)"
              fill="var(--color-activities)"
              fillOpacity={0.14}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="naps"
              stroke="var(--color-naps)"
              fill="var(--color-naps)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function AttendanceTrendChart({ data }: { data: AttendanceMetric[] }) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-tight">
          Attendance and absences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={attendanceConfig}
          className="h-[280px] w-full aspect-auto"
        >
          <BarChart data={data} barGap={8}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="present"
              fill="var(--color-present)"
              radius={[14, 14, 6, 6]}
            />
            <Bar
              dataKey="absent"
              fill="var(--color-absent)"
              radius={[14, 14, 6, 6]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PaymentTrendChart({
  data,
}: {
  data: Array<{ week: string; collected: number; outstanding: number }>
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-tight">
          Billing pulse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={paymentConfig} className="h-[260px] w-full aspect-auto">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex min-w-40 items-center justify-between gap-3">
                      <span>{String(name)}</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="collected"
              stroke="var(--color-collected)"
              fill="var(--color-collected)"
              fillOpacity={0.16}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              stroke="var(--color-outstanding)"
              fill="var(--color-outstanding)"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
