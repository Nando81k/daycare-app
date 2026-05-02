import { AdminStaffPageView } from "@/components/admin/admin-staff-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminStaffPage() {
  const { staffProfiles, classrooms } = await getAdminPortalData()
  return (
    <AdminStaffPageView staffProfiles={staffProfiles} classrooms={classrooms} />
  )
}
