import { ContactPage as ContactPageView } from "@/components/marketing/contact-page"
import { contactPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = contactPageContent

export const metadata = createPageMetadata(page.metadata)

export default function ContactPage() {
  return <ContactPageView />
}
