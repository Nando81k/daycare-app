"use client"

import { useActionState, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pause, Play, Plus, Square } from "lucide-react"

import { setTuitionPlanStatus } from "@/app/actions/admin"
import {
  TuitionPlanDrawer,
  type TuitionPlanDrawerMode,
} from "@/components/admin/billing/tuition-plan-drawer"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { initialMutationState } from "@/lib/action-state"
import type {
  AdminProgramRateOption,
  AdminTuitionFamilyOption,
  AdminTuitionPlanRow,
} from "@/lib/dal/admin-billing"

export function TuitionPlansSection({
  rows,
  families,
  programRates,
}: {
  rows: AdminTuitionPlanRow[]
  families: AdminTuitionFamilyOption[]
  programRates: AdminProgramRateOption[]
}) {
  const [drawerMode, setDrawerMode] = useState<TuitionPlanDrawerMode | null>(
    null,
  )
  const drawerOpen = drawerMode !== null

  return (
    <SurfaceCard className="space-y-4 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">
            Recurring billing
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">
            Tuition plans
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One plan per child × program-schedule. The cron emits the next
            invoice on each plan&apos;s invoice day.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setDrawerMode({ kind: "create" })}
          disabled={families.length === 0 || programRates.length === 0}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New plan
        </Button>
      </header>

      {programRates.length === 0 ? (
        <Empty className="border-0 bg-transparent py-8">
          <EmptyHeader>
            <EmptyTitle>No program rates yet</EmptyTitle>
            <EmptyDescription>
              Add programs, schedules, and rates from{" "}
              <a className="underline" href="/admin/rooms">
                /admin/rooms
              </a>{" "}
              before creating tuition plans.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : rows.length === 0 ? (
        <Empty className="border-0 bg-transparent py-8">
          <EmptyHeader>
            <EmptyTitle>No tuition plans yet</EmptyTitle>
            <EmptyDescription>
              Create a plan to start auto-generating monthly invoices for an
              enrolled child.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Family · Child</TableHead>
              <TableHead>Program · Schedule</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{row.familyName}</div>
                  <div className="text-xs text-muted-foreground">{row.childName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{row.programName}</div>
                  <div className="text-xs text-muted-foreground">{row.scheduleName}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.rateLabel}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  Day {row.invoiceDay} · due +{row.dueDayOffset}
                  <br />
                  {row.invoiceCount} invoice{row.invoiceCount === 1 ? "" : "s"}
                </TableCell>
                <TableCell>
                  <StatusBadge variant={statusToTone(row.status)}>
                    {row.status.toLowerCase()}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    row={row}
                    onEdit={() => setDrawerMode({ kind: "edit", plan: row })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TuitionPlanDrawer
        open={drawerOpen}
        onOpenChange={(next) => {
          if (!next) setDrawerMode(null)
        }}
        mode={drawerMode}
        families={families}
        programRates={programRates}
      />
    </SurfaceCard>
  )
}

function statusToTone(
  status: AdminTuitionPlanRow["status"],
): "success" | "warning" | "secondary" {
  if (status === "ACTIVE") return "success"
  if (status === "PAUSED") return "warning"
  return "secondary"
}

function RowActions({
  row,
  onEdit,
}: {
  row: AdminTuitionPlanRow
  onEdit: () => void
}) {
  const router = useRouter()
  const [, formAction] = useActionState(setTuitionPlanStatus, initialMutationState)
  const [isPending, startTransition] = useTransition()

  function setStatus(status: "ACTIVE" | "PAUSED" | "ENDED") {
    const fd = new FormData()
    fd.set("planId", row.id)
    fd.set("status", status)
    startTransition(() => {
      formAction(fd)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      {row.status === "ACTIVE" ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Pause plan for ${row.childName}`}
          disabled={isPending}
          onClick={() => setStatus("PAUSED")}
        >
          <Pause className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      {row.status === "PAUSED" ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Reactivate plan for ${row.childName}`}
          disabled={isPending}
          onClick={() => setStatus("ACTIVE")}
        >
          <Play className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      {row.status !== "ENDED" ? (
        <Button
          size="sm"
          variant="ghost"
          aria-label={`End plan for ${row.childName}`}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
          onClick={() => setStatus("ENDED")}
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
