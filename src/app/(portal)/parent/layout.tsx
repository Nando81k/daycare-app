import type * as React from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { requireRole } from "@/lib/auth"

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PARENT")

  return <PortalShell kind="parent">{children}</PortalShell>
}
