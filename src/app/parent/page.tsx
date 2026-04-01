import { ParentOverview } from "@/components/parent/parent-overview"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"

export default function ParentDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Parent dashboard"
        title="Today at Abassadors Care"
        description="A quick, reassuring overview of the moments families usually ask about first."
        badge="Mock data"
      />
      <ParentOverview />
    </div>
  )
}
