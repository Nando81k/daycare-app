import { AdminAttendancePageView } from "@/components/admin/admin-attendance-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminAttendancePage() {
  const { attendanceBoard, children, reportBars } = await getAdminPortalData()
  return (
    <AdminAttendancePageView
      attendanceBoard={attendanceBoard}
      childRecords={children}
      attendanceBars={reportBars.attendance}
    />
  )
}
