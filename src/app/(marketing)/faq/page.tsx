import { FaqPage as FaqPageView } from "@/components/marketing/faq-page"
import { faqPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = faqPageContent

export const metadata = createPageMetadata(page.metadata)

export default function FaqPage() {
  return <FaqPageView />
}
