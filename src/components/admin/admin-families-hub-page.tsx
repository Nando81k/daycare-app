"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRightIcon, XIcon } from "lucide-react"

import { AdminChildrenEditor } from "@/components/admin/admin-children-editor"
import { AdminDataTable } from "@/components/admin/admin-data-table"
import { AdminFamilyDetailPanel } from "@/components/admin/admin-family-detail-panel"
import { getFamilyBalanceVariant } from "@/components/admin/admin-status"
import { PageShell } from "@/components/shared/page-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatAdminLabel } from "@/components/admin/admin-status"
import {
  adminClassrooms,
  adminDocuments,
  adminFamilyHub,
  adminFamilyHubPageContent,
} from "@/data/admin"
import { cn } from "@/lib/utils"
import type {
  AdminTableColumn,
  AdminTableRow,
  ClassroomSummaryPreview,
  DocumentQueuePreview,
  FamilyHubRecord,
} from "@/types/app"

/* ── Family columns & row mapper ────────────────────────── */

const familyColumns: AdminTableColumn[] = [
  { key: "family", header: "Household" },
  { key: "children", header: "Children" },
  { key: "email", header: "Primary email" },
  { key: "balance", header: "Balance" },
  { key: "documentsDue", header: "Docs due", align: "end" },
  { key: "stage", header: "Enrollment stage" },
]

function getFamilyRows(families: FamilyHubRecord[]): AdminTableRow[] {
  return families.map((family) => ({
    _id: family.id,
    family: {
      primary: family.familyName,
      secondary: family.guardians.join(" · "),
    },
    children: family.childRecords.map((c) => c.name).join(", ") || "—",
    email: family.primaryEmail,
    balance: {
      label:
        family.balanceStatus.charAt(0).toUpperCase() +
        family.balanceStatus.slice(1),
      variant: getFamilyBalanceVariant(family.balanceStatus),
    },
    documentsDue: family.documentsDue,
    stage: family.enrollmentStage,
  }))
}

/* ── Quick-view chip & filter helpers ───────────────────── */

type QuickView = "all" | "balance" | "documents" | "onboarding"

function isOnboarding(stage: string) {
  return stage.toLowerCase() !== "enrolled"
}

/* ── Unified family hub view ────────────────────────────── */

