"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"

import type { ReportBarPreview } from "@/types/app"

import { SurfaceCard } from "@/components/shared/surface-card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  value: {
    label: "Value",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function AdminBarChart({
  title,
  description,
  data,
  valueFormat = "number",
}: {
  title: string
  description?: string
  data: ReportBarPreview[]
  valueFormat?: "number" | "currency"
}) {
  const formatValue = (value: number) =>
    valueFormat === "currency" ? `$${value.toLocaleString()}` : String(value)

  const chartData = data.map((item, index) => ({
    label: item.label,
    value: item.value,
    note: item.note,
    fill: index % 2 === 0 ? "var(--color-primary)" : "color-mix(in oklab, var(--color-primary) 72%, white)",
  }))

  return (
    <SurfaceCard density="compact" className="h-full px-4 py-4 md:px-5">
      <div className="space-y-1.5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">Chart</p>
        <h3 className="text-xl text-foreground">{title}</h3>
        {description ? <p className="text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <ChartContainer config={chartConfig} className="min-h-[15rem] w-full">
        <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 10, top: 6, bottom: 6 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tickFormatter={(value) => String(value).slice(0, 10)}
          />
          <YAxis hide />
          <ChartTooltip
            cursor={{ fill: "rgba(120, 158, 154, 0.08)" }}
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => (
                  <div className="flex min-w-44 items-center justify-between gap-3">
                    <span className="text-muted-foreground">{item.payload.label}</span>
                    <span className="font-medium text-foreground">{formatValue(Number(value))}</span>
                  </div>
                )}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.note ?? ""}
              />
            }
          />
          <Bar dataKey="value" radius={[10, 10, 4, 4]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.label} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              offset={12}
              formatter={(value) => formatValue(Number(value ?? 0))}
              className="fill-foreground text-[11px] font-medium"
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </SurfaceCard>
  )
}
