"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal } from "lucide-react";

const earningsData = [
  { label: "Total Revenue", value: 75, amount: "$45,231" },
  { label: "Subscriptions", value: 60, amount: "$12,350" },
  { label: "Sales", value: 45, amount: "$8,120" },
  { label: "Active Users", value: 85, amount: "2.4K" },
];

export function WidgetTotalEarning() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Total Earnings</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Report</DropdownMenuItem>
            <DropdownMenuItem>Export Data</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <span className="text-3xl font-bold">$67,701</span>
          <span className="text-muted-foreground ml-2 text-sm">
            +20.1% from last month
          </span>
        </div>
        {earningsData.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{item.amount}</span>
            </div>
            <Progress value={item.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
