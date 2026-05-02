import { AlertTriangle, CreditCard, Receipt, TrendingUp } from "lucide-react"

import { AdminCreateInvoiceForm } from "@/components/admin/billing/admin-create-invoice-form"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AdminBillingData } from "@/lib/dal/admin-billing"

export function AdminBillingPageView({ data }: { data: AdminBillingData }) {
  const { metrics, invoices, failedPayments, families } = data

  const outstandingByFamily = families.filter((family) => family.outstandingCents > 0)
  const dueInvoices = invoices.filter(
    (row) =>
      row.status === "open" ||
      row.status === "partially-paid" ||
      row.status === "failed"
  )
  const draftInvoices = invoices.filter((row) => row.status === "draft")
  const paidInvoices = invoices.filter(
    (row) => row.status === "paid" || row.status === "refunded"
  )

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Billing console
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Billing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outstanding balances, failed payments, and invoice creation.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Outstanding"
          value={metrics.outstandingTotal}
          supporting={`${metrics.outstandingFamilies} ${
            metrics.outstandingFamilies === 1 ? "family" : "families"
          }`}
          icon={CreditCard}
          tone={metrics.outstandingFamilies > 0 ? "warning" : "default"}
        />
        <Stat
          label="Drafts"
          value={String(metrics.draftCount)}
          supporting="Invoices not yet sent"
          icon={Receipt}
        />
        <Stat
          label="Paid this month"
          value={metrics.paidThisMonth}
          supporting={`${paidInvoices.length} invoices total`}
          icon={TrendingUp}
        />
        <Stat
          label="Failed payments"
          value={String(metrics.failedPaymentsCount)}
          supporting={
            metrics.failedPaymentsCount > 0
              ? "Reach out to families"
              : "No failed payments"
          }
          icon={AlertTriangle}
          tone={metrics.failedPaymentsCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,1fr)]">
        <SurfaceCard className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Outstanding balances
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              By family
            </h2>
          </div>
          {outstandingByFamily.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              All families are paid up. 🎉
            </p>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingByFamily.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell className="font-medium">{family.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {family.outstandingLabel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Create invoice
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              New invoice
            </h2>
          </div>
          <AdminCreateInvoiceForm families={families} />
        </SurfaceCard>
      </div>

      <Tabs defaultValue="due" className="gap-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="due">Due ({dueInvoices.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftInvoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="due">
          <InvoicesTable invoices={dueInvoices} emptyMessage="No invoices currently due." />
        </TabsContent>
        <TabsContent value="drafts">
          <InvoicesTable
            invoices={draftInvoices}
            emptyMessage="No drafts. Use the form above to create one."
          />
        </TabsContent>
        <TabsContent value="paid">
          <InvoicesTable
            invoices={paidInvoices}
            emptyMessage="No paid invoices yet."
            showPaidAt
          />
        </TabsContent>
        <TabsContent value="failed">
          <FailedPaymentsTable rows={failedPayments} />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}

function Stat({
  label,
  value,
  supporting,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string
  supporting?: string
  icon: typeof Receipt
  tone?: "default" | "warning"
}) {
  return (
    <div
      className={`rounded-[1rem] border px-4 py-3.5 ${
        tone === "warning"
          ? "border-amber-200/80 bg-amber-50/60"
          : "border-border/65 bg-background/88"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {supporting && (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {supporting}
        </p>
      )}
    </div>
  )
}

function InvoicesTable({
  invoices,
  emptyMessage,
  showPaidAt = false,
}: {
  invoices: AdminBillingData["invoices"]
  emptyMessage: string
  showPaidAt?: boolean
}) {
  if (invoices.length === 0) {
    return (
      <SurfaceCard className="py-12">
        <Empty className="border-0 bg-transparent">
          <EmptyHeader>
            <EmptyTitle>Nothing here yet</EmptyTitle>
            <EmptyDescription>{emptyMessage}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SurfaceCard>
    )
  }
  return (
    <SurfaceCard className="overflow-hidden">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Family</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>{showPaidAt ? "Paid" : "Due"}</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stripe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.familyName}</TableCell>
              <TableCell>{row.label}</TableCell>
              <TableCell className="text-muted-foreground">
                {showPaidAt ? row.paidAt ?? "—" : row.dueDate}
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
              <TableCell>
                <StatusBadge variant={row.statusTone}>{row.status}</StatusBadge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {row.stripePaymentIntentId
                  ? row.stripePaymentIntentId.slice(0, 14) + "…"
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SurfaceCard>
  )
}

function FailedPaymentsTable({
  rows,
}: {
  rows: AdminBillingData["failedPayments"]
}) {
  if (rows.length === 0) {
    return (
      <SurfaceCard className="py-12">
        <Empty className="border-0 bg-transparent">
          <EmptyHeader>
            <EmptyTitle>No failed payments</EmptyTitle>
            <EmptyDescription>
              When a Stripe charge fails, it&apos;ll show here so you can follow up
              with the family.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SurfaceCard>
    )
  }
  return (
    <SurfaceCard className="overflow-hidden">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Family</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Attempted</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Failure reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.familyName}</TableCell>
              <TableCell>{row.invoiceLabel}</TableCell>
              <TableCell className="text-muted-foreground">
                {row.attemptedAt}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.amount}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.failureReason ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SurfaceCard>
  )
}
