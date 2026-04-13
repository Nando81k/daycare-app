"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <div className="linen-shell flex min-h-screen flex-col">
      {isHomePage ? null : <SiteHeader />}
      <div className={isHomePage ? "flex-1" : "flex-1 pt-24 md:pt-28"}>{children}</div>
      <SiteFooter />
    </div>
  )
}
