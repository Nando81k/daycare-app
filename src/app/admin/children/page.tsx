import { ChildrenTable } from "@/components/shared/dashboard-tables"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminChildrenPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Children"
        title="Roster visibility across classrooms."
        description="A quick view of children on roll, classroom placement, attendance status, and pickup planning."
      />
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">Child roster</CardTitle>
        </CardHeader>
        <CardContent>
          <ChildrenTable />
        </CardContent>
      </Card>
    </div>
  )
}
