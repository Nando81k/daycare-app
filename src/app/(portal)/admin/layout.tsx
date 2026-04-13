import type * as React from "react"

import { PortalShell } from "@/components/layout/portal-shell"
import { requireRole } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN")

  return <PortalShell kind="admin">{children}</PortalShell>
}
