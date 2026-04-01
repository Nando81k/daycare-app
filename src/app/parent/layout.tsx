import { DashboardShell } from "@/components/shared/dashboard-shell"
import { requireRole } from "@/lib/dal/auth"

export const dynamic = "force-dynamic"

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("PARENT")

  return <DashboardShell kind="parent">{children}</DashboardShell>
}
