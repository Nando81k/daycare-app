import { AdminOverview } from "@/components/admin/admin-overview"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Admin dashboard"
        title="Daily overview for the center."
        description="Enrollment, attendance, staffing, classrooms, payments, and announcements in one operational workspace."
        badge="Mock data"
      />
      <AdminOverview />
    </div>
  )
}
