"use client"

import Link from "next/link"
import { useState } from "react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  AdminReportsAgingBucket,
  AdminReportsData,
  AdminReportsFamilyInvoice,
  AdminReportsFamilyPayment,
  AdminReportsFamilyRow,
  AdminReportsRevenueMonth,
} from "@/lib/dal/admin-billing"

export function AdminReportsPageView({
  reports,
}: {
  reports: AdminReportsData
}) {
  const { kpis, familyRows } = reports
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = familyRows.find((row) => row.familyId === selectedId) ?? null

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow="Reports"
        title="Revenue & collections"
        description="Per-family revenue, outstanding balances, and recurring tuition health. Click a family to see their full breakdown."
        actions={
          <>
            <Link
              href="/admin/billing"
              className={buttonVariants({ variant: "outline" })}
            >
              Open billing
            </Link>
            <Link
              href="/admin/families"
              className={buttonVariants({ variant: "default" })}
            >
              Families
            </Link>
          </>
        }
      >
        <KpiChip
          label="MTD revenue"
          value={kpis.mtdRevenueLabel}
          hint={`YTD ${kpis.ytdRevenueLabel}`}
        />
        <KpiChip
          label="Outstanding"
          value={kpis.outstandingTotalLabel}
          hint={`${kpis.outstandingFamilies} ${kpis.outstandingFamilies === 1 ? "family" : "families"}`}
          tone={kpis.outstandingTotalCents > 0 ? "warning" : "ok"}
        />
        <KpiChip
          label="Projected MRR"
          value={kpis.projectedMrrLabel}
          hint={`${kpis.activePlansCount} active ${kpis.activePlansCount === 1 ? "plan" : "plans"}`}
        />
        <KpiChip
          label="Collection rate · this month"
          value={kpis.collectionRateLabel}
          hint={
            kpis.failedPaymentsCount > 0
              ? `${kpis.failedPaymentsCount} failed payment${kpis.failedPaymentsCount === 1 ? "" : "s"}`
              : "No failed payments"
          }
          tone={
            kpis.collectionRatePercent >= 80
              ? "ok"
              : kpis.collectionRatePercent >= 50
                ? "warning"
                : "danger"
          }
        />
      </AdminPageHeader>

      <section className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
            Per family
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Revenue & balance by family
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {familyRows.length}{" "}
            {familyRows.length === 1 ? "family" : "families"} ·{" "}
            {kpis.outstandingFamilies} with a balance.
          </p>
        </header>

        {familyRows.length === 0 ? (
          <SurfaceCard className="p-6 text-sm text-muted-foreground">
            No families yet. Approved enrollment applications will populate
            this section.
          </SurfaceCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {familyRows.map((row) => (
              <FamilyCard
                key={row.familyId}
                row={row}
                onSelect={() => setSelectedId(row.familyId)}
              />
            ))}
          </div>
        )}
      </section>

      <Sheet
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelectedId(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          {selected ? <FamilyDetailContent row={selected} /> : null}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}

function KpiChip({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string
  value: string
  hint?: string
  tone?: "neutral" | "ok" | "warning" | "danger"
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "danger"
        ? "text-destructive"
        : tone === "ok"
          ? "text-emerald-600"
          : "text-foreground"
  return (
    <div className="metric-chip">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${toneClass}`}>{value}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function MiniBarChart({ trend }: { trend: AdminReportsRevenueMonth[] }) {
  const max = Math.max(...trend.map((m) => m.amountCents), 1)
  return (
    <div className="flex items-end gap-1.5">
      {trend.map((month) => {
        const heightPct = (month.amountCents / max) * 100
        return (
          <div
            key={month.monthIso}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-12 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-brand-blue/80 transition-all"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
                aria-hidden
              />
            </div>
            <div className="text-[9px] text-muted-foreground">
              {month.monthLabel}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FamilyCard({
  row,
  onSelect,
}: {
  row: AdminReportsFamilyRow
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left"
      aria-label={`View revenue details for ${row.familyName}`}
    >
      <SurfaceCard className="space-y-3 p-5 transition hover:border-primary/40 hover:shadow-md">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {row.familyName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {row.childrenCount}{" "}
              {row.childrenCount === 1 ? "child" : "children"} ·{" "}
              {row.activePlanCount} active{" "}
              {row.activePlanCount === 1 ? "plan" : "plans"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {row.outstandingCents > 0 ? (
              <StatusBadge variant="warning">
                Owes {row.outstandingLabel}
              </StatusBadge>
            ) : (
              <StatusBadge variant="success">Up to date</StatusBadge>
            )}
            {row.hasFailedPayment ? (
              <StatusBadge variant="destructive">
                {row.failedPaymentCount} failed
              </StatusBadge>
            ) : null}
          </div>
        </header>

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <FamilyMetric label="MTD" value={row.mtdPaidLabel} />
          <FamilyMetric label="YTD" value={row.ytdPaidLabel} />
          <FamilyMetric label="Plan/mo" value={row.monthlyPlanLabel} />
        </dl>

        <MiniBarChart trend={row.trend} />

        <p className="text-xs text-muted-foreground">
          {row.lastPaymentAt
            ? `Last payment ${row.lastPaymentAt}`
            : "No payments yet"}{" "}
          · Click to view details →
        </p>
      </SurfaceCard>
    </button>
  )
}

function FamilyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  )
}

function FamilyDetailContent({ row }: { row: AdminReportsFamilyRow }) {
  const collectionPct =
    row.invoiceCount > 0
      ? Math.round((row.paidInvoiceCount / row.invoiceCount) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6 p-6">
      <SheetHeader className="space-y-1 p-0">
        <SheetTitle className="text-2xl">{row.familyName}</SheetTitle>
        <SheetDescription>
          {row.childrenCount}{" "}
          {row.childrenCount === 1 ? "child" : "children"} ·{" "}
          {row.activePlanCount} active{" "}
          {row.activePlanCount === 1 ? "plan" : "plans"} ·{" "}
          {row.outstandingCents > 0
            ? `Owes ${row.outstandingLabel}`
            : "All caught up"}
        </SheetDescription>
      </SheetHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailMetric label="MTD" value={row.mtdPaidLabel} />
        <DetailMetric label="YTD" value={row.ytdPaidLabel} />
        <DetailMetric label="Lifetime" value={row.lifetimePaidLabel} />
        <DetailMetric
          label="Plan / mo"
          value={row.monthlyPlanLabel}
          hint={row.activePlanCount === 0 ? "No recurring plan" : undefined}
        />
      </div>

      <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Collection rate{" "}
        <span className="font-semibold text-foreground">{collectionPct}%</span>{" "}
        · {row.paidInvoiceCount}/{row.invoiceCount} invoices paid
        {row.lastPaymentAt ? (
          <>
            {" "}
            · Last payment{" "}
            <span className="text-foreground">{row.lastPaymentAt}</span>
          </>
        ) : null}
      </div>

      <FullTrendChart trend={row.trend} />

      <FamilyAgingCard buckets={row.aging} />

      <FamilyInvoicesCard invoices={row.invoices} />

      <FamilyPaymentsCard payments={row.payments} />
    </div>
  )
}

function DetailMetric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function FullTrendChart({ trend }: { trend: AdminReportsRevenueMonth[] }) {
  const max = Math.max(...trend.map((m) => m.amountCents), 1)
  return (
    <SurfaceCard className="space-y-3 p-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Trend
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground">
          Revenue · last 6 months
        </h3>
      </header>
      <div className="flex items-end gap-2">
        {trend.map((month) => {
          const heightPct = (month.amountCents / max) * 100
          return (
            <div
              key={month.monthIso}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="text-[10px] font-medium tabular-nums text-foreground">
                {month.amountCents > 0 ? month.amountLabel : "—"}
              </div>
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-brand-blue/80"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                  aria-hidden
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {month.monthLabel}
              </div>
            </div>
          )
        })}
      </div>
    </SurfaceCard>
  )
}

function FamilyAgingCard({ buckets }: { buckets: AdminReportsAgingBucket[] }) {
  const total = buckets.reduce((sum, b) => sum + b.amountCents, 0)
  if (total === 0) {
    return (
      <SurfaceCard className="p-4">
        <p className="text-sm text-muted-foreground">
          No outstanding invoices.
        </p>
      </SurfaceCard>
    )
  }
  return (
    <SurfaceCard className="space-y-3 p-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Aging
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground">
          Outstanding by age
        </h3>
      </header>
      <div className="space-y-2">
        {buckets.map((bucket) => {
          const sharePct = total > 0 ? (bucket.amountCents / total) * 100 : 0
          const tone = bucketTone(bucket.key)
          return (
            <div key={bucket.key} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  {bucket.label}
                </span>
                <span className="tabular-nums text-foreground">
                  {bucket.amountLabel}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${tone}`}
                  style={{
                    width: `${Math.max(sharePct, bucket.amountCents > 0 ? 4 : 0)}%`,
                  }}
                  aria-hidden
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {bucket.countInvoices} invoice
                {bucket.countInvoices === 1 ? "" : "s"}
              </div>
            </div>
          )
        })}
      </div>
    </SurfaceCard>
  )
}

