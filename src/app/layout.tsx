import type { Metadata } from "next"

import { brandConfig } from "@/config/brand"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(brandConfig.siteUrl),
  title: {
    default: brandConfig.name,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  openGraph: {
    title: brandConfig.name,
    description: brandConfig.description,
    siteName: brandConfig.name,
    type: "website",
    url: brandConfig.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: brandConfig.name,
    description: brandConfig.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
