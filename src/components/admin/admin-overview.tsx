import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import {
  adminStats,
  announcements,
  attendanceTrend,
  classroomSummaries,
  paymentTrend,
} from "@/data/admin"
import {
  AttendanceTrendChart,
  PaymentTrendChart,
} from "@/components/shared/dashboard-charts"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminOverview() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
        <div className="flex flex-col gap-6">
          <AttendanceTrendChart data={attendanceTrend} />
          <PaymentTrendChart data={paymentTrend} />
        </div>
        <div className="flex flex-col gap-6">
          <Card className="bg-card/92">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Communications
                </p>
                <CardTitle className="font-heading text-2xl tracking-tight">
                  Announcements
                </CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/reports">
                  Reports
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {announcements.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-border/60 bg-background/82 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {item.publishedAt}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-card/92">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Daily operations
                </p>
                <CardTitle className="font-heading text-2xl tracking-tight">
                  Classroom status
                </CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/classrooms">View all rooms</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {classroomSummaries.map((room) => (
                <div
                  key={room.name}
                  className="rounded-[1.5rem] border border-border/60 bg-background/82 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{room.name}</p>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {room.occupancy}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{room.highlight}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
