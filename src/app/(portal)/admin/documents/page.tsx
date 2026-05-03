import { AdminDocumentsPageView } from "@/components/admin/admin-documents-page"
import { getAdminPortalData } from "@/lib/dal/admin"

export default async function AdminDocumentsPage() {
  const { documents, familyHub } = await getAdminPortalData()
  return <AdminDocumentsPageView documents={documents} families={familyHub} />
}
