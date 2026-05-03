import { AdminAttendancePageView } from "@/components/admin/admin-attendance-page"
import { getAdminPortalData } from "@/lib/dal/admin"
import { getAdminAttendanceForDate, todayIso } from "@/lib/dal/attendance"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const requested = params.date && ISO_DATE_PATTERN.test(params.date) ? params.date : undefined
  const date = requested ?? todayIso()

  const [attendance, portal] = await Promise.all([
    getAdminAttendanceForDate(date),
    getAdminPortalData(),
  ])

  return (
    <AdminAttendancePageView
      attendance={attendance}
      attendanceBars={portal.reportBars.attendance}
    />
  )
}
