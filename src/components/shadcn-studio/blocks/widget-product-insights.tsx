"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const productReachData = [
  { month: "Jan", reach: 4000 },
  { month: "Feb", reach: 3000 },
  { month: "Mar", reach: 5000 },
  { month: "Apr", reach: 4500 },
  { month: "May", reach: 6000 },
  { month: "Jun", reach: 5500 },
];

const orderPlacedData = [
  { month: "Jan", orders: 2400 },
  { month: "Feb", orders: 1398 },
  { month: "Mar", orders: 9800 },
  { month: "Apr", orders: 3908 },
  { month: "May", orders: 4800 },
  { month: "Jun", orders: 3800 },
];

const productReachConfig = {
  reach: {
    label: "Reach",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const orderPlacedConfig = {
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function WidgetProductInsights() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Product Reach</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={productReachConfig}>
            <BarChart accessibilityLayer data={productReachData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="reach" fill="var(--color-reach)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order Placed</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={orderPlacedConfig}>
            <BarChart accessibilityLayer data={orderPlacedData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
