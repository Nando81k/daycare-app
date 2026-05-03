import { WaitlistPage as WaitlistPageView } from "@/components/marketing/waitlist-page"
import { waitlistPageContent } from "@/data/marketing"
import { getClassroomAvailability } from "@/lib/dal/public"
import { createPageMetadata } from "@/lib/metadata"

const page = waitlistPageContent

export const metadata = createPageMetadata(page.metadata)

// Capacity changes infrequently and the page is otherwise public/static, but
// we don't want the waitlist state to lag for long after an admin opens or
// fills a seat — revalidate every five minutes.
export const revalidate = 300

export default async function WaitlistPage() {
  const availability = await getClassroomAvailability()
  return <WaitlistPageView availability={availability} />
}
