import { classroomSummaries } from "@/data/admin"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminClassroomsPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Classrooms"
        title="Room-by-room status and capacity."
        description="Capacity, staffing ratios, and classroom highlights stay visible without digging into separate tools."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {classroomSummaries.map((room) => (
          <Card key={room.name} className="border-border/70 bg-card/90">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="font-heading text-2xl tracking-tight">
                  {room.name}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{room.ageGroup}</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {room.occupancy}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Lead: {room.staffLead}</p>
              <p>Ratio: {room.ratio}</p>
              <p>{room.highlight}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
