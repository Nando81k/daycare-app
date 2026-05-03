import type { AttendanceHistoryDot } from "@/lib/dal/attendance"
import { cn } from "@/lib/utils"

const TONE: Record<NonNullable<AttendanceHistoryDot["status"]>, string> = {
  present: "bg-emerald-500",
  absent: "bg-rose-500",
  scheduled: "bg-amber-400",
}

/**
 * Compact 14-day attendance history strip — one dot per day, oldest on the
 * left. Empty days render as a hollow placeholder so the cadence stays
 * readable when a child has gaps in their record.
 */
export function AttendanceHistoryStrip({
  history,
  className,
}: {
  history: AttendanceHistoryDot[]
  className?: string
}) {
  if (history.length === 0) return null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>Last {history.length} days</span>
        <span className="flex items-center gap-2 normal-case tracking-normal text-[0.68rem] font-medium">
          <Legend tone="present" label="Present" />
          <Legend tone="absent" label="Absent" />
          <Legend tone="scheduled" label="Scheduled" />
        </span>
      </div>
      <div className="flex items-center gap-1">
        {history.map((dot) => (
          <span
            key={dot.date}
            title={`${formatLabel(dot.date)} · ${dot.status ?? "no record"}`}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              dot.status
                ? TONE[dot.status]
                : "border border-dashed border-border/60 bg-transparent",
            )}
          />
        ))}
      </div>
    </div>
  )
}

function Legend({
  tone,
  label,
}: {
  tone: NonNullable<AttendanceHistoryDot["status"]>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className={cn("h-2 w-2 rounded-full", TONE[tone])} aria-hidden />
      {label}
    </span>
  )
}

function formatLabel(iso: string) {
  const [year, month, day] = iso.split("-").map((p) => Number(p))
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
