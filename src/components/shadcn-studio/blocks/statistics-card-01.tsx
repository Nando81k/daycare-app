import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type StatisticsCardProps = {
  icon: LucideIcon;
  value: string;
  title: string;
  change: string;
  changeType: "positive" | "negative";
};

export function StatisticsCard01({
  icon: Icon,
  value,
  title,
  change,
  changeType,
}: StatisticsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
          <Icon className="text-primary h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-muted-foreground text-sm">{title}</p>
        </div>
        <span
          className={`text-sm font-medium ${
            changeType === "positive" ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
      </CardContent>
    </Card>
  );
}
