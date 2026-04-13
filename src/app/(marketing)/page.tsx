import { HomePage as HomePageView } from "@/components/marketing/home-page"
import { homePageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = homePageContent

export const metadata = createPageMetadata(page.metadata)

export default function HomePage() {
  return <HomePageView />
}
