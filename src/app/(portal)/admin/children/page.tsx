import { AdminChildrenPageView } from "@/components/admin/admin-children-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminChildrenPage() {
  const { familyHub, classrooms } = await getAdminPortalData()
  const childRecords = familyHub.flatMap((family) => family.childRecords)

  return (
    <AdminChildrenPageView childRecords={childRecords} classrooms={classrooms} />
  )
}
