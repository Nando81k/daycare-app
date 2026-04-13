import Link from "next/link"
import { Clock3Icon, DoorOpenIcon, NotebookPenIcon } from "lucide-react"

import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { getAttendanceBadgeVariant } from "@/components/parent/parent-status"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { SurfaceCard } from "@/components/shared/surface-card"
import { TableSurface } from "@/components/shared/table-surface"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { parentAttendanceHistory, parentAttendancePageContent } from "@/data/parent"
import type { ParentAttendanceRecordPreview } from "@/types/app"

export function ParentAttendancePageView({
  attendanceHistory = parentAttendanceHistory,
  childId = "ellie-harper",
}: {
  attendanceHistory?: ParentAttendanceRecordPreview[]
  childId?: string
}) {
  const presentDays = attendanceHistory.filter((record) => record.status === "present").length
  const scheduledDays = attendanceHistory.filter((record) => record.status === "scheduled").length

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentAttendancePageContent.eyebrow}
        title={parentAttendancePageContent.title}
        description={parentAttendancePageContent.description}
        actions={
          <>
            <Link href={`/parent/child/${childId}`} className={buttonVariants({ variant: "outline" })}>
              Child profile
            </Link>
            <Link href="/parent/calendar" className={buttonVariants({ variant: "ghost" })}>
              Calendar
            </Link>
          </>
        }
      >
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Present days shown</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{presentDays}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Scheduled absences</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{scheduledDays}</p>
        </div>
        <div className="metric-chip">
          <p className="text-sm font-medium text-muted-foreground">Latest check-in</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{attendanceHistory[0]?.checkIn}</p>
        </div>
      </ParentPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <Clock3Icon className="size-5 text-primary" />
          <h2 className="text-xl text-foreground">Arrival timing</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Attendance stays parent-readable by showing check-in and pickup without turning the page into an admin board.
          </p>
        </SurfaceCard>
        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <DoorOpenIcon className="size-5 text-primary" />
          <h2 className="text-xl text-foreground">Pickup history</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            End-of-day timing helps families confirm routine changes and who handled pickup when plans shifted.
          </p>
        </SurfaceCard>
        <SurfaceCard density="compact" className="gap-3 px-5 py-5">
          <NotebookPenIcon className="size-5 text-primary" />
          <h2 className="text-xl text-foreground">Context notes</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Short notes keep planned absences and unusual days visible without adding operational clutter.
          </p>
        </SurfaceCard>
      </div>

      <TableSurface
        title="Attendance history"
        description="Recent attendance records for Ellie Harper."
        size="compact"
      >
        <Table className="min-w-full text-left text-sm">
          <TableHeader className="bg-muted/60 text-muted-foreground [&_tr]:border-border/60">
            <TableRow>
              <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Date</TableHead>
              <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Check-in</TableHead>
              <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Pickup</TableHead>
              <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Status</TableHead>
              <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceHistory.map((record) => (
              <TableRow key={record.dateLabel} className="border-border/50">
                <TableCell className="px-4 py-3 text-foreground">{record.dateLabel}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{record.checkIn ?? "—"}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{record.checkOut ?? "—"}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusBadge variant={getAttendanceBadgeVariant(record.status)}>
                    {record.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">{record.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableSurface>
    </PageShell>
  )
}
