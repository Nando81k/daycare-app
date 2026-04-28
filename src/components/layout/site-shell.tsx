import type * as React from "react"

import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getCurrentUser } from "@/lib/auth"

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="linen-shell flex min-h-screen flex-col">
      <SiteHeader currentUserRole={user?.role ?? null} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}
