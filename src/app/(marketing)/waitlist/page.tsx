import { WaitlistPage as WaitlistPageView } from "@/components/marketing/waitlist-page"
import { waitlistPageContent } from "@/data/marketing"
import { createPageMetadata } from "@/lib/metadata"

const page = waitlistPageContent

export const metadata = createPageMetadata(page.metadata)

export default function WaitlistPage() {
  return <WaitlistPageView />
}
