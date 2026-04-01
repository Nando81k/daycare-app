import { format } from "date-fns"

import { DashboardPageHeader } from "@/components/shared/dashboard-page-header"
import { StatCard } from "@/components/shared/stat-card"
import { PaymentMethodSetupCard } from "@/components/parent/payment-method-setup-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getParentBillingSnapshot } from "@/lib/dal/billing"
import { requireCurrentUser } from "@/lib/dal/auth"
import { formatCurrency } from "@/lib/format"

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ")
}

export default async function ParentBillingPage() {
  const user = await requireCurrentUser()

  if (!user.householdId) {
    return (
      <div className="flex flex-col gap-8">
        <DashboardPageHeader
          eyebrow="Billing"
          title="No household billing profile yet."
          description="Create an enrollment application first so billing can attach to your household."
        />
      </div>
    )
  }

  const snapshot = await getParentBillingSnapshot(user.householdId)

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        eyebrow="Billing"
        title="Statements and payment timing without guesswork."
        description="Live invoice records from your household profile. Autopay defaults to card once a payment method is saved."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Next draft"
          value={formatCurrency(snapshot.stats.nextDraftAmountCents / 100)}
          trend={
            snapshot.stats.nextDraftDate
              ? format(snapshot.stats.nextDraftDate, "MMM d")
              : "Not scheduled"
          }
          detail="Open invoices are shown below with real status updates."
        />
        <StatCard
          label="Open balance"
          value={formatCurrency(snapshot.stats.openBalanceCents / 100)}
          trend="Current"
          detail="Includes any unpaid or partially paid invoices."
        />
        <StatCard
          label="Year-to-date paid"
          value={formatCurrency(snapshot.stats.paidTotalCents / 100)}
          trend={`${snapshot.stats.invoiceCount} invoices`}
          detail="Collected totals from paid household invoices."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">
              Statement history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Issue date</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshot.invoices.length ? (
                    snapshot.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{format(invoice.issueDate, "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(invoice.dueDate, "MMM d, yyyy")}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalCents / 100)}</TableCell>
                        <TableCell>{formatCurrency(invoice.paidCents / 100)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full capitalize">
                            {statusLabel(invoice.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.status !== "PAID" && invoice.status !== "VOID" ? (
                            <form action="/api/stripe/manual-pay" method="POST">
                              <input type="hidden" name="invoiceId" value={invoice.id} />
                              <button
                                type="submit"
                                className="rounded-md border border-border/70 bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                              >
                                Pay now
                              </button>
                            </form>
                          ) : (
                            <span className="text-xs text-muted-foreground">No action</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        No invoices yet. A deposit invoice is generated when enrollment is accepted.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <PaymentMethodSetupCard />
      </div>
    </div>
  )
}
