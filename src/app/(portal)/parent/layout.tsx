import type * as React from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { requireRole } from "@/lib/auth"
import { getParentSidebarBadges } from "@/lib/dal/sidebar-badges"

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PARENT")
  const badges = await getParentSidebarBadges(user.id)

  return (
    <PortalShell kind="parent" parentBadges={badges}>
      {children}
    </PortalShell>
  )
}
