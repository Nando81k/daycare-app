import { AdminFamiliesHubPageView } from "@/components/admin/admin-families-hub-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminFamiliesPage() {
  const { familyHub, classrooms, documents } = await getAdminPortalData()

  return (
    <AdminFamiliesHubPageView
      familyRecords={familyHub}
      classrooms={classrooms}
      documents={documents}
    />
  )
}
