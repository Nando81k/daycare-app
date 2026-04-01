import { createAdminInvite } from "@/app/actions/admin"
import {
  acceptApplication,
  updateApplicationStatus,
} from "@/app/actions/enrollment"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import { getAdminEnrollmentPipeline } from "@/lib/dal/enrollment"

const statusOptions = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "TOUR_SCHEDULED",
  "ACCEPTED",
  "WAITLISTED",
  "DECLINED",
  "WITHDRAWN",
] as const

function statusLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ")
}

export default async function AdminEnrollmentPage() {
  const { applications, counts } = await getAdminEnrollmentPipeline()
  const tuitionPlans = await db.tuitionPlan.findMany({
    where: { isActive: true },
    orderBy: { weeklyRateCents: "asc" },
    select: {
      id: true,
      name: true,
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Enrollment"
        title="Waitlist, intake, and acceptance pipeline."
        description="Process parent applications, move statuses, accept enrollments, and provision admin access."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Open leads"
          value={String(counts.openLeads)}
          trend="Active"
          detail="Submitted, under-review, and tour-scheduled records."
        />
        <StatCard
          label="Accepted"
          value={String(counts.accepted)}
          trend="This cycle"
          detail="Accepted applications waiting on deposit completion."
        />
        <StatCard
          label="Waitlisted"
          value={String(counts.waitlisted)}
          trend="Pipeline"
          detail="Families waiting on classroom availability."
        />
        <StatCard
          label="Total applications"
          value={String(counts.total)}
          trend="All-time"
          detail="Historical submission volume tracked in the database."
        />
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">Invite an admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAdminInvite} className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              name="email"
              required
              placeholder="admin@abassadorscare.com"
              className="sm:max-w-sm"
            />
            <Button type="submit">Send admin invite</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">Enrollment pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{application.family}</span>
                        <span className="text-xs text-muted-foreground">{application.parentEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{application.child}</TableCell>
                    <TableCell>{application.program}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {statusLabel(application.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.submittedAt}</TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        <form action={updateApplicationStatus} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="applicationId" value={application.id} />
                          <select
                            name="status"
                            defaultValue={application.stage}
                            className="h-9 rounded-md border border-border/70 bg-background px-2 text-sm"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel(status)}
                              </option>
                            ))}
                          </select>
                          <Input
                            name="reviewNote"
                            placeholder="Internal note"
                            className="h-9 w-44"
                          />
                          <Button size="sm" type="submit" variant="outline">
                            Update
                          </Button>
                        </form>

                        {application.stage !== "ACCEPTED" ? (
                          <form action={acceptApplication} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="applicationId" value={application.id} />
                            <select
                              name="tuitionPlanId"
                              className="h-9 rounded-md border border-border/70 bg-background px-2 text-sm"
                            >
                              {tuitionPlans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name}
                                </option>
                              ))}
                            </select>
                            <Button size="sm" type="submit">
                              Accept + generate deposit
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
