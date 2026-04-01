import { runMonthlyBillingCycle } from "@/app/actions/billing"
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { PaymentTrendChart } from "@/components/shared/dashboard-charts"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAdminRevenueSnapshot, getBillingRecordsTable } from "@/lib/dal/billing"
import { formatCurrency } from "@/lib/format"

export default async function AdminBillingPage() {
  const [revenue, records] = await Promise.all([
    getAdminRevenueSnapshot(),
    getBillingRecordsTable(),
  ])

  const chartData = revenue.monthly.map((row) => ({
    week: row.month,
    collected: row.collected,
    outstanding: row.outstanding,
  }))

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Billing"
        title="Payments, due dates, and monthly cash flow."
        description="Generate billing cycles, monitor collections, and reconcile outstanding balances from one place."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Invoices this month"
          value={String(revenue.overview.invoiceCount)}
          trend="Current cycle"
          detail="Database-backed monthly invoice volume."
        />
        <StatCard
          label="Total billed"
          value={formatCurrency(revenue.overview.totalCents / 100)}
          trend="Month to date"
          detail="Gross billed amount before adjustments."
        />
        <StatCard
          label="Collected"
          value={formatCurrency(revenue.overview.paidCents / 100)}
          trend="Settled"
          detail="Sum of paid invoice totals this month."
        />
        <StatCard
          label="Failed payments"
          value={String(revenue.overview.failedPayments)}
          trend="Needs follow-up"
          detail="Stripe failures logged from invoice attempts."
        />
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="font-heading text-2xl tracking-tight">Run monthly billing</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={runMonthlyBillingCycle} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input type="month" name="billingMonth" className="sm:max-w-60" />
            <Button type="submit">Generate invoices</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <PaymentTrendChart data={chartData} />
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Family payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Family</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length ? (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.family}</TableCell>
                        <TableCell>{formatCurrency(record.amount)}</TableCell>
                        <TableCell>{record.method}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {record.status.toLowerCase().replaceAll("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.dueDate}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No billing records yet.
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