export function AdminFamiliesHubPageView({
  familyRecords = adminFamilyHub,
  classrooms = adminClassrooms,
  documents = adminDocuments,
}: {
  familyRecords?: FamilyHubRecord[]
  classrooms?: ClassroomSummaryPreview[]
  documents?: DocumentQueuePreview[]
}) {
  const [selectedFamily, setSelectedFamily] = useState<FamilyHubRecord | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [view, setView] = useState<QuickView>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [balanceFilter, setBalanceFilter] = useState<string>("all")

  const selectedChild =
    selectedFamily?.childRecords.find((c) => c.id === selectedChildId) ?? null

  const balanceFollowUpCount = familyRecords.filter(
    (f) => f.balanceStatus !== "current",
  ).length
  const documentsDueCount = familyRecords.reduce(
    (sum, f) => sum + f.documentsDue,
    0,
  )
  const onboardingCount = familyRecords.filter((f) =>
    isOnboarding(f.enrollmentStage),
  ).length

  const stageOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const f of familyRecords) {
      if (f.enrollmentStage) seen.add(f.enrollmentStage)
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b))
  }, [familyRecords])

  const filteredFamilies = useMemo(() => {
    return familyRecords.filter((f) => {
      if (view === "balance" && f.balanceStatus === "current") return false
      if (view === "documents" && f.documentsDue === 0) return false
      if (view === "onboarding" && !isOnboarding(f.enrollmentStage)) return false
      if (stageFilter !== "all" && f.enrollmentStage !== stageFilter) return false
      if (balanceFilter !== "all" && f.balanceStatus !== balanceFilter) return false
      return true
    })
  }, [familyRecords, view, stageFilter, balanceFilter])

  const familyRows = getFamilyRows(filteredFamilies)

  const hasActiveFilters =
    view !== "all" || stageFilter !== "all" || balanceFilter !== "all"

  const clearFilters = () => {
    setView("all")
    setStageFilter("all")
    setBalanceFilter("all")
  }

  const QUICK_VIEWS: { key: QuickView; label: string; value: number }[] = [
    { key: "all", label: "Households", value: familyRecords.length },
    { key: "balance", label: "Balance follow-up", value: balanceFollowUpCount },
    { key: "documents", label: "Documents due", value: documentsDueCount },
    { key: "onboarding", label: "In onboarding", value: onboardingCount },
  ]

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {adminFamilyHubPageContent.eyebrow}
              </p>
              <CardTitle>{adminFamilyHubPageContent.title}</CardTitle>
              <CardDescription>{adminFamilyHubPageContent.description}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <Link
                href="/admin/enrollment"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                Enrollment pipeline
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
              <Link
                href="/admin/children"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                Child directory
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
              <Link
                href="/admin/documents"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                Document queue
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {QUICK_VIEWS.map((item) => {
              const active = view === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setView(item.key)}
                  aria-pressed={active}
                  className={cn(
                    "metric-chip flex flex-col items-start text-left transition-all",
                    "hover:border-primary/40 hover:bg-background",
                    active &&
                      "border-primary/70 bg-primary/4 shadow-[0_1px_0_rgba(0,0,0,0.02)] ring-1 ring-primary/20",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-1 text-lg font-semibold text-foreground">
                    {item.value}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <span className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Filter
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Stage</span>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger size="sm" className="h-8 min-w-32 rounded-md text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {stageOptions.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Balance</span>
          <Select value={balanceFilter} onValueChange={setBalanceFilter}>
            <SelectTrigger size="sm" className="h-8 min-w-28 rounded-md text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All balances</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="due">Due soon</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <XIcon className="h-3 w-3" />
            Clear filters
          </button>
        ) : null}
        <span className="ml-auto text-muted-foreground">
          {filteredFamilies.length} of {familyRecords.length} households
        </span>
      </div>

      <AdminDataTable
        title="Family directory"
        description="All households, children, and billing in one place."
        columns={familyColumns}
        rows={familyRows}
        searchPlaceholder="Search family, guardian, or email"
        searchKeys={["family", "children", "email", "stage"]}
        onRowClick={(row) => {
          const fam = familyRecords.find((f) => f.id === row._id)
          if (fam) {
            setSelectedFamily(fam)
            setSelectedChildId(null)
          }
        }}
      />

      {/* Family detail sheet */}
      <Sheet
        open={!!selectedFamily && !selectedChildId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFamily(null)
            setSelectedChildId(null)
          }
        }}
      >
        <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-2xl">
          {selectedFamily && (
            <>
              <SheetHeader className="gap-2 border-b border-border/60 px-5 pb-4 pt-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Household
                </p>
                <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                  <SheetTitle className="font-heading text-2xl tracking-tight text-foreground">
                    {selectedFamily.familyName}
                  </SheetTitle>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge variant={getFamilyBalanceVariant(selectedFamily.balanceStatus)}>
                      {formatAdminLabel(selectedFamily.balanceStatus)}
                    </StatusBadge>
                    <StatusBadge variant="info">
                      {selectedFamily.childRecords.length} child
                      {selectedFamily.childRecords.length === 1 ? "" : "ren"}
                    </StatusBadge>
                    {selectedFamily.documentsDue > 0 ? (
                      <StatusBadge variant="warning">
                        {selectedFamily.documentsDue} docs due
                      </StatusBadge>
                    ) : null}
                  </div>
                </div>
                <SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{selectedFamily.guardians.join(" · ")}</span>
                  <span aria-hidden>•</span>
                  <span>{selectedFamily.primaryEmail}</span>
                  <span aria-hidden>•</span>
                  <span>Stage · {formatAdminLabel(selectedFamily.enrollmentStage)}</span>
                </SheetDescription>
              </SheetHeader>
              <AdminFamilyDetailPanel
                family={selectedFamily}
                documents={documents.filter(
                  (d) => d.familyName === selectedFamily.familyName,
                )}
                onChildSelect={(childId) => setSelectedChildId(childId)}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Child profile dialog (deep-dive from family sheet) */}
      <Dialog
        open={!!selectedChild}
        onOpenChange={(open) => {
          if (!open) setSelectedChildId(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          {selectedChild && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedChild.name}</DialogTitle>
                <DialogDescription>
                  {selectedChild.ageLabel} · {selectedChild.classroom}
                </DialogDescription>
              </DialogHeader>
              <AdminChildrenEditor
                child={selectedChild}
                classrooms={classrooms}
                onClear={() => setSelectedChildId(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
