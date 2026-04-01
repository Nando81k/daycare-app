import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({
  label,
  value,
  trend,
  detail,
}: {
  label: string
  value: string
  trend: string
  detail: string
}) {
  const trendVariant =
    trend.toLowerCase().includes("action") || trend.toLowerCase().includes("due")
      ? "outline"
      : "secondary"

  return (
    <Card className="bg-card/92 shadow-[0_26px_56px_-42px_rgba(31,64,62,0.55)]">
      <CardHeader className="gap-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Badge variant={trendVariant} className="rounded-full px-3 py-1">
            {trend}
          </Badge>
        </div>
        <CardTitle className="font-heading text-4xl tracking-tight text-foreground">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
