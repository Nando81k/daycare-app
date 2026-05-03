import { AdminClassroomsPageView } from "@/components/admin/admin-classrooms-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminClassroomsPage() {
  const { classrooms, attendanceBoard, reportBars, familyHub } = await getAdminPortalData()
  const childRecords = familyHub.flatMap((family) => family.childRecords)
  return (
    <AdminClassroomsPageView
      classrooms={classrooms}
      attendanceBoard={attendanceBoard}
      attendanceBars={reportBars.attendance}
      childRecords={childRecords}
    />
  )
}
