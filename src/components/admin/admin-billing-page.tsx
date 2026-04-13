"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminInvoiceEditor } from "@/components/admin/admin-invoice-editor"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminLabel, getFamilyBalanceVariant } from "@/components/admin/admin-status"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { buttonVariants } from "@/components/ui/button"
import { adminBalances, adminBillingPageContent, adminFamilyHub } from "@/data/admin"
import type { AdminTableColumn, AdminTableRow, FamilyBalancePreview, FamilyHubRecord } from "@/types/app"

const columns: AdminTableColumn[] = [
  { key: "family", header: "Family" },
  { key: "children", header: "Children" },
  { key: "dueDate", header: "Due" },
  { key: "totalDue", header: "Balance" },
  { key: "autopay", header: "Autopay" },
  { key: "status", header: "Status" },
]

function getRows(families: FamilyHubRecord[]): AdminTableRow[] {
  return families.map((family) => ({
    _id: family.id,
    family: {
      primary: family.familyName,
      secondary: family.primaryEmail,
    },
    children: family.childRecords.map((child) => child.name).join(", ") || "—",
    dueDate: family.balance?.dueDate ?? "—",
    totalDue: family.balance?.totalDue ?? "$0",
    autopay: family.balance ? formatAdminLabel(family.balance.autopayStatus) : "Manual",
    status: {
      label: formatAdminLabel(family.balance?.status ?? family.balanceStatus),
      variant: getFamilyBalanceVariant(family.balance?.status ?? family.balanceStatus),
    },
  }))
}

function SummaryFact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="surface-panel-quiet rounded-[1.1rem] px-4 py-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  )
}

export function AdminBillingPageView({
  balances = adminBalances,
  familyRecords = adminFamilyHub,
}: {
  balances?: FamilyBalancePreview[]
  familyRecords?: FamilyHubRecord[]
}) {
  const rows = getRows(familyRecords)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(familyRecords[0]?.id ?? null)
  const selectedFamily = familyRecords.find((family) => family.id === selectedFamilyId) ?? familyRecords[0] ?? null
  const dueCount = balances.filter((balance) => balance.status === "due").length
  const overdueCount = balances.filter((balance) => balance.status === "overdue").length
  const autopayEnabledCount = balances.filter((balance) => balance.autopayStatus === "enabled").length
  const totalDue = useMemo(
    () =>
      balances.reduce((sum, balance) => {
        const parsed = Number(balance.totalDue.replace(/[^0-9.]/g, "")) || 0
        return sum + parsed
      }, 0),
    [balances]
  )

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <AdminPageHeader
        eyebrow={adminBillingPageContent.eyebrow}
        title={adminBillingPageContent.title}
        description={adminBillingPageContent.description}
        actions={
          <>
            <Link href="/admin/families" className={buttonVariants({ variant: "outline" })}>
              Open child day
            </Link>
            <Link href="/admin/documents" className={buttonVariants({ variant: "ghost" })}>
              Documents
            </Link>
          </>
        }
      >
        <SummaryFact
          label="Collections"
          value={`$${totalDue.toLocaleString()}`}
          detail="The same due-state language parents see should drive school follow-up here."
        />
        <SummaryFact
          label="Due"
          value={String(dueCount)}
          detail="Families with active balances that are not overdue yet."
        />
        <SummaryFact
          label="Overdue"
          value={String(overdueCount)}
          detail="Families needing a firmer collections follow-up."
        />
        <SummaryFact
          label="Autopay"
          value={String(autopayEnabledCount)}
          detail="Families already set up for automatic payment processing."
        />
      </AdminPageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_23rem]">
        <AdminDataTable
          title="Family billing status"
          description="Search by family, child, due date, or balance status. This mirrors what the family sees, but from the school follow-up side."
          columns={columns}
          rows={rows}
          searchPlaceholder="Search family, child, or balance"
          searchKeys={["family", "children", "dueDate", "totalDue", "autopay", "status"]}
          onRowClick={(row) => setSelectedFamilyId(row._id as string)}
        />

        <div className="grid gap-6">
          {selectedFamily ? (
            <>
              <SurfaceCard density="compact" className="gap-4 px-5 py-5">
                <div className="space-y-1">
                  <p className="editorial-kicker">Selected family</p>
                  <h2 className="text-xl text-foreground">{selectedFamily.familyName}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Keep the school-side billing follow-up aligned with the status this family sees in their portal.
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="surface-panel-quiet rounded-[1rem] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedFamily.balance?.totalDue ?? "$0"}
                      </p>
                      <StatusBadge variant={getFamilyBalanceVariant(selectedFamily.balance?.status ?? selectedFamily.balanceStatus)}>
                        {formatAdminLabel(selectedFamily.balance?.status ?? selectedFamily.balanceStatus)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due {selectedFamily.balance?.dueDate ?? "when invoiced"} · {selectedFamily.balance?.invoiceCount ?? 0} invoice
                      {(selectedFamily.balance?.invoiceCount ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="surface-panel-quiet rounded-[1rem] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      Autopay {selectedFamily.balance?.autopayStatus === "enabled" ? "enabled" : "manual"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {selectedFamily.balance?.paymentMethodDetail ?? selectedFamily.balance?.method ?? "No payment method on file"}
                    </p>
                  </div>
                  <div className="surface-panel-quiet rounded-[1rem] px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">Children on this account</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {selectedFamily.childRecords.map((child) => child.name).join(", ") || "No children linked yet."}
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              <AdminInvoiceEditor familyId={selectedFamily.id} familyName={selectedFamily.familyName} />
            </>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}
