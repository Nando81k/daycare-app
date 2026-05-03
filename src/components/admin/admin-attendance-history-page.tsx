"use client"

import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AttendanceHistoryGrid } from "@/lib/dal/attendance"
import { cn } from "@/lib/utils"

const RANGE_OPTIONS = [
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
]

export function AdminAttendanceHistoryView({
  grid,
  daysBack,
}: {
  grid: AttendanceHistoryGrid
  daysBack: number
}) {
  const overallRate =
    grid.overall.expected === 0
      ? 0
      : Math.round((grid.overall.present / grid.overall.expected) * 100)

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div>
        <Link
          href="/admin/attendance"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to today
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Attendance history
            </p>
            <h1 className="mt-1 font-heading text-3xl tracking-tight text-foreground">
              Last {daysBack} days
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {overallRate}% present-rate across all rooms · click any cell to
              jump into that day&apos;s roster.
            </p>
          </div>
          <RangeSelect daysBack={daysBack} />
        </div>
      </div>

      {grid.rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/60 bg-muted/15 px-4 py-6 text-center text-sm text-muted-foreground">
          No classrooms yet — add one to start tracking attendance.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-semibold">
                  Classroom
                </th>
                {grid.days.map((date) => (
                  <th
                    key={date}
                    className="px-1 py-2 text-center font-medium tabular-nums"
                    title={formatDateLabel(date)}
                  >
                    {formatDayLabel(date)}
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((row) => {
                const rate =
                  row.totals.expected === 0
                    ? 0
                    : Math.round((row.totals.present / row.totals.expected) * 100)
                return (
                  <tr key={row.classroomId} className="border-t border-border/40">
                    <td className="sticky left-0 z-10 bg-card px-3 py-2 text-sm font-medium text-foreground">
                      {row.classroomName}
                      <p className="text-xs font-normal text-muted-foreground">
                        Capacity {row.capacity}
                      </p>
                    </td>
                    {row.days.map((day) => (
                      <td key={day.date} className="px-0.5 py-1">
                        <Link
                          href={`/admin/attendance?date=${day.date}`}
                          title={`${formatDateLabel(day.date)} — ${day.present} present / ${day.absent} absent / ${day.scheduled} scheduled`}
                          className={cn(
                            "block h-7 w-full min-w-[1.6rem] rounded-sm transition-colors",
                            cellClasses(day.presentRate, day.expected),
                          )}
                        >
                          <span className="sr-only">
                            {formatDateLabel(day.date)}, {day.present} present
                          </span>
                        </Link>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right text-sm font-semibold tabular-nums text-foreground">
                      {rate}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.18em]">Legend</span>
        <Swatch tone="bg-emerald-500" label="≥ 90% present" />
        <Swatch tone="bg-emerald-300" label="70–89%" />
        <Swatch tone="bg-amber-300" label="40–69%" />
        <Swatch tone="bg-rose-300" label="< 40%" />
        <Swatch tone="bg-muted/50" label="No expected children" />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Expected" value={grid.overall.expected} />
        <Stat label="Present" value={grid.overall.present} accent="text-emerald-700" />
        <Stat label="Absent" value={grid.overall.absent} accent="text-rose-700" />
        <Stat label="Scheduled (no record)" value={grid.overall.scheduled} />
      </div>

      <p className="text-xs text-muted-foreground">
        &quot;Scheduled&quot; counts include children with no attendance row saved
        yet for that date — useful for spotting unmarked classrooms.
      </p>
    </PageShell>
  )
}

function RangeSelect({ daysBack }: { daysBack: number }) {
  return (
    <form action="/admin/attendance/history" className="flex items-center gap-2">
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Range
      </span>
      <Select
        name="days"
        defaultValue={String(daysBack)}
        onValueChange={(value) => {
          window.location.href = `/admin/attendance/history?days=${value}`
        }}
      >
        <SelectTrigger size="sm" className="h-9 w-28 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link
        href="/admin/attendance"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Today&apos;s roster
      </Link>
    </form>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="rounded-md border border-border/50 bg-card px-3 py-2.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5 text-lg font-semibold text-foreground", accent)}>
        {value}
      </p>
    </div>
  )
}

function Swatch({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-sm", tone)} aria-hidden />
      {label}
    </span>
  )
}

function cellClasses(rate: number, expected: number): string {
  if (expected === 0) return "bg-muted/40 hover:bg-muted/60"
  if (rate >= 0.9) return "bg-emerald-500 hover:bg-emerald-600"
  if (rate >= 0.7) return "bg-emerald-300 hover:bg-emerald-400"
  if (rate >= 0.4) return "bg-amber-300 hover:bg-amber-400"
  return "bg-rose-300 hover:bg-rose-400"
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map((p) => Number(p))
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function formatDayLabel(iso: string) {
  const [, , day] = iso.split("-").map((p) => Number(p))
  return String(day)
}