function bucketTone(key: AdminReportsAgingBucket["key"]) {
  switch (key) {
    case "current":
      return "bg-emerald-500/80"
    case "0-30":
      return "bg-amber-400/80"
    case "31-60":
      return "bg-orange-500/80"
    case "60+":
      return "bg-destructive/80"
  }
}

function FamilyInvoicesCard({
  invoices,
}: {
  invoices: AdminReportsFamilyInvoice[]
}) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Invoices
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground">
          All invoices ({invoices.length})
        </h3>
      </header>
      {invoices.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-foreground">
                  {invoice.label}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {invoice.dueDate}
                  {invoice.daysPastDue > 0 ? (
                    <span className="ml-1 text-destructive">
                      · {invoice.daysPastDue}d late
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {invoice.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={invoice.statusTone}>
                    {invoice.status}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SurfaceCard>
  )
}

function FamilyPaymentsCard({
  payments,
}: {
  payments: AdminReportsFamilyPayment[]
}) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Payments
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground">
          Payment history ({payments.length})
        </h3>
      </header>
      {payments.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">
          No payment activity yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {payment.paidAt}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.channelLabel ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {payment.amount}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge
                      variant={
                        payment.status === "succeeded"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {payment.status === "succeeded" ? "Paid" : "Failed"}
                    </StatusBadge>
                    {payment.failureReason ? (
                      <span className="text-[10px] text-destructive">
                        {payment.failureReason}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SurfaceCard>
  )
}
