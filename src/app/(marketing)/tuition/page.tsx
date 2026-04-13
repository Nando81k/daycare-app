import { TuitionPage as TuitionPageView } from "@/components/marketing/tuition-page"
import { tuitionPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = tuitionPageContent

export const metadata = createPageMetadata(page.metadata)

export default function TuitionPage() {
  return <TuitionPageView />
}
