import { AboutPage as AboutPageView } from "@/components/marketing/about-page"
import { aboutPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = aboutPageContent

export const metadata = createPageMetadata(page.metadata)

export default function AboutPage() {
  return <AboutPageView />
}
