import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { PaymentTrendChart } from "@/components/shared/dashboard-charts"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import { getAdminRevenueSnapshot } from "@/lib/dal/billing"
import { formatCurrency } from "@/lib/format"

export default async function AdminReportsPage() {
  const [revenue, childrenCount, activeEnrollments, openApplications, outstandingInvoices] =
    await Promise.all([
      getAdminRevenueSnapshot(),
      db.child.count(),
      db.enrollment.count({ where: { status: "ACTIVE" } }),
      db.enrollmentApplication.count({
        where: {
          status: {
            in: ["SUBMITTED", "UNDER_REVIEW", "TOUR_SCHEDULED"],
          },
        },
      }),
      db.invoice.findMany({
        where: {
          status: {
            in: ["OPEN", "PARTIALLY_PAID", "UNCOLLECTIBLE"],
          },
        },
        include: {
          household: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 12,
      }),
    ])

  const chartData = revenue.monthly.map((row) => ({
    week: row.month,
    collected: row.collected,
    outstanding: row.outstanding,
  }))

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Reports"
        title="Revenue and operational momentum with live backend data."
        description="Track enrollment demand, active children, collections, and outstanding balances without leaving the admin workspace."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active children"
          value={String(childrenCount)}
          trend="Current"
          detail="Children currently tracked in household records."
        />
        <StatCard
          label="Active enrollments"
          value={String(activeEnrollments)}
          trend="Current"
          detail="Enrollment records marked active in the billing cycle."
        />
        <StatCard
          label="Open applications"
          value={String(openApplications)}
          trend="Pipeline"
          detail="Submitted, under review, and tour scheduled states."
        />
        <StatCard
          label="Collected this month"
          value={formatCurrency(revenue.overview.paidCents / 100)}
          trend="Cash received"
          detail="Paid invoice totals from the current month."
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PaymentTrendChart data={chartData} />
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Outstanding invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingInvoices.length ? (
                    outstandingInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.household.name}</TableCell>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          {formatCurrency(Math.max(invoice.totalCents - invoice.paidCents, 0) / 100)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {invoice.status.toLowerCase().replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No outstanding invoices right now.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
