import { AdminClassroomsPageView } from "@/components/admin/admin-classrooms-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminClassroomsPage() {
  const { classrooms, attendanceBoard, reportBars } = await getAdminPortalData()
  return (
    <AdminClassroomsPageView
      classrooms={classrooms}
      attendanceBoard={attendanceBoard}
      attendanceBars={reportBars.attendance}
    />
  )
}
