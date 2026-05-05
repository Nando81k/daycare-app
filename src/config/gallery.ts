/**
 * Public marketing gallery — videos hosted on Vercel Blob, manually curated.
 * Titles and descriptions are content the site shows visitors; URLs come from
 * the upload script at scripts/upload-gallery-videos.mjs.
 */

export type GalleryVideo = {
  id: string
  title: string
  description: string
  src: string
  /** Optional poster image path served from /public. Falls back to the
   * first frame the browser pulls from the video. */
  poster?: string
  /** Approximate duration in seconds — drives the badge in the corner of
   * each tile. Optional; we just hide the badge if unset. */
  durationSec?: number
}

export const galleryVideos: GalleryVideo[] = [
  {
    id: "ac-classroom-tour",
    title: "Classroom moments",
    description:
      "A glimpse inside our preschool room — circle time, learning corners, and the daily rhythm that makes every child feel at home.",
    src: "https://d3svqqhkcw5chfto.public.blob.vercel-storage.com/gallery/527109673838899810.mp4",
  },
  {
    id: "ac-creative-play",
    title: "Creative play",
    description:
      "Hands-on activities, art tables, and the small wins our kids celebrate every day.",
    src: "https://d3svqqhkcw5chfto.public.blob.vercel-storage.com/gallery/4607783231897999184.mp4",
  },
  {
    id: "ac-outdoor-fun",
    title: "Outdoor fun",
    description:
      "Movement, music, and outdoor time — because growing minds need room to run.",
    src: "https://d3svqqhkcw5chfto.public.blob.vercel-storage.com/gallery/857347708405572095.mp4",
  },
  {
    id: "ac-learning-time",
    title: "Learning time",
    description:
      "Pre-K and Junior Kindergarten lessons that build curiosity, confidence, and friendships.",
    src: "https://d3svqqhkcw5chfto.public.blob.vercel-storage.com/gallery/6795061813633287218.mp4",
  },
  {
    id: "ac-everyday-joy",
    title: "Everyday joy",
    description:
      "The little moments — laughter, hugs, songs — that make Ambassadors Care feel like family.",
    src: "https://d3svqqhkcw5chfto.public.blob.vercel-storage.com/gallery/e3b48bcc-6096-4944-8161-060cbc08acc1.mp4",
  },
]
