import { ParentAttendancePageView } from "@/components/parent/parent-attendance-page"
import { getParentPortalData } from "@/lib/dal/parent"

export default async function ParentAttendancePage() {
  const data = await getParentPortalData()
  return (
    <ParentAttendancePageView
      attendanceHistory={data.attendanceHistory}
      childId={data.childProfile.id}
    />
  )
}
