import type { Metadata } from "next"

import { brandConfig } from "@/config/brand"
import type { SiteMetadata } from "@/types/app"

export function createPageMetadata({ title, description, pathname }: SiteMetadata): Metadata {
  const url = pathname ? `${brandConfig.siteUrl}${pathname}` : brandConfig.siteUrl

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      siteName: brandConfig.name,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}
