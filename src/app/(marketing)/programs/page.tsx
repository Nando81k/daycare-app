import { ProgramsPage as ProgramsPageView } from "@/components/marketing/programs-page"
import { programsPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = programsPageContent

export const metadata = createPageMetadata(page.metadata)

export default function ProgramsPage() {
  return <ProgramsPageView />
}
