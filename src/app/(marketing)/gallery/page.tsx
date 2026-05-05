import { GalleryPage as GalleryPageView } from "@/components/marketing/gallery-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata = createPageMetadata({
  title: "Gallery",
  description:
    "Watch real moments from Ambassadors Care classrooms — circle time, creative play, learning, and the everyday joy that makes our daycare feel like home.",
  pathname: "/gallery",
})

export default function GalleryPage() {
  return <GalleryPageView />
}
