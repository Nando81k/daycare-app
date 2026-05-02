import { AdminSecurityPage } from "@/components/admin/admin-security-page"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function AdminSecurityRoute() {
  const user = await requireRole("ADMIN")
  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorEnabledAt: true, twoFactorSecret: true },
  })

  return (
    <AdminSecurityPage
      isEnabled={Boolean(record?.twoFactorEnabledAt)}
      hasPendingSecret={Boolean(
        record?.twoFactorSecret && !record?.twoFactorEnabledAt
      )}
      enabledAtIso={record?.twoFactorEnabledAt?.toISOString() ?? null}
    />
  )
}
