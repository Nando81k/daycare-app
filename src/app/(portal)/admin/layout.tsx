import type * as React from "react"
import { cookies } from "next/headers"

import { AdminShell } from "@/components/admin/shell/admin-shell"
import { requireRole } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN")

  // Persist sidebar collapsed/expanded state across reloads via the cookie that
  // ui/sidebar.tsx writes on toggle (`sidebar_state`).
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("sidebar_state")?.value
  const defaultSidebarOpen = cookieValue === undefined ? true : cookieValue === "true"

  return <AdminShell defaultSidebarOpen={defaultSidebarOpen}>{children}</AdminShell>
}
