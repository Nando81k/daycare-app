import { DashboardShell } from "@/components/shared/dashboard-shell"
import { requireRole } from "@/lib/dal/auth"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("ADMIN")

  return <DashboardShell kind="admin">{children}</DashboardShell>
}
