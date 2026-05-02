import { ParentFormsPageView } from "@/components/parent/parent-forms-page"
import { getParentDocuments } from "@/lib/dal/parent"

export default async function ParentDocumentsPage() {
  const documents = await getParentDocuments()
  return <ParentFormsPageView documents={documents} />
}
