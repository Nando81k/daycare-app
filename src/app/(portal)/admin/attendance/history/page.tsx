import { AdminAttendanceHistoryView } from "@/components/admin/admin-attendance-history-page"
import { getAttendanceHistoryGrid } from "@/lib/dal/attendance"

export default async function AdminAttendanceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const requested = Number(params.days)
  const daysBack =
    Number.isFinite(requested) && requested > 0 && requested <= 90
      ? Math.floor(requested)
      : 30

  const grid = await getAttendanceHistoryGrid(daysBack)

  return <AdminAttendanceHistoryView grid={grid} daysBack={daysBack} />
}
