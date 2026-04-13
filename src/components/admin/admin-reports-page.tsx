import Link from "next/link"

import { AdminBarChart } from "@/components/admin/admin-bar-chart"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AlertBanner } from "@/components/shared/alert-banner"
import { PageShell } from "@/components/shared/page-shell"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import {
  adminMetrics,
  adminReportBars,
  adminReportsPageContent,
} from "@/data/admin"
import type { AdminMetricPreview, ReportBarPreview } from "@/types/app"

export function AdminReportsPageView({
  metrics = adminMetrics,
  reportBars = adminReportBars,
}: {
  metrics?: AdminMetricPreview[]
  reportBars?: {
    attendance: ReportBarPreview[]
    revenue: ReportBarPreview[]
    enrollment: ReportBarPreview[]
  }
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminReportsPageContent.eyebrow}
        title={adminReportsPageContent.title}
        description={adminReportsPageContent.description}
        actions={
          <>
            <Link href="/admin/attendance" className={buttonVariants({ variant: "outline" })}>
              Open attendance
            </Link>
            <Link href="/admin/billing" className={buttonVariants({ variant: "default" })}>
              Open billing
            </Link>
          </>
        }
      >
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-chip">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </AdminPageHeader>

      <AlertBanner
        tone="info"
        title="Only keep charts that improve understanding"
        description="This page focuses on attendance, enrollment movement, and collections because those are the operational signals that actually help the admin team act."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminBarChart
          title="Attendance"
          description="Daily presence by classroom."
          data={reportBars.attendance}
        />
        <AdminBarChart
          title="Enrollment movement"
          description="Pipeline progress should be legible without another spreadsheet."
          data={reportBars.enrollment}
        />
        <AdminBarChart
          title="Billing"
          description="A clear collections snapshot for the current sample month."
          data={reportBars.revenue}
          valueFormat="currency"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Readouts</p>
            <h2 className="text-xl text-foreground">What stands out in this sample</h2>
          </div>
          <div className="grid gap-3">
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Attendance is healthy overall, which means classroom disruptions are more about exceptions than broad instability.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Enrollment still has enough early-stage leads that follow-up discipline matters more than more reporting detail.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Billing pressure exists, but the current queue is still explainable and manageable rather than systemic.
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Why this page exists</p>
            <h2 className="text-xl text-foreground">Reports should earn their visual weight</h2>
          </div>
          <div className="grid gap-3">
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Keep the chart set small. More visual variety does not create more operational clarity.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Use these summaries to direct attention back into the real workflows: enrollment, attendance, billing, and announcements.
            </div>
            <div className="surface-panel-quiet rounded-[1.2rem] px-4 py-4 text-sm leading-6 text-muted-foreground">
              Metrics should feel like school operations, not a generic SaaS analytics page pasted onto a daycare product.
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  )
}
